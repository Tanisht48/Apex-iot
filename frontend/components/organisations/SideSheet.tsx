import React from 'react';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '../ui/sheet';

type SideSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export const SideSheet = ({ isOpen, onClose, children }: SideSheetProps) => {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right">
        <div className='flex flex-col h-full w-full gap-4'>
          <SheetHeader>
            <SheetTitle>New Organisation</SheetTitle>
            <SheetDescription>
              Set up a new organisation profile.
            </SheetDescription>
          </SheetHeader>
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
};
