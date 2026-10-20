import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'subtle';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const base =
      'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#05070f] disabled:pointer-events-none disabled:opacity-40 select-none cursor-pointer relative overflow-hidden';

    const variants = {
      primary:
        'bg-blue-500 text-white hover:bg-blue-400 shadow-lg shadow-blue-500/20 active:scale-[0.97] active:shadow-none',
      secondary:
        'bg-white/5 text-[#c8d4f0] hover:bg-white/8 border border-white/8 hover:border-white/12 active:scale-[0.97]',
      outline:
        'border border-white/10 bg-transparent text-[#8892aa] hover:bg-white/5 hover:text-[#f0f4ff] hover:border-white/16',
      ghost:
        'bg-transparent text-[#8892aa] hover:text-[#f0f4ff] hover:bg-white/5',
      destructive:
        'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/18 hover:border-red-500/30',
      subtle:
        'bg-white/4 text-[#8892aa] hover:bg-white/7 hover:text-[#f0f4ff]',
    };

    const sizes = {
      sm: 'h-8 px-3.5 text-xs gap-1.5',
      md: 'h-10 px-4 text-sm gap-2',
      lg: 'h-12 px-6 text-[0.9375rem] gap-2.5',
      icon: 'h-9 w-9 p-0',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
