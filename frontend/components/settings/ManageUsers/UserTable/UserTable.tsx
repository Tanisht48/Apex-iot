'use client';
import { useQuery } from '@tanstack/react-query';
import { DataTable } from '@/components/ui/DataTableComponents/data-table';
import { columns } from './columns'; // Assuming columns are defined in the same directory
import { getUser } from '../../../../server-actions/users';

export default function UserTable() {
  // Fetch | GET | /api/user | Get all users
  const { data, error, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: getUser,
  });

  if (error) {
    return (
      <div>
        {/** TODO: need graceful error handling */}
        {error?.message}
      </div>
    );
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (data) {
    return (
      <div>
        {/* @ts-ignore */}
        <DataTable apiPath={'users'} columns={columns} data={data} />
      </div>
    );
  }

  return null;
}
