// src/components/UserTableByOrg.tsx
'use client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { DataTable } from '@/components/ui/DataTableComponents/data-table';
import { columns } from '@/components/settings/ManageUsers/UserTable/columns';
import { getUsersByOrganisationId } from '@/server-actions/users';
import { MagnifyingGlass } from 'react-loader-spinner';
import { useRoles } from './Roles';

interface UserTableByOrgProps {
  orgID: string;
}

const UserTableByOrg: React.FC<UserTableByOrgProps> = ({ orgID }) => {
  const { roles, isLoading: isRolesLoading, error: rolesError } = useRoles();
  
  const { data, error, isLoading } = useQuery({
    queryKey: ['usersByOrg', orgID],
    queryFn: () => getUsersByOrganisationId(orgID),
    staleTime: 5 * 1000,
    refetchOnMount: 'always',
  });

  if (isRolesLoading) {
    return <div>Loading roles...</div>;
  }

  if (rolesError) {
    return <div>{rolesError.message}</div>;
  }

  if (error) {
    return <div>{error.message}</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (data && Array.isArray(data) && roles) {
    // Update user roles with role names from roles array
    const updatedUsers = data.map(user => {
      const userRole = roles.find(role => role.ID === user.AccessRole);
      return {
        ...user,
        AccessRole: userRole ? userRole.Name : user.AccessRole,
      };
    });

    if (updatedUsers.length > 0) {
      return (
        <div>
          {/* @ts-ignore */}
          <DataTable columns={columns} data={updatedUsers} />
        </div>
      );
    } else {
      return (
        <div className="flex flex-col justify-center items-center h-[30vh] gap-4">
          <MagnifyingGlass />
          <div className="text-2xl font-bold">No Users Found</div>
          <div className="text-xl font-bold">
            Please add a user to this organisation
          </div>
        </div>
      );
    }
  }

  return null;
};

export default UserTableByOrg;
