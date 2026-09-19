import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import EditUserDialog from './EditUser';

interface EditUserButtonProps {
  user: {
    ID: string;
    Name: string;
    Phone: string;
    Email: string;
    AccessRole: string;
  };
}

const EditUserButton: React.FC<EditUserButtonProps> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleEdit = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <Button className="px-6 py-2 rounded-sm bg-muted text-foreground dark:bg-muted dark:text-foreground hover:text-background dark:hover:text-background" onClick={handleEdit}>
        Edit
        <Edit className="ml-2 w-4 h-4" />
      </Button>
      {isOpen && <EditUserDialog isOpen={isOpen} onClose={handleClose} user={user} />}
    </>
  );
};

export default EditUserButton;