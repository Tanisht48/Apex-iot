import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps {
  children: ReactNode;
  className?: string; // Make className optional
}

export const WrapperContainer: React.FC<ContainerProps> = ({
  children,
  className,
}) => {
  return (
    <div
      className={cn(
        'bg-background p-6' ,
        className
      )}
    >
      {children}
    </div>
  );
};
