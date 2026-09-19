import React from 'react';
import { DataTable } from '@/components/ui/DataTableComponents/data-table';
import { columns } from './columns';
import { useQuery } from '@tanstack/react-query';
import { getDevicesByOrganisationId } from '@/server-actions/devices';

const DevicesTable = () => {
  const id = "ky1234889qwe"
  const { data, error, isLoading } = useQuery({
    queryKey: ['org'],
    queryFn: () => getDevicesByOrganisationId(id),
  });
  

  if (isLoading) {
    return (<div>Loading...</div>)
  }
  if (error) {
    return (<div>While featching data Error Occured</div>)
  }
  console.log("Is the Data correct",data);
  if (data && Array.isArray(data)) {
    return (
      <>
        {/* @ts-ignore */}
        <DataTable apiPath={'organisations'} columns={columns} data={data} />
      </>
    );
  }
};

export default DevicesTable;
