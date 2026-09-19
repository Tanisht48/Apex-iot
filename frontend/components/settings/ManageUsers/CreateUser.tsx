import React, { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { createUser } from '@/server-actions/users';
import { PlusIcon } from '@radix-ui/react-icons';
import InputField from '@/components/ui/InputField';
import SelectField from '@/components/ui/SelectField';
import SideSheet from '@/components/ui/SideSheet';
import {userFormSchema} from '../Schema'
import { InputType } from '@/components/ui/InputType';
import { Role, useRoles } from './UserTable/Roles';

// Header Component
const Header = ({ onNewUserClick }: { onNewUserClick: () => void }) => {
  return (
    <div className="flex flex-row justify-between items-center pb-6 mb-6 border-border border-b">
      <div className="flex flex-col">
        <div className="text-base font-medium">Manage Users</div>
      </div>
      <Button className="flex flex-row gap-2" onClick={onNewUserClick}>
        <PlusIcon /> New User
      </Button>
    </div>
  );
};


// SideSheetWorker Component
const SideSheetWorker = ({ orgID }: { orgID: string }) => {
  const { roles, isLoading: isRolesLoading, error: rolesError } = useRoles();
  
  const createUserMutation = useMutation({
    mutationFn: createUser,
  });
  const queryClient = useQueryClient();
  const [isSideSheetOpen, setIsSideSheetOpen] = useState(false);
  const { toast } = useToast();

 

  const form = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      Name: '',
      UserType: 'User',
      Phone: '',
      Email: '',
      OrgID: orgID,
    },
  });

  async function onSubmit(values: z.infer<typeof userFormSchema>) {
    try {
      let userData;
        
      const accessRole = roles?.find((role: Role) => role.Name === values.UserType);

      if (!accessRole) {
      toast({
        title: 'Error',
        description: 'No matching role found for the selected user type.',
      });
      return;
    }
      // Determine user data based on UserType  
        userData = {
          Name: values.Name,
          Email: values.Email,
          Phone: values.Phone,
          OrgID: orgID,
          AccessRole: accessRole.ID,
        };
      

      if (userData) {
        // API call to create a user
        const userResponse = await createUserMutation.mutateAsync(userData);
        console.log('User created:', userResponse);
        toast({
          title: 'Success',
          description: 'User created successfully.',
        });
        setIsSideSheetOpen(false);
        queryClient.invalidateQueries({ queryKey: ['usersByOrg'] });
      } else {
        // Handle case where UserType is neither 'Admin' nor 'User'
        toast({
          title: 'Error',
          description: 'Invalid user type provided.',
        });
      }

      // Reset the form after submission or error
      form.reset();
    } catch (error) {
      console.error('Error in onSubmit:', error);
      // Handle errors appropriately
      toast({
        title: 'Error',
        description: 'An error occurred while creating the user.',
      });
    }
  }

  return (
    <>
      <Header onNewUserClick={() => setIsSideSheetOpen(true)} />
      <SideSheet isOpen={isSideSheetOpen} onClose={() => setIsSideSheetOpen(false)} title='New User' description='Add a new User to the organisation'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 h-full w-full">
            <InputField name="Name" label="User Name" placeholder="Enter user name" control={form.control} inputType={InputType.TEXT} />
            <SelectField
              name="UserType"
              label="User Type"
              control={form.control}
              options={[
                { value: 'Admin', label: 'Admin' },
                { value: 'User', label: 'User' },
              ]}
            />
            <InputField name="Phone" label="Phone" placeholder="Enter phone number" control={form.control} inputType={InputType.PHONE}/>
            <InputField name="Email" label="Admin Email" placeholder="Enter admin email" control={form.control} inputType={InputType.TEXT}/>
            <Button className="w-fit my-12" type="submit">
              Submit
            </Button>
          </form>
        </Form>
      </SideSheet>
    </>
  );
};

export default SideSheetWorker;
