import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    const variants = {
      primary: 
        'bg-violet-600 text-white shadow-[0_4px_0_0_#4c1d95] hover:bg-violet-500 hover:shadow-[0_4px_0_0_#5b21b6] active:shadow-none active:translate-y-[4px]',
      secondary: 
        'bg-slate-800 text-slate-200 shadow-[0_4px_0_0_#1e293b] hover:bg-slate-700 hover:text-white hover:shadow-[0_4px_0_0_#334155] active:shadow-none active:translate-y-[4px]',
      outline: 
        'bg-transparent border-2 border-slate-700 text-slate-300 shadow-[0_4px_0_0_#334155] hover:bg-slate-800 hover:text-white hover:border-slate-600 active:shadow-none active:translate-y-[4px]',
      ghost: 
        'bg-transparent text-slate-400 hover:bg-slate-800/50 hover:text-white active:bg-slate-800',
      danger: 
        'bg-red-600 text-white shadow-[0_4px_0_0_#991b1b] hover:bg-red-500 hover:shadow-[0_4px_0_0_#b91c1c] active:shadow-none active:translate-y-[4px]',
    };

    const sizes = {
      sm: 'h-9 px-4 text-xs',
      md: 'h-11 px-6 py-2',
      lg: 'h-14 px-8 text-lg',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-xl font-bold tracking-wide transition-all duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none disabled:translate-y-[4px]',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
