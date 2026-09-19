import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface SideSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  children: React.ReactNode;
}

const SideSheet: React.FC<SideSheetProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
}) => {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right">
        <div className="flex flex-col h-full w-full gap-16">
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
            <SheetDescription>{description}</SheetDescription>
          </SheetHeader>
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SideSheet;
