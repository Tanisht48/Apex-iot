'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getDevicesByOrganisationId } from '@/server-actions/devices';
import { getOrganizationById } from '@/server-actions/organisation';
import { ThreeCircles, MagnifyingGlass } from 'react-loader-spinner';
import Link from 'next/link';
import { GearIcon } from '@radix-ui/react-icons';
import { WrapperContainer } from '@/components/customComponents/WrapperContainer';
import { OrganisationById } from '@/lib/types';


interface ErrorDisplayProps {
  message: string;
}

// Loading component to handle spinner display
const Loading = () => (
  <div className="flex justify-center items-center h-screen">
    <ThreeCircles />
  </div>
);

// Error component to display error messages

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => (
  <div>Error: {message}</div>
);


function isOrganisationById(data: any): data is OrganisationById {
  return data && typeof data === 'object' && 'OrganisationID' in data && 'OrgName' in data;
}

// Main Page Component
export default function Page() {
  const id = useParams().id;
  const router = useRouter();
  const [orgID, setOrgID] = useState<string | null>(null);
  const [orgName, setOrgName] = useState<string | null>(null);

  // Fetch organization data
  const { data: org, error: organisationError, isLoading: organisationIsLoading } = useQuery({
    queryKey: ['org', id],
    queryFn: () => getOrganizationById(id as string),
    staleTime: 5000,
    refetchOnMount: true,
  });

  // Fetch devices data
  const { data: devices, error: devicesError, isLoading: devicesIsLoading } = useQuery({
    queryKey: ['devicesByOrganisationID', orgID],
    queryFn: () => getDevicesByOrganisationId(orgID as string),
    staleTime: 5000,
    refetchOnMount: true,
    enabled: !!orgID, // Only run query if orgID is set
  });

  // Handle org data changes
  useEffect(() => {
    if (isOrganisationById(org)) {
      setOrgID(org.OrganisationID);
      setOrgName(org.OrgName);
    }
  }, [org]);

  // Consolidated loading and error handling
  if (organisationIsLoading || devicesIsLoading) {
    return <Loading />;
  }

  if (organisationError) {
    return <ErrorDisplay message={organisationError.message} />;
  }

  if (devicesError) {
    return <ErrorDisplay message={devicesError.message} />;
  }

  // Render based on devices data
  if (devices && Array.isArray(devices)) {
    if (devices.length === 0) {
      return (
        <WrapperContainer>
          <div className="flex flex-row gap-4 mb-12 items-center">
            <h1 className="m-0 text-2xl font-bold">{orgName}</h1>
            <Link href={`/organisations/${id}/settings`}>
              <GearIcon className="w-6 h-6" />
            </Link>
          </div>
          <div className="flex flex-col justify-center items-center h-[80vh] gap-4">
            <MagnifyingGlass />
            <div className="text-2xl font-bold">No Device Found</div>
            <div className="text-xl font-bold">
              Please contact your administrator to assign a device to this organisation.
            </div>
          </div>
        </WrapperContainer>
      );
    }

    const deviceID = devices[0]?.Device?.ID;

    if (deviceID) {
      router.push(`/organisations/${id}/device/${deviceID}?orgID=${orgID}&orgName=${orgName}`);
    }
  }

  return null; // Return nothing if none of the conditions match
}