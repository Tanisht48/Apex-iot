import { dehydrate, QueryClient } from '@tanstack/react-query';
import { WrapperContainer } from '@/components/customComponents/WrapperContainer';
import DeviceDashboard from '../../../../../components/organisationDashboard/deviceDashboard';
import { DeviceReadings } from '@/lib/types';
import { getDeviceReadings } from '@/server-actions/devices';

const Page = async ({ params }: { params: { deviceID: string } }) => {
  const { deviceID } = params;

  // Create a new QueryClient instance
  const queryClient = new QueryClient();

  // Prefetch the data using React Query
  await queryClient.prefetchQuery({
    queryKey: ['deviceReadings', deviceID],
    queryFn: () =>
      getDeviceReadings({
        deviceID: deviceID || 'default-device-id', 
        createdAtStart: '', 
        createdAtEnd: '',    
        limit: 200,
      }),
  });


 const dehydratedState = dehydrate(queryClient);


 const initialDeviceData = (dehydratedState.queries[0]?.state.data as DeviceReadings[]) || [];

  return (
    <WrapperContainer>
      <div className="flex flex-row h-fit bg-background rounded-sm">
        <DeviceDashboard Data={initialDeviceData} />
      </div>
    </WrapperContainer>
  );
};

export default Page;
