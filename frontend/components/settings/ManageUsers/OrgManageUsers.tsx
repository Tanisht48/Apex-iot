"use client"
import React from 'react';
import UserTableByOrg from './UserTable/UserTableByOrg';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getOrganizationById } from '@/server-actions/organisation';
import CreateUser from './CreateUser';
import { RolesProvider } from './UserTable/Roles';

export const OrgManageUsers = () => {
  const id = useParams().id;
  const { data, error, isLoading } = useQuery({
    queryKey: ['org'],
    queryFn: () => getOrganizationById(id as string),
    staleTime: 5000,
    refetchOnMount: true
  });




  if (data && 'OrganisationID' in data) {
    const orgID = data.OrganisationID
    return (
      <>
        <div className="w-full px-6 py-4">
          <CreateUser orgID={orgID} />
          {/* @ts-ignore */}        
            <UserTableByOrg orgID={orgID} />
        </div>
      </>
    );
  }
};
