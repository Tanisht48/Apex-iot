'use client';
import { useQuery } from '@tanstack/react-query';
import { DataTable } from '@/components/ui/DataTableComponents/data-table';
import { columns } from '@/components/organisations/OrgTable/columns';
import { getOrg } from '@/server-actions/organisation';

export default function OrganisationTable() {
  const { data, error, isLoading } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => getOrg(),
    staleTime: 5000,
    refetchOnMount: true
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error?.message) {
    return (
      <div>
        {/** TODO: need graceful error handling */}
        {error?.message}
      </div>
    );
  }

  if (data) {
    return (
      <div>
        {/* @ts-ignore */}
        <DataTable apiPath={'organisations'} columns={columns} data={data}/>
      </div>
    );
  }
}
