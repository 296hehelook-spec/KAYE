import React from 'react';

interface NeuCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'flat' | 'inset' | 'convex';
  className?: string;
  children: React.ReactNode;
}

export const NeuCard: React.FC<NeuCardProps> = ({
  variant = 'flat',
  className = '',
  children,
  ...props
}) => {
  const variantClass =
    variant === 'inset'
      ? 'neu-inset'
      : variant === 'convex'
      ? 'neu-convex'
      : 'neu-flat';

  return (
    <div
      className={`rounded-2xl transition-all duration-200 ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
