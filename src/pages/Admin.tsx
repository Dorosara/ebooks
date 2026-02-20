import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Image as ImageIcon } from 'lucide-react';
import { SEO } from '../components/SEO';

export function Admin() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [bookFile, setBookFile] = useState<File | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) return null;

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
            user_id: user.id,
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
      // Reset file inputs manually if needed, or just rely on state
      (document.getElementById('cover-upload') as HTMLInputElement).value = '';
      (document.getElementById('book-upload') as HTMLInputElement).value = '';

    } catch (error: any) {
      console.error(error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <SEO title="Admin Dashboard" description="Manage your ebooks and upload new content." />
      <h1 className="mb-8 text-3xl font-bold text-slate-900">Admin Dashboard</h1>
      
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="mb-6 text-xl font-semibold text-slate-900">Upload New Book</h2>
        
        <form onSubmit={handleUpload} className="space-y-6">
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <Input
            label="Author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            required
          />
          <div className="space-y-1">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Description
            </label>
            <textarea
              className="flex min-h-[100px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
          />

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Cover Image</label>
              <div className="flex w-full flex-col items-center justify-center rounded-md border-2 border-dashed border-slate-300 bg-slate-50 p-6 hover:bg-slate-100 transition-colors">
                  <ImageIcon className="mb-2 h-8 w-8 text-slate-400" />
                  <label
                    htmlFor="cover-upload"
                    className="cursor-pointer text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    <span>Upload Cover</span>
                    <input
                      id="cover-upload"
                      name="cover-upload"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                    />
                  </label>
                  {coverFile ? (
                    <p className="mt-2 text-xs text-green-600 truncate max-w-full">{coverFile.name}</p>
                  ) : (
                    <p className="mt-1 text-xs text-slate-500">PNG, JPG up to 10MB</p>
                  )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Book File</label>
              <div className="flex w-full flex-col items-center justify-center rounded-md border-2 border-dashed border-slate-300 bg-slate-50 p-6 hover:bg-slate-100 transition-colors">
                  <FileText className="mb-2 h-8 w-8 text-slate-400" />
                  <label
                    htmlFor="book-upload"
                    className="cursor-pointer text-sm font-medium text-indigo-600 hover:text-indigo-500"
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
                    <p className="mt-2 text-xs text-green-600 truncate max-w-full">{bookFile.name}</p>
                  ) : (
                    <p className="mt-1 text-xs text-slate-500">PDF/EPUB up to 50MB</p>
                  )}
              </div>
            </div>
          </div>

          {message && (
            <div className={`rounded-md p-4 text-sm ${message.includes('Success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message}
            </div>
          )}

          <Button type="submit" className="w-full" size="lg" isLoading={uploading}>
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? 'Uploading...' : 'Upload Book'}
          </Button>
        </form>
      </div>
    </div>
  );
}
