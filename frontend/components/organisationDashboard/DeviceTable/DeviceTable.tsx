'use client';
import { useQuery } from '@tanstack/react-query';
import { useParams, useSearchParams } from 'next/navigation';
import { getDevicesByOrganisationId } from '@/server-actions/devices';
import { DeviceAndLatestRecordData, FetchError } from '@/lib/types';
import { ThreeCircles } from 'react-loader-spinner';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
import { GearIcon } from '@radix-ui/react-icons';
import React from 'react';

interface DeviceTableProps {
  setSelectedDeviceID: (deviceID: string | null) => void;
}

export const DeviceTable: React.FC<DeviceTableProps> = ({ setSelectedDeviceID }) => {
  const params = useParams();
  const searchParams = useSearchParams();
  const orgID = params.id as string;
  const orgName = searchParams.get('orgID');
  const organisationName = searchParams.get('orgName');

  const {
    data: devices,
    error,
    isLoading,
  } = useQuery<DeviceAndLatestRecordData[], FetchError>({
    queryKey: ['devicesByOrganisationID', orgName],
    queryFn: async () => {
      const response = await getDevicesByOrganisationId(orgName as string);
      if ('error' in response) {
        throw new Error(response.message);
      }
      return response;
    },
    enabled: !!orgID,
  });

  // Set initial selected device ID if devices are available
  React.useEffect(() => {
    if (devices && devices.length > 0) {
      setSelectedDeviceID(devices[0].Device.ID);
    }
  }, [devices, setSelectedDeviceID]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ThreeCircles />
      </div>
    );
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!devices || devices.length === 0) {
    return (
      <div className="flex flex-col w-full gap-4">
        <div className="flex flex-row gap-4 items-center">
          <h1 className="m-0 text-xl font-bold">{orgName}</h1>
          <Link href={`/organisations/${orgID}/settings`}>
            <GearIcon className="w-6 h-6" />
          </Link>
        </div>
        <div>No devices found for this organization.</div>
      </div>
    );
  }

  const handleDeviceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const deviceID = event.target.value;
    setSelectedDeviceID(deviceID);
  };

  return (
    <div className="w-full">
  <Card
    className="w-full px-4 gap-4 flex flex-col"
    style={{ backgroundColor: 'hsl(336, 10%, 10%, 1)' }}
  >
    <CardHeader className="flex py-2 flex-row justify-between items-center align-middle px-0 border-b border-muted">
      <div className="flex flex-row gap-2 justify-between items-center align-middle">
        <h1 className="text-2xl font-normal tracking-tight leading-none">
          {orgName}
        </h1>
      </div>
      <Link
        href={`/organisations/${orgID}/settings?orgName=${orgName}`}
        className="p-2 bg-background rounded hover:bg-muted text-muted-foreground hover:text-foreground border border-muted flex flex-row items-center gap-2"
      >
        <GearIcon className="w-5 h-5 text-muted-foreground hover:text-foreground" />
        <p className="text-xs font-medium">Settings</p>
      </Link>
    </CardHeader>

    <CardContent className="px-0 flex flex-col gap-4">
      <div className="flex justify-between items-start">
        {/* Left side: Dropdown for selecting device */}
        <div className="flex flex-col gap-2">
          <CardTitle className="text-xs font-medium">
            Select Device:
          </CardTitle>
          <select
            onChange={handleDeviceChange}
            className="p-2 border border-muted rounded text-sm"
          >
            {devices.map((deviceOption) => (
              <option key={deviceOption.Device.ID} value={deviceOption.Device.ID}>
                {deviceOption.Device.ID}
              </option>
            ))}
          </select>
        </div>

        {/* Right side: Device details */}
        <div className="flex flex-col items-end gap-1">
          {devices.length > 0 && (
            <>
              <p className="text-xs text-muted-foreground">
                Device ID: {devices[0].Device.ID}
              </p>
              <p className="text-xs text-muted-foreground">
                Created At: {devices[0].Device.CreatedAt}
              </p>
            </>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
</div>

  );
};
