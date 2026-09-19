import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import EditDeviceDialog from '../EditDeviceDialog';
import { useSearchParams } from 'next/navigation';


interface EditUserButtonProps {
  device: {
    device_id?: string;
    org_id?: string;
    shop_open_time?: string;
    shop_close_time?: string;
  };
}

const EditDeviceButton: React.FC<EditUserButtonProps> = ({ device }) => {
  const searchParams = useSearchParams(); // Declare once at the top of the component
  const orgName = searchParams.get('orgName'); // Retrieve the 'orgName' from the URL search params

  console.log(orgName);
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
      {isOpen && <EditDeviceDialog isOpen={isOpen} onClose={handleClose} device={device} orgName = {orgName as string} />}
    </>
  );
};

export default EditDeviceButton;