import { Link } from 'react-router-dom';
import { Book } from '../types';
import { Button } from './Button';
import { FC } from 'react';
import { ShoppingCart } from 'lucide-react';

interface BookCardProps {
  book: Book;
}

export const BookCard: FC<BookCardProps> = ({ book }) => {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-violet-500/40 hover:border-violet-500/50">
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-800">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60 z-10" />
        {book.cover_url ? (
          <img
            src={book.cover_url}
            alt={book.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-600">
            No Cover
          </div>
        )}
        <div className="absolute top-4 right-4 z-20 opacity-0 transform translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
          <span className="inline-flex items-center justify-center rounded-full bg-violet-600/90 px-3 py-1 text-xs font-bold text-white backdrop-blur-md shadow-lg">
            ${book.price.toFixed(2)}
          </span>
        </div>
      </div>
      
      <div className="flex flex-1 flex-col p-5">
        <h3 className="mb-1 text-lg font-bold text-slate-100 line-clamp-1 group-hover:text-violet-400 transition-colors">
          {book.title}
        </h3>
        <p className="text-sm text-slate-400 mb-4">{book.author}</p>
        
        <div className="mt-auto flex items-center justify-between gap-3">
          <Link to={`/book/${book.id}`} className="w-full">
            <Button size="sm" variant="secondary" className="w-full">
              View Details
            </Button>
          </Link>
          <Button size="sm" variant="primary" className="px-3">
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
