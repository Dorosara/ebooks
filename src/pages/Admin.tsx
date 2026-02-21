import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Image as ImageIcon, Wand2, Video, Loader2, AlertTriangle } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

export function Admin() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [bookFile, setBookFile] = useState<File | null>(null);

  // AI Generation State
  const [generatingImage, setGeneratingImage] = useState(false);
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [generatedImageBase64, setGeneratedImageBase64] = useState<string | null>(null);

  const [generatingVideo, setGeneratingVideo] = useState(false);
  const [videoPrompt, setVideoPrompt] = useState('');
  const [videoAspectRatio, setVideoAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/login');
      } else {
        // Check if user is admin
        supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
          .then(({ data, error }) => {
            if (error || data?.role !== 'admin') {
              setIsAdmin(false);
            } else {
              setIsAdmin(true);
            }
          });
      }
    }
  }, [user, authLoading, navigate]);

  if (authLoading || isAdmin === null) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-violet-500"></div>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 text-center px-4">
        <div className="p-4 rounded-full bg-red-500/10 text-red-500 mb-2">
          <AlertTriangle className="h-12 w-12" />
        </div>
        <h1 className="text-3xl font-bold text-white">Access Denied</h1>
        <p className="text-slate-400 max-w-md">
          You do not have permission to access the admin dashboard. Only authorized administrators can upload books.
        </p>
        <Button onClick={() => navigate('/')} variant="secondary" className="mt-4">
          Return Home
        </Button>
      </div>
    );
  }

  const handleGenerateImage = async () => {
    // ... (same as before)
    if (!imagePrompt) {
      setMessage('Please enter a prompt for the image.');
      return;
    }
    setGeneratingImage(true);
    setMessage('');

    try {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await window.aistudio.openSelectKey();
      }

      const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error('API Key not found. Please select a key.');

      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: [{ text: imagePrompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: '3:4',
            imageSize: imageSize,
          },
        },
      });

      let foundImage = false;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          const base64String = part.inlineData.data;
          const imageUrl = `data:image/png;base64,${base64String}`;
          setGeneratedImageBase64(imageUrl);
          
          const res = await fetch(imageUrl);
          const blob = await res.blob();
          const file = new File([blob], 'generated-cover.png', { type: 'image/png' });
          setCoverFile(file);
          foundImage = true;
          break;
        }
      }

      if (!foundImage) throw new Error('No image generated.');
      setMessage('Cover generated successfully!');

    } catch (error: any) {
      console.error(error);
      setMessage(`Image Generation Error: ${error.message}`);
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleGenerateVideo = async () => {
    // ... (same as before)
    if (!coverFile && !generatedImageBase64) {
      setMessage('Please upload or generate a cover image first to animate.');
      return;
    }
    setGeneratingVideo(true);
    setMessage('');

    try {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await window.aistudio.openSelectKey();
      }

      const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error('API Key not found. Please select a key.');

      const ai = new GoogleGenAI({ apiKey });

      let imageBytes = '';
      if (generatedImageBase64) {
        imageBytes = generatedImageBase64.split(',')[1];
      } else if (coverFile) {
        const buffer = await coverFile.arrayBuffer();
        imageBytes = btoa(
          new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
      }

      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: videoPrompt || 'Animate this book cover cinematically',
        image: {
          imageBytes: imageBytes,
          mimeType: 'image/png',
        },
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: videoAspectRatio,
        }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (!videoUri) throw new Error('No video URI returned.');

      const videoResponse = await fetch(videoUri, {
        method: 'GET',
        headers: {
          'x-goog-api-key': apiKey,
        },
      });

      if (!videoResponse.ok) throw new Error('Failed to download generated video.');

      const videoBlob = await videoResponse.blob();
      const videoUrl = URL.createObjectURL(videoBlob);
      setGeneratedVideoUrl(videoUrl);
      setMessage('Video generated successfully!');

    } catch (error: any) {
      console.error(error);
      setMessage(`Video Generation Error: ${error.message}`);
    } finally {
      setGeneratingVideo(false);
    }
  };

  const handleUpload = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);
    setMessage('');

    try {
      if (!coverFile || !bookFile) {
        throw new Error('Please select both a cover image and a book file.');
      }

      // 1. Upload Cover
      const coverPath = `covers/${Date.now()}_${coverFile.name.replace(/\s/g, '_')}`;
      const { error: coverError } = await supabase.storage
        .from('books')
        .upload(coverPath, coverFile);

      if (coverError) throw new Error(`Cover upload failed: ${coverError.message}`);

      const { data: { publicUrl: coverUrl } } = supabase.storage
        .from('books')
        .getPublicUrl(coverPath);

      // 2. Upload Book File
      const bookPath = `files/${Date.now()}_${bookFile.name.replace(/\s/g, '_')}`;
      const { error: bookError } = await supabase.storage
        .from('books')
        .upload(bookPath, bookFile);

      if (bookError) throw new Error(`Book upload failed: ${bookError.message}`);

      const { data: { publicUrl: fileUrl } } = supabase.storage
        .from('books')
        .getPublicUrl(bookPath);

      // 3. Insert into Database
      const { error: dbError } = await supabase
        .from('books')
        .insert([
          {
            title,
            author,
            description,
            price: parseFloat(price),
            cover_url: coverUrl,
            file_url: fileUrl,
            user_id: user!.id,
          },
        ]);

      if (dbError) throw new Error(`Database insert failed: ${dbError.message}`);

      setMessage('Success: Book uploaded successfully!');
      setTitle('');
      setAuthor('');
      setDescription('');
      setPrice('');
      setCoverFile(null);
      setBookFile(null);
      setGeneratedImageBase64(null);
      setGeneratedVideoUrl(null);
      
      const coverInput = document.getElementById('cover-upload') as HTMLInputElement;
      if (coverInput) coverInput.value = '';
      const bookInput = document.getElementById('book-upload') as HTMLInputElement;
      if (bookInput) bookInput.value = '';

    } catch (error: any) {
      console.error(error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <div className="px-4 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium">
          Admin Access Granted
        </div>
      </div>
      
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left Column: Upload Form */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-sm p-8 shadow-xl h-fit">
          <h2 className="mb-6 text-xl font-semibold text-white flex items-center gap-2">
            <Upload className="h-5 w-5 text-violet-500" />
            Upload New Book
          </h2>
          
          <form onSubmit={handleUpload} className="space-y-6">
            <Input
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="bg-slate-800 border-white/10 text-white placeholder:text-slate-500"
            />
            <Input
              label="Author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              required
              className="bg-slate-800 border-white/10 text-white placeholder:text-slate-500"
            />
            <div className="space-y-1">
              <label className="text-sm font-medium leading-none text-slate-300">
                Description
              </label>
              <textarea
                className="flex min-h-[100px] w-full rounded-md border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white ring-offset-slate-950 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <Input
              label="Price ($)"
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              className="bg-slate-800 border-white/10 text-white placeholder:text-slate-500"
            />

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none text-slate-300">Cover Image</label>
                <div className="flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-white/10 bg-slate-800/50 p-6 hover:bg-slate-800 transition-colors">
                    {generatedImageBase64 ? (
                      <img src={generatedImageBase64} alt="Generated Cover" className="h-32 object-contain mb-2 rounded-md shadow-lg" />
                    ) : (
                      <ImageIcon className="mb-2 h-8 w-8 text-slate-500" />
                    )}
                    <label
                      htmlFor="cover-upload"
                      className="cursor-pointer text-sm font-medium text-violet-400 hover:text-violet-300"
                    >
                      <span>{coverFile ? 'Change Cover' : 'Upload Cover'}</span>
                      <input
                        id="cover-upload"
                        name="cover-upload"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) => {
                          setCoverFile(e.target.files?.[0] || null);
                          setGeneratedImageBase64(null);
                        }}
                      />
                    </label>
                    {coverFile && (
                      <p className="mt-2 text-xs text-green-400 truncate max-w-full">{coverFile.name}</p>
                    )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none text-slate-300">Book File</label>
                <div className="flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-white/10 bg-slate-800/50 p-6 hover:bg-slate-800 transition-colors">
                    <FileText className="mb-2 h-8 w-8 text-slate-500" />
                    <label
                      htmlFor="book-upload"
                      className="cursor-pointer text-sm font-medium text-violet-400 hover:text-violet-300"
                    >
                      <span>Upload PDF/EPUB</span>
                      <input
                        id="book-upload"
                        name="book-upload"
                        type="file"
                        accept=".pdf,.epub"
                        className="sr-only"
                        onChange={(e) => setBookFile(e.target.files?.[0] || null)}
                      />
                    </label>
                    {bookFile ? (
                      <p className="mt-2 text-xs text-green-400 truncate max-w-full">{bookFile.name}</p>
                    ) : (
                      <p className="mt-1 text-xs text-slate-500">PDF/EPUB up to 50MB</p>
                    )}
                </div>
              </div>
            </div>

            {message && (
              <div className={`rounded-md p-4 text-sm ${message.includes('Success') || message.includes('successfully') ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                {message}
              </div>
            )}

            <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-500 text-white" size="lg" isLoading={uploading}>
              <Upload className="mr-2 h-4 w-4" />
              {uploading ? 'Uploading...' : 'Upload Book'}
            </Button>
          </form>
        </div>

        {/* Right Column: AI Tools */}
        <div className="space-y-8">
          {/* AI Cover Generator */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-sm p-8 shadow-xl">
            <div className="flex items-center gap-2 mb-6">
              <Wand2 className="h-6 w-6 text-violet-500" />
              <h2 className="text-xl font-semibold text-white">AI Cover Generator</h2>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Prompt</label>
                <textarea
                  className="w-full rounded-md border border-white/10 bg-slate-800 p-2 text-sm text-white placeholder:text-slate-500 focus:ring-violet-500"
                  placeholder="Describe your book cover..."
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Size</label>
                <select 
                  className="w-full rounded-md border border-white/10 bg-slate-800 p-2 text-sm text-white focus:ring-violet-500"
                  value={imageSize}
                  onChange={(e) => setImageSize(e.target.value as any)}
                >
                  <option value="1K">1K (Standard)</option>
                  <option value="2K">2K (High Res)</option>
                  <option value="4K">4K (Ultra Res)</option>
                </select>
              </div>

              <Button 
                onClick={handleGenerateImage} 
                className="w-full border-white/10 text-slate-200 hover:bg-white/5 hover:text-white" 
                variant="outline"
                isLoading={generatingImage}
              >
                {generatingImage ? 'Generating...' : 'Generate Cover'}
              </Button>
            </div>
          </div>

          {/* AI Video Animator */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-sm p-8 shadow-xl">
            <div className="flex items-center gap-2 mb-6">
              <Video className="h-6 w-6 text-violet-500" />
              <h2 className="text-xl font-semibold text-white">Animate Cover (Veo)</h2>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-slate-400">
                Generate a video trailer from your selected cover image.
              </p>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Animation Prompt</label>
                <textarea
                  className="w-full rounded-md border border-white/10 bg-slate-800 p-2 text-sm text-white placeholder:text-slate-500 focus:ring-violet-500"
                  placeholder="e.g., Cinematic camera pan, particles floating..."
                  value={videoPrompt}
                  onChange={(e) => setVideoPrompt(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Aspect Ratio</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                    <input 
                      type="radio" 
                      name="aspect" 
                      value="16:9" 
                      checked={videoAspectRatio === '16:9'}
                      onChange={() => setVideoAspectRatio('16:9')}
                      className="text-violet-500 focus:ring-violet-500 bg-slate-800 border-white/10"
                    />
                    Landscape (16:9)
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                    <input 
                      type="radio" 
                      name="aspect" 
                      value="9:16" 
                      checked={videoAspectRatio === '9:16'}
                      onChange={() => setVideoAspectRatio('9:16')}
                      className="text-violet-500 focus:ring-violet-500 bg-slate-800 border-white/10"
                    />
                    Portrait (9:16)
                  </label>
                </div>
              </div>

              <Button 
                onClick={handleGenerateVideo} 
                className="w-full border-white/10 text-slate-200 hover:bg-white/5 hover:text-white" 
                variant="outline"
                isLoading={generatingVideo}
                disabled={!coverFile && !generatedImageBase64}
              >
                {generatingVideo ? 'Animating...' : 'Generate Video'}
              </Button>

              {generatedVideoUrl && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2 text-slate-300">Generated Video:</p>
                  <video 
                    src={generatedVideoUrl} 
                    controls 
                    className="w-full rounded-md border border-white/10 bg-black"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

