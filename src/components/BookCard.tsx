import { Link } from 'react-router-dom';
import { Book } from '../types';
import { Button } from './Button';
import { FC } from 'react';

interface BookCardProps {
  book: Book;
}

export const BookCard: FC<BookCardProps> = ({ book }) => {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
      <div className="aspect-[2/3] w-full overflow-hidden bg-slate-100">
        {book.cover_url ? (
          <img
            src={book.cover_url}
            alt={book.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400">
            No Cover
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="mb-1 text-lg font-semibold text-slate-900 line-clamp-1">
          {book.title}
        </h3>
        <p className="text-sm text-slate-500 mb-4">{book.author}</p>
        <div className="mt-auto flex items-center justify-between">
          <span className="text-lg font-bold text-indigo-600">
            ${book.price.toFixed(2)}
          </span>
          <Link to={`/book/${book.id}`}>
            <Button size="sm" variant="outline">
              View Details
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
