import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Book } from '../types';
import { BookCard } from '../components/BookCard';
import { Input } from '../components/Input';
import { Search } from 'lucide-react';
import { motion } from 'motion/react';

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
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between border-b border-white/5 pb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Store</h1>
          <p className="text-slate-400">Browse our entire collection of digital assets.</p>
        </div>
        
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search titles..."
            className="pl-10 bg-slate-900/50 border-white/10 text-slate-200 placeholder:text-slate-500 focus:border-violet-500/50 focus:ring-violet-500/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-violet-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {books.length > 0 ? (
            books.map((book, i) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <BookCard book={book} />
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center text-slate-500">
              <p>No books found matching your search.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
