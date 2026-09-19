import React from 'react';
import InputField from '../../ui/InputField';
import FormDialog from '../../ui/FormDialog';
import { deviceFormSchema } from '../Schema';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { updateDevice } from '@/server-actions/devices';
import { z } from 'zod';
import { InputType } from '@/components/ui/InputType';


interface EditDeviceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  device: {
    device_id?: string;
    org_id?: string;
    shop_open_time?: string;
    shop_close_time?: string;
  };
  orgName?:string
}

const EditDeviceDialog: React.FC<EditDeviceDialogProps> = ({ isOpen, onClose, device,orgName }) => {

 const org_id = orgName;
  const form = useForm({
    resolver: zodResolver(deviceFormSchema),
    defaultValues: {
      device_id: device.device_id || '',
      org_id: org_id || '',
      shop_open_time: device.shop_open_time || '',
      shop_close_time: device.shop_close_time || '',
    },
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateDeviceMutation = useMutation({
    mutationFn: updateDevice,
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['devicesbyOrg'] });
        toast({
          title: 'Device updated successfully',
          description: data.message,
        });
        onClose();
      } else {
        toast({
          title: 'Update Failed',
          description: data.message,
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Update Unsuccessful',
        description: 'We encountered a problem while updating the device. Please try again later.',
      });
    },
  });
  

  const handleUpdate = async (values: z.infer<typeof deviceFormSchema>) => {
    const deviceData = {
      device_id: device.device_id || '',
      org_id: orgName || '',
      shop_open_time: values.shop_open_time || '', 
      shop_close_time: values.shop_close_time || '',
    };
    await updateDeviceMutation.mutateAsync(deviceData);
  };

  return (
    <FormDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Device"
      description="Update the device details"
      onSubmit={form.handleSubmit(handleUpdate)}
    >
      <FormProvider {...form}>
        <form className="space-y-4 py-8">
          {/* Device ID - Uneditable */}
          <InputField
            name="device_id"
            label="Device ID"
            control={form.control}
            inputType={InputType.TEXT}
            readonly={true}
            placeholder={''}          />
          
          {/* Organization Name - Uneditable */}
          <InputField
            name="org_id"
            label="Organization Name"
            control={form.control}
            inputType={InputType.TEXT}
            readonly={true}
            placeholder={''}          />

          {/* Editable Fields */}
          <InputField
            name="shop_open_time"
            label="Shop Open Time"
            placeholder="Enter shop open time"
            control={form.control}
            inputType={InputType.TIME}
          />
          <InputField
            name="shop_close_time"
            label="Shop Close Time"
            placeholder="Enter shop close time"
            control={form.control}
            inputType={InputType.TIME}
          />
        </form>
      </FormProvider>
    </FormDialog>
  );
};

export default EditDeviceDialog;
