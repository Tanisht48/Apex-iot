import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { createDevice, getAllDevices } from "@/server-actions/devices";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { deviceFormSchema } from "../Schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getOrg } from "@/server-actions/organisation";
import SideSheet from '@/components/ui/SideSheet';
import InputField from '@/components/ui/InputField';
import SelectField from '@/components/ui/SelectField';
import { Form } from "@/components/ui/form";
import { InputType } from "@/components/ui/InputType";

const Header = ({ onNewDeviceClick }: { onNewDeviceClick: () => void }) => {
    return (
      <div className="flex flex-row justify-between items-center pb-6 mb-6 border-border border-b">
        <div className="flex flex-col">
          <div className="text-base font-medium">Manage Device</div>
        </div>
        <Button className="flex flex-row gap-2" onClick={onNewDeviceClick}>
          <PlusIcon /> New Device
        </Button>
      </div>
    );
  };

 
  
  const SideSheetWorker = ({ orgID }: { orgID: string }) => {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const org_id = orgID;
    // Prefetch devices if not already prefetched
    const handleNewDeviceClick = () => {
      queryClient.invalidateQueries({ queryKey: ['devices_Org'] });
      queryClient.prefetchQuery({
        queryKey: ['devices_Org'],
        queryFn: () => getAllDevices(),
      });
      setIsSideSheetOpen(true);
    };
  
    const createDeviceMutation = useMutation({
      mutationFn: createDevice,
    });
  
    const [isSideSheetOpen, setIsSideSheetOpen] = useState(false);
  
    const form = useForm<z.infer<typeof deviceFormSchema>>({
      resolver: zodResolver(deviceFormSchema),
      defaultValues: {
        device_id: '',
        shop_close_time:'',
        shop_open_time:'',
        org_id:orgID
      },
      mode: 'onChange',
    });
  
    const { data: devicesWithoutOrg, isLoading: isLoading, error: error } = useQuery({
      queryKey: ['devices_Org'],
      queryFn : () => getAllDevices(),
    });
  

     
    async function onSubmit(values: z.infer<typeof deviceFormSchema>) {
      try {
        const deviceData = {
            device_id: values.device_id || '',
            org_id: orgID || '',
            shop_open_time: values.shop_open_time || '', 
            shop_close_time: values.shop_close_time || '',
          };
        if (deviceData) {
          // API call to create a device
          const deviceResponse = await createDeviceMutation.mutateAsync(deviceData);
          console.log('Device created:', deviceResponse);
          toast({
            title: 'Success',
            description: 'Device created successfully.',
          });
          queryClient.invalidateQueries({ queryKey: ['devicesByOrg'] });
          setIsSideSheetOpen(false);
        } else {
          toast({
            title: 'Error',
            description: 'Invalid device ID provided.',
          });
        }
  
        // Reset the form after submission or error
        form.reset();
      } catch (error) {
        console.error('Error in onSubmit:', error);
        toast({
          title: 'Error',
          description: 'An error occurred while creating the device.',
        });
      }
    }
    const isFormValid = form.formState.isValid;

        useEffect(() => {
        const subscription = form.watch((values) => {
            console.log('Form values:', values);
        });
        return () => subscription.unsubscribe();
        }, [form]);
    
    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading data</div>;
  
    return (
      <div>
        {/* Render your form and other components here */}
        <Header onNewDeviceClick={handleNewDeviceClick} />
        <SideSheet isOpen={isSideSheetOpen} onClose={() => setIsSideSheetOpen(false)} title='New Device' description='Add a new Device to the organisation'>
        <Form  {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 h-full w-full">
            <SelectField name="device_id" label="Device" control={form.control}
              options={devicesWithoutOrg?.devices.map(device =>({
                value: device.ID,
                label: device.ID, 
              })) || []}
            />
            <InputField name="shop_open_time" label="Shop Open Time" placeholder="Enter shop open time" control={form.control} inputType={InputType.TIME}
          />
          <InputField name="shop_close_time" label="Shop Close Time" placeholder="Enter shop close time" control={form.control} inputType={InputType.TIME}
          />
            <Button className="w-fit my-12" type="submit" disabled={!isFormValid}>
              Submit
            </Button>
          </form>
        </Form>
        </SideSheet>
      </div>
    );
  };
  
  export default SideSheetWorker;