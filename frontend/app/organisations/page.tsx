import React from 'react';
import OrganisationTable from '../../components/organisations/OrgTable/OrganisationTable';
import {
  dehydrate,
  QueryClient,
  HydrationBoundary,
} from '@tanstack/react-query';
import SideSheetWorker from '@/components/organisations/SideSheetWorker';
import { getOrg } from '@/server-actions/organisation';
import { WrapperContainer } from '@/components/customComponents/WrapperContainer';

export default async function Page() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ['organizations'],
    queryFn: getOrg,
  });

  const dehydratedState = dehydrate(queryClient);

  console.log('Dehydrated state:', JSON.stringify(dehydratedState));
  return (
    <WrapperContainer>
      <SideSheetWorker />
      <HydrationBoundary state={dehydratedState}>
        <div className="w-full min-h-[70vh]">
          <OrganisationTable />
        </div>
      </HydrationBoundary>
    </WrapperContainer>
  );
}
