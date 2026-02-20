import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Book } from '../types';
import { Button } from '../components/Button';
import { ArrowLeft, ShoppingCart, Download } from 'lucide-react';
import { SEO } from '../components/SEO';

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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <SEO title="Book Not Found" />
        <h1 className="text-2xl font-bold text-slate-900">Book not found</h1>
        <Link to="/store">
          <Button variant="outline">Back to Store</Button>
        </Link>
      </div>
    );
  }

  const handleBuy = () => {
    alert('Payment integration coming soon! In a real app, this would open Stripe Checkout.');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <SEO
        title={book.title}
        description={book.description.substring(0, 160)}
        image={book.cover_url}
        keywords={`ebook, ${book.title}, ${book.author}, buy book`}
      />
      <Link
        to="/store"
        className="mb-8 inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Store
      </Link>

      <div className="grid gap-12 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl bg-slate-100 shadow-lg">
          {book.cover_url ? (
            <img
              src={book.cover_url}
              alt={book.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-96 w-full items-center justify-center text-slate-400">
              No Cover Available
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center space-y-8">
          <div>
            <h1 className="mb-2 text-4xl font-bold text-slate-900">{book.title}</h1>
            <p className="text-xl text-slate-500">by {book.author}</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Description</h3>
            <p className="leading-relaxed text-slate-600">{book.description}</p>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-6">
            <div>
              <p className="text-sm text-slate-500">Price</p>
              <p className="text-3xl font-bold text-indigo-600">
                ${book.price.toFixed(2)}
              </p>
            </div>
            <Button size="lg" className="px-8" onClick={handleBuy}>
              <ShoppingCart className="mr-2 h-5 w-5" />
              Buy Now
            </Button>
          </div>
          
           {/* Demo Download Button (In real app, this would be after purchase) */}
           <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800 mb-2">
                <strong>Demo Mode:</strong> Since this is a demo, you can download the file directly if available.
              </p>
              {book.file_url && (
                <a href={book.file_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="w-full">
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
