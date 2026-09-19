import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteUser } from '@/server-actions/users';
import { Button } from '@/components/ui/button';
import { Delete } from 'lucide-react';
import ConfirmDelete from '../ConfirmDelete'; // Adjust the import path as necessary
import { toast } from '@/components/ui/use-toast'; // Ensure the correct path to the toast function

interface DeleteUserButtonProps {
  userID: string;
}

const DeleteUserButton: React.FC<DeleteUserButtonProps> = ({ userID }) => {
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const queryClient = useQueryClient();
  const deleteUserMutation = useMutation({
    mutationFn: () => deleteUser(userID),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usersByOrg'] });
      toast({
        title: 'User deleted successfully',
        description: 'The user has been removed.',
      });
      setConfirmOpen(false); // Close the dialog on successful deletion
    },
  });

  const handleDelete = async () => {
    await deleteUserMutation.mutateAsync();
  };

  return (
    <>
      <Button variant="destructive" className="px-6 py-2 rounded-sm" onClick={() => setConfirmOpen(true)}>
        Delete
        <Delete className="ml-2 w-4 h-4" />
      </Button>
      <ConfirmDelete
        isOpen={isConfirmOpen}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
        message="Are you sure you want to delete this user?"
        title="Confirm Deletion"
      />
    </>
  );
};

export default DeleteUserButton;