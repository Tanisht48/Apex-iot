'use client';

import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../ui/input';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import { OrgType } from '@/lib/types';
import { useMutation } from '@tanstack/react-query';
import {
  deleteOrganisation,
  updateOrganisation,
} from '@/server-actions/organisation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { toast } from '../ui/use-toast';
import { useParams, useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import ConfirmDelete from './ConfirmDelete';
import { useQuery } from '@tanstack/react-query';
import { getOrganizationById } from '@/server-actions/organisation';
import { useEffect } from 'react';

// Request body schema
const formSchema = z.object({
  OrgId: z.string(),
  OrgName: z
    .string()
    .min(2, {
      message: 'Organisation name is required',
    })
    .max(50),
  OrgType: z.nativeEnum(OrgType),
});

export default function OrgSettings() {
  const router = useRouter();
  const id = z.string().parse(useParams().id);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const { data, error, isLoading } = useQuery({
    queryKey: ['org'],
    queryFn: () => getOrganizationById(id),
    staleTime: 5000,
    refetchOnMount: true,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      OrgId: id,
      OrgName: '',
      OrgType: OrgType.Kirana, // Assuming Kirana is a valid default
    },
  });

  // Update form values when data is fetched and valid
  useEffect(() => {
    if (data && 'OrgName' in data) {
      form.reset({
        OrgId: id,
        OrgName: data.OrgName,
        OrgType: data.Type,
      });
    }
  }, [data, form.reset, id]);

  const updateMutation = useMutation({
    mutationFn: updateOrganisation,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteOrganisation,
  });

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log('📍mutation', updateMutation);
    console.log('📍values', values);

    updateMutation.mutate(
      { ID: id, ...values },
      {
        onSuccess: () => {
          console.log('did we make it? 🙈');
          console.log('👽 After success', updateMutation);
          toast({
            title: 'Organisation updated successfully',
            description: 'Your organisation has been updated.',
          });
        },
      }
    );
  }

  function onDeleteConfirmed() {
    deleteMutation.mutate(
      { ID: id },
      {
        onSuccess: () => {
          toast({
            title: 'Organisation deleted successfully',
            description: 'The organisation has been removed.',
          });
          router.push('/organisations');
        },
      }
    );
  }

  function handleDeleteClick() {
    setShowConfirmDialog(true);
  }

  function handleCancel() {
    setShowConfirmDialog(false);
  }

  return (
    <>
      <div className="w-fit px-6 py-4">
        {/* <div className="font-medium text-base">Organisation</div>
        <div className="text-sm font-normal opacity-70 pb-5 mb-5 border-border border-b">
          This is how others will see you on the site.
        </div> */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="OrgName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Organisation Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      className=" opacity-70"
                      placeholder="Enter organisation name"
                      {...field}
                    />
                  </FormControl>
                  {/* <FormDescription>Registered Company Name</FormDescription> */}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="OrgType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organisation Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an organisation type to pass" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={OrgType.Kirana}>Kirana</SelectItem>
                      <SelectItem value={OrgType.Enterprise}>
                        Enterprise
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {/* <FormDescription>
                  Select the type of your organisation.
                </FormDescription> */}
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex w-fit gap-8 flex-row ">
              <Button className=" min-w-48" type="submit">
                Update profile
              </Button>
              <Button
                className=" min-w-48"
                type="button"
                onClick={handleDeleteClick}
                variant="destructive"
              >
                DELETE
              </Button>
            </div>
            <ConfirmDelete
              isOpen={showConfirmDialog}
              onConfirm={onDeleteConfirmed}
              onCancel={handleCancel}
              title="Confirm Deletion"
              message="Are you sure you want to delete this organisation? This action cannot be undone."
            />
          </form>
        </Form>
      </div>
    </>
  );
}
