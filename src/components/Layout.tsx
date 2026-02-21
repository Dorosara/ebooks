import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ShoppingBag, LogOut, BookOpen, User as UserIcon } from 'lucide-react';
import { Button } from './Button';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function Layout() {
  const { user, signOut } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user) {
      supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data?.role === 'admin') setIsAdmin(true);
        });
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black font-sans text-slate-100 selection:bg-violet-500/30">
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-slate-950/50 backdrop-blur-xl supports-[backdrop-filter]:bg-slate-950/20">
        <div className="container mx-auto flex h-20 items-center justify-between px-4">
          <Link to="/" className="group flex items-center gap-3 text-2xl font-bold tracking-tighter">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/20 transition-transform group-hover:scale-110">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Lumina
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <Link to="/" className="hover:text-violet-400 transition-colors hover:text-glow">
              Home
            </Link>
            <Link to="/store" className="hover:text-violet-400 transition-colors hover:text-glow">
              Store
            </Link>
            <Link to="/about" className="hover:text-violet-400 transition-colors hover:text-glow">
              About
            </Link>
            {isAdmin && (
              <Link to="/admin" className="hover:text-violet-400 transition-colors hover:text-glow text-violet-500">
                Admin
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="ghost" size="sm">
                      Admin Dashboard
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" size="sm" onClick={signOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button variant="primary" size="sm">
                  Sign In
                </Button>
              </Link>
            )}
            <Button variant="ghost" size="sm" className="relative">
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute top-1 right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
              </span>
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <Outlet />
      </main>

      <footer className="border-t border-white/5 bg-black/40 py-12 backdrop-blur-lg">
        <div className="container mx-auto px-4 text-center text-slate-500">
          <p>&copy; {new Date().getFullYear()} Lumina Books. Crafted for the future of reading.</p>
        </div>
      </footer>
    </div>
  );
}
