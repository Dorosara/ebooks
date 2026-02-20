import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Book } from '../types';
import { BookCard } from '../components/BookCard';
import { Input } from '../components/Input';
import { Search } from 'lucide-react';
import { SEO } from '../components/SEO';

export function Store() {
  const [books, setBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBooks() {
      setLoading(true);
      let query = supabase.from('books').select('*');

      if (search) {
        query = query.ilike('title', `%${search}%`);
      }

      const { data, error } = await query;
      if (error) console.error('Error fetching books:', error);
      else setBooks(data || []);
      setLoading(false);
    }

    const timer = setTimeout(() => {
      fetchBooks();
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="container mx-auto px-4 py-8">
      <SEO
        title="Store"
        description="Browse our extensive collection of ebooks. Search by title or author to find exactly what you're looking for."
        keywords="buy ebooks, ebook store, online library, digital reading"
      />
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Store</h1>
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search books..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {books.length > 0 ? (
            books.map((book) => <BookCard key={book.id} book={book} />)
          ) : (
            <div className="col-span-full py-12 text-center text-slate-500">
              <p>No books found matching your search.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
