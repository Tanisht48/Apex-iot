import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateDevice } from '@/server-actions/devices'; // Adjust the import path as necessary
import { Button } from '@/components/ui/button'; // Ensure correct path to Button component
import { Delete } from 'lucide-react';
import ConfirmDelete from '../../ConfirmDelete'; // Adjust the import path as necessary
import { toast } from '@/components/ui/use-toast'; // Ensure correct path to the toast function
import { deviceFormSchema } from '../../Schema';
import { z } from 'zod';

interface DeleteDeviceButtonProps {
  device: {
    device_id?: string;
    org_id?: string;
    shop_open_time?: string;
    shop_close_time?: string;
  };
  orgName?: string; // Optional prop for orgName
}

const DeleteDeviceButton: React.FC<DeleteDeviceButtonProps> = ({ device, orgName }) => {
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const queryClient = useQueryClient();
  const org_id = orgName;
  const updateDeviceMutation = useMutation({
    mutationFn: updateDevice,
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: 'Device updated successfully',
          description: 'The device has been removed from the organization.',
        });
        queryClient.invalidateQueries({ queryKey: ['devicesByOrg']});
        setConfirmOpen(false); 
      } else {
        toast({
          title: 'Failed to update device',
          description: 'An unexpected error occurred.',
        });
        setConfirmOpen(false); 
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Error updating device',
        description: error.message || 'An unexpected error occurred.',
      });
      setConfirmOpen(false); 
    },
  });

  // Handle delete by updating the device with null org_id
  const handleDelete = async () => {
    if (device?.device_id) {
      const deviceData = {
        device_id: device.device_id,
        org_id: '', // Set org_id to null
        shop_open_time: device.shop_open_time || '', 
        shop_close_time: device.shop_close_time || '',
      };
      await updateDeviceMutation.mutateAsync(deviceData);
    }
  };

  return (
    <>
      <Button variant="destructive" className="px-6 py-2 rounded-sm" onClick={() => setConfirmOpen(true)}>
        Delete
        <Delete className="ml-2 w-4 h-4" />
      </Button>
      <ConfirmDelete
        isOpen={isConfirmOpen}
        onConfirm={handleDelete} // No arguments needed
        onCancel={() => setConfirmOpen(false)}
        message="Are you sure you want to delete this device?"
        title="Confirm Deletion"
      />
    </>
  );
};

export default DeleteDeviceButton;
