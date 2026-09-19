import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ConfirmDeleteProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  message: string;
  title: string;
}

const ConfirmDelete: React.FC<ConfirmDeleteProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  message,
  title,
}) => {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="destructive" onClick={onConfirm}>
            Yes
          </Button>
          <Button onClick={onCancel}>No</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDelete;
