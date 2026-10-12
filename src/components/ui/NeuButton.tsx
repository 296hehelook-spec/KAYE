import React from 'react';

interface NeuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'subtle' | 'inset' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const NeuButton: React.FC<NeuButtonProps> = ({
  variant = 'default',
  size = 'md',
  active = false,
  className = '',
  disabled,
  children,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-xl min-h-[36px]',
    md: 'px-4 py-2 text-sm rounded-xl min-h-[42px]',
    lg: 'px-6 py-3 text-base rounded-2xl min-h-[48px]',
  };

  let variantStyle = 'neu-btn text-slate-800 dark:text-slate-100';

  if (variant === 'primary') {
    variantStyle = 'neu-btn-primary font-semibold';
  } else if (variant === 'subtle') {
    variantStyle = 'neu-btn text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white';
  } else if (variant === 'inset' || active) {
    variantStyle = 'neu-inset text-indigo-600 dark:text-indigo-400 font-medium';
  } else if (variant === 'danger') {
    variantStyle = 'neu-btn text-rose-600 dark:text-rose-400 hover:text-rose-700';
  }

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-medium tracking-tight whitespace-nowrap shrink-0 outline-none transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed ${sizeClasses[size]} ${variantStyle} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
