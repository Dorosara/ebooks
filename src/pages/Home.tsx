import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { BookCard } from '../components/BookCard';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Book } from '../types';
import { motion } from 'motion/react';

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
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-violet-600/20 rounded-full blur-[120px] -z-10" />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8 max-w-4xl mx-auto"
          >
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-slate-500 drop-shadow-2xl">
              Next Level <br />
              <span className="text-violet-500">Digital Reading</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Experience a curated collection of professional ebooks in an immersive 3D environment. 
              Knowledge has never looked this good.
            </p>
            <div className="flex justify-center gap-6 pt-8">
              <Link to="/store">
                <Button size="lg" className="h-14 px-8 text-lg">
                  Explore Store
                </Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg">
                  Learn More
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
        
        {/* Abstract 3D Elements */}
        <div className="absolute top-1/2 left-10 w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl rotate-12 blur-xl opacity-30 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-gradient-to-tr from-violet-500 to-fuchsia-500 rounded-full blur-2xl opacity-20" />
      </section>

      {/* Featured Section */}
      <section className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-12 border-b border-white/5 pb-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Featured Collection</h2>
            <p className="text-slate-400">Hand-picked for quality and depth.</p>
          </div>
          <Link to="/store" className="text-violet-400 hover:text-violet-300 font-medium flex items-center gap-2 transition-colors">
            View All <span className="text-xl">&rarr;</span>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {featuredBooks.length > 0 ? (
            featuredBooks.map((book, i) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <BookCard book={book} />
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <div className="inline-block p-4 rounded-full bg-white/5 mb-4">
                <div className="h-8 w-8 rounded-full border-2 border-slate-600 border-t-violet-500 animate-spin" />
              </div>
              <p className="text-slate-500">Loading the future...</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
