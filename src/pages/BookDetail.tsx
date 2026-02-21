import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Book } from '../types';
import { Button } from '../components/Button';
import { ArrowLeft, ShoppingCart, Download } from 'lucide-react';

export function BookDetail() {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBook() {
      if (!id) return;
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('id', id)
        .single();

      if (error) console.error('Error fetching book:', error);
      else setBook(data);
      setLoading(false);
    }
    fetchBook();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-violet-500"></div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-slate-200">Book not found</h1>
        <Link to="/store">
          <Button variant="outline" className="border-white/10 text-slate-300 hover:text-white">Back to Store</Button>
        </Link>
      </div>
    );
  }

  const handleBuy = () => {
    alert('Payment integration coming soon! In a real app, this would open Stripe Checkout.');
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <Link
        to="/store"
        className="mb-8 inline-flex items-center text-sm font-medium text-slate-400 hover:text-violet-400 transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Store
      </Link>

      <div className="grid gap-16 lg:grid-cols-2">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative overflow-hidden rounded-2xl bg-slate-800 shadow-2xl ring-1 ring-white/10 aspect-[3/4]">
            {book.cover_url ? (
              <img
                src={book.cover_url}
                alt={book.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-600">
                No Cover Available
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col justify-center space-y-8">
          <div>
            <h1 className="mb-2 text-5xl font-black tracking-tight text-white">{book.title}</h1>
            <p className="text-2xl text-violet-400 font-light">by {book.author}</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Description</h3>
            <p className="leading-relaxed text-slate-300 text-lg font-light">{book.description}</p>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
            <div>
              <p className="text-sm text-slate-400 mb-1">Price</p>
              <p className="text-4xl font-bold text-white">
                ${book.price.toFixed(2)}
              </p>
            </div>
            <Button size="lg" className="px-8 h-14 bg-violet-600 hover:bg-violet-500 text-lg shadow-lg shadow-violet-500/20" onClick={handleBuy}>
              <ShoppingCart className="mr-2 h-5 w-5" />
              Buy Now
            </Button>
          </div>
          
           {/* Demo Download Button (In real app, this would be after purchase) */}
           <div className="mt-4 p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
              <p className="text-sm text-yellow-200/80 mb-4">
                <strong className="text-yellow-400">Demo Mode:</strong> Since this is a demo, you can download the file directly if available.
              </p>
              {book.file_url && (
                <a href={book.file_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="w-full border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10">
                    <Download className="mr-2 h-4 w-4" />
                    Download Sample
                  </Button>
                </a>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
