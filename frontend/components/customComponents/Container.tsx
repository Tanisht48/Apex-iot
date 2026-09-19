import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps {
  children: ReactNode;
  className?: string; // Make className optional
}

export const Container: React.FC<ContainerProps> = ({ children, className }) => {
  return (
    <div className={cn("py-4 px-4", className)}>
      {children}
    </div>
  );
};
