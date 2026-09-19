'use client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { DataTable } from '@/components/ui/DataTableComponents/data-table';
import { columns } from './DeviceColumn'; // Import device columns
import { getDevicesByOrganisationId } from '../../../server-actions/devices'; // Import device API function
import { MagnifyingGlass } from 'react-loader-spinner';
import { useParams, useSearchParams } from 'next/navigation';
import CreateDevice from './CreateDevice'


const DeviceTableByOrg = () => {
  const org_id = useSearchParams().get('orgName') as string;

  // Fetch | GET | /api/devices | Get all devices
  
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['devicesByOrg'], // Use your dynamic key
    queryFn: () => getDevicesByOrganisationId(org_id),
    staleTime: 5 * 1000, 
    refetchInterval: 60 * 1000, // 60 seconds
    refetchOnMount: 'always',
  });
  if (error) {
    return <div>{error.message}</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (data && Array.isArray(data) && data.length > 0) {
    
    const transformedData = data.map((item) => {
      const createdAtDate = new Date(item.Device.CreatedAt).toLocaleString();
      return {
        ID: item.Device.ID,
        ShopOpenTime: item.Device.ShopOpenTime,
        ShopCloseTime: item.Device.ShopCloseTime,
        CreatedAt: createdAtDate,
      };
    });
    return (
      <div>
        <CreateDevice orgID={org_id}/>
        {/* @ts-ignore */}
        <DataTable columns={columns} data={transformedData} />
      </div>
    );
  } 
  else {
    return (
      <div className="flex flex-col justify-center items-center h-[30vh] gap-4">
        <MagnifyingGlass />
        <div className="text-2xl font-bold">No Devices Found</div>
        <div className="text-xl font-bold">
          Please add a device to this organisation
        </div>
      </div>
    );
  }
};

export default DeviceTableByOrg;
