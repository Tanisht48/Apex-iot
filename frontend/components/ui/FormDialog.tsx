// FormDialog.tsx
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';

interface FormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  onSubmit: () => void;
  children: React.ReactNode;
}

const FormDialog: React.FC<FormDialogProps> = ({ isOpen, onClose, title, description, onSubmit, children }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent>
        {children}
        <DialogFooter>
          <Button onClick={onSubmit}>Submit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FormDialog;
