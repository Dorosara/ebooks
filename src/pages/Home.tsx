import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { BookCard } from '../components/BookCard';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Book } from '../types';
import { SEO } from '../components/SEO';

export function Home() {
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);

  useEffect(() => {
    async function fetchBooks() {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .limit(4);
      if (error) console.error('Error fetching books:', error);
      else setFeaturedBooks(data || []);
    }
    fetchBooks();
  }, []);

  return (
    <div className="space-y-16">
      <SEO
        title="Home"
        description="Discover a curated collection of professional ebooks. From technical guides to inspiring fiction, find your next great read at Lumina Books."
        keywords="ebooks, online bookstore, digital books, reading, professional guides"
      />
      <section className="relative overflow-hidden rounded-3xl bg-indigo-600 px-8 py-24 text-center text-white shadow-xl">
        <div className="relative z-10 mx-auto max-w-3xl space-y-6">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            Discover Your Next Great Read
          </h1>
          <p className="text-lg text-indigo-100">
            Explore a curated collection of professional ebooks. From technical guides to inspiring fiction, find the knowledge you seek.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/store">
              <Button size="lg" variant="secondary">
                Browse Store
              </Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
      </section>

      <section className="container mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-slate-900">Featured Books</h2>
          <Link to="/store" className="text-indigo-600 hover:underline">
            View All &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {featuredBooks.length > 0 ? (
            featuredBooks.map((book) => <BookCard key={book.id} book={book} />)
          ) : (
            <div className="col-span-full py-12 text-center text-slate-500">
              <p>No books available yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
