'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Input } from '../ui/input';
import { OrgType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { isValidPhoneNumber } from 'react-phone-number-input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { createOrganisation } from '@/server-actions/organisation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PhoneInput } from '@/components/customComponents/Phone';
import { createUser } from '@/server-actions/users';
import { useRouter } from 'next/navigation';

const SideSheet = dynamic(() =>
  import('./SideSheet').then((mod) => mod.SideSheet)
);

const Header = dynamic(() => import('./Header').then((mod) => mod.Header));

// Request body schema
const formSchema = z
  .object({
    OrgName: z
      .string()
      .min(2, { message: 'Organisation name must be at least 2 characters.' })
      .max(50, {
        message: 'Organisation name must be less than 50 characters.',
      }),
    OrgType: z.nativeEnum(OrgType),
    AdminName: z.string().optional(),
    Phone: z.string().optional(),
    AdminEmail: z
      .string()
      .optional()
      .refine(
        (email) => {
          // Only apply email validation if email is not empty
          return email ? /.+@.+\..+/.test(email) : true;
        },
        { message: 'Invalid email format' }
      ),
  })
  .refine(
    (data) => ({
      success: data.AdminName ? !!data.Phone : true,
      error:
        data.AdminName && !data.Phone
          ? 'Phone number is required when Admin Name is provided.'
          : null,
    }),
    {
      message: 'Phone number is required when Admin Name is provided.',
      path: ['Phone'],
    }
  )
  .refine(
    (data) => ({
      success: data.Phone ? isValidPhoneNumber(data.Phone) : true,
      error:
        data.Phone && !isValidPhoneNumber(data.Phone)
          ? 'Invalid phone number.'
          : null,
    }),
    {
      message: 'Invalid phone number.',
      path: ['Phone'],
    }
  );

export default function SideSheetWorker() {
  const router = useRouter();
  const createOrganisationMutation = useMutation({
    mutationFn: createOrganisation,
  });
  const createUserMutation = useMutation({
    mutationFn: createUser,
  });
  const queryClient = useQueryClient();
  const [isSideSheetOpen, setIsSideSheetOpen] = useState(false);
  const { toast } = useToast();

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      OrgName: '',
      OrgType: OrgType.Kirana,
      AdminName: '',
      Phone: '',
      AdminEmail: '',
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // First API call to create an organization
      const orgResponse = await createOrganisationMutation.mutateAsync(values);
      console.log('Organization created:', orgResponse);

      // Extract the organization ID from the response
      const orgId = (orgResponse as { data: { OrganisationID: string } }).data
        .OrganisationID;
      // Check if admin fields are filled
      if (values.AdminName && values.Phone) {
        const userData = {
          Name: values.AdminName,
          Email: values.AdminEmail,
          Phone: values.Phone,
          OrgID: orgId,
          AccessRole: 'f09e62c4-7ca2-45ba-9412-e488b6573a5d',
        };

        // Second API call to create a user
        const userResponse = await createUserMutation.mutate(userData);
        console.log('User created:', userResponse);

        // Show toast notification for both organization and user creation
        toast({
          title: 'Success',
          description: 'Created Organisation and User Successfully.',
        });
        setIsSideSheetOpen(false);
        queryClient.invalidateQueries({ queryKey: ['organizations'] });
        
      } else {
        // Admin fields are not all filled, only organization is created
        toast({
          title: 'Success',
          description: 'Organisation created successfully.',
        });
        setIsSideSheetOpen(false);
        queryClient.invalidateQueries({ queryKey: ['organizations'] });
        
      }
      form.reset();
    } catch (error) {
      console.error('Error in onSubmit:', error);
      // Handle errors appropriately
      toast({
        title: 'Error',
        description:
          'An error occurred while creating the organisation or user.',
      });
    }
  }

  return (
    <>
      <Header onNewOrganisationClick={() => setIsSideSheetOpen(true)} />
      <SideSheet
        isOpen={isSideSheetOpen}
        onClose={() => setIsSideSheetOpen(false)}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
  control={form.control}
  name="OrgName"
  render={({ field }) => (
    <FormItem>
      <div className="grid grid-cols-3 items-center gap-4">
        <FormLabel className="col-span-1">Name</FormLabel>
        <div className="col-span-2 flex flex-col gap-2 p-2">
          <FormControl>
            <Input placeholder="Enter organisation name" {...field} />
          </FormControl>
          {/* <FormDescription>Registered Company Name</FormDescription> */}
        </div>
      </div>
      <FormMessage />
    </FormItem>
  )}
/>



<FormField
  control={form.control}
  name="OrgType"
  render={({ field }) => (
    <FormItem>
      <div className="grid grid-cols-3 items-center gap-4">
        <FormLabel className="col-span-1">Type</FormLabel>
        <div className="col-span-2 flex flex-col gap-2 p-2">
          <FormControl>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Select an organisation type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={OrgType.Kirana}>Kirana</SelectItem>
                <SelectItem value={OrgType.Enterprise}>Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </FormControl>
          {/* <FormDescription>Select the type of your organisation.</FormDescription> */}
        </div>
      </div>
      <FormMessage />
    </FormItem>
  )}
/>

<div className='flex flex-row items-center gap-4 my-8'>
    <div className='h-[0.5px] w-full bg-gray-500' />
      <p className='text-sm text-gray-500' >Optional</p>
      <div className='h-[0.5px] w-full bg-gray-500' />  
</div>

<FormField
  control={form.control}
  name="AdminName"
  render={({ field }) => (
    <FormItem>
      <div className="grid grid-cols-3 items-center gap-4">
        <FormLabel className="col-span-1">Admin Name</FormLabel>
        <div className="col-span-2 flex flex-col gap-2 p-2">
          <FormControl>
            <Input placeholder="Enter admin name" {...field} />
          </FormControl>
          {/* <FormDescription>Admin Name</FormDescription> */}
        </div>
      </div>
      <FormMessage />
    </FormItem>
  )}
/>

<FormField
  control={form.control}
  name="Phone"
  render={({ field }) => (
    <FormItem>
      <div className="grid grid-cols-3 items-center gap-4">
        <FormLabel className="col-span-1">Phone</FormLabel>
        <div className="col-span-2 flex flex-col gap-2 p-2">
          <FormControl>
            <PhoneInput control={undefined} label={''} placeholder={''} {...field} />
          </FormControl>
          {/* <FormDescription>Phone</FormDescription> */}
        </div>
      </div>
      <FormMessage />
    </FormItem>
  )}
/>

<FormField
  control={form.control}
  name="AdminEmail"
  render={({ field }) => (
    <FormItem>
      <div className="grid grid-cols-3 items-center gap-4">
        <FormLabel className="col-span-1">Admin Email</FormLabel>
        <div className="col-span-2 flex flex-col gap-2 p-1">
          <FormControl>
            <Input placeholder="Enter admin email" {...field} />
          </FormControl>
          {/* <FormDescription>Admin Email</FormDescription> */}
        </div>
      </div>
      <FormMessage />
    </FormItem>
  )}
/>

            <Button className='w-fit my-12' type="submit">Submit</Button>
          </form>
        </Form>
      </SideSheet>
    </>
  );
}
