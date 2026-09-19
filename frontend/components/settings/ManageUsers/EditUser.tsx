// EditUserDialog.tsx
import React from 'react';
import InputField from '../../ui/InputField';
import SelectField from '../../ui/SelectField';
import FormDialog from '../../ui/FormDialog';
import { UserSchema } from '../Schema';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { updateUser } from '@/server-actions/users';
import { z } from 'zod';
import { InputType } from '@/components/ui/InputType';
import { useRoles } from './UserTable/Roles';

interface EditUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    ID?: string;
    Name?: string;
    Phone?: string;
    Email?: string;
    AccessRole?: string;
  };
}

const EditUserDialog: React.FC<EditUserDialogProps> = ({ isOpen, onClose, user }) => {
  const { roles, isLoading: isRolesLoading, error: rolesError } = useRoles();

  const form = useForm({
    resolver: zodResolver(UserSchema),
    defaultValues: {
      Name: user?.Name || '',
      Phone: user?.Phone || '',
      Email: user?.Email || '',
      AccessRole: String(user?.AccessRole || ''), // Initially set it to the user's current role
    }
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateUserMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      toast({
        title: 'User updated successfully',
        description: 'The user details have been updated.',
      });
      queryClient.invalidateQueries({ queryKey: ['usersByOrg'] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: 'Error updating user',
        description: error.message || 'An unexpected error occurred',
      });
    }
  });

  const handleUpdate = async (values: z.infer<typeof UserSchema>) => {
    const userData = {
      ID: user.ID || '',
      ...values,
    };
    await updateUserMutation.mutateAsync(userData);
  };

  // Map roles to options: show role names in the SelectField, but send their IDs
  const roleOptions = roles
    ? roles.map(role => ({
        value: role.ID, // Send role ID as the value
        label: role.Name, // Display role name in the dropdown
      }))
    : [];

  return (
    <FormDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Edit User"
      description="Update the user details"
      onSubmit={form.handleSubmit(handleUpdate)}
    >
      <FormProvider {...form}>
        <form className="space-y-4 py-8">
          <InputField name="Name" label="User Name" placeholder="Enter user name" control={form.control} inputType={InputType.TEXT} />
          <InputField name="Phone" label="Phone" placeholder="Enter phone number" control={form.control} inputType={InputType.PHONE} />
          <InputField name="Email" label="Email" placeholder="Enter email" control={form.control} inputType={InputType.TEXT} />
          {isRolesLoading ? (
            <p>Loading roles...</p>
          ) : rolesError ? (
            <p>Error loading roles: {rolesError.message}</p>
          ) : (
            <SelectField
              name="AccessRole"
              label="User Type"
              control={form.control}
              options={roleOptions} // Dynamically populated role options
            />
          )}
        </form>
      </FormProvider>
    </FormDialog>
  );
};

export default EditUserDialog;
