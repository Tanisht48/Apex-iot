"use client";
import React, { createContext, useContext, ReactNode } from 'react';
import { GetServerSideProps } from 'next';
import { QueryClient, useQuery, dehydrate, QueryClientProvider } from '@tanstack/react-query';
import { getAllRoles } from '@/server-actions/users';

export interface Role {
  ID: string;
  Name: string;
}

interface RolesContextType {
  roles: Role[] | null | undefined;
  isLoading: boolean;
  error: Error | null;
}

const RolesContext = createContext<RolesContextType | undefined>(undefined);

export const RolesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { data: roles, isLoading, error } = useQuery<Role[]>({
    queryKey: ['roles'],
    queryFn: () => getAllRoles(),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false, // Disable refetch on window focus
  });

  return (
    <RolesContext.Provider value={{ roles: roles ?? null, isLoading, error }}>
      {children}
    </RolesContext.Provider>
  );
};

export const useRoles = (): RolesContextType => {
  const context = useContext(RolesContext);
  if (!context) {
    throw new Error('useRoles must be used within a RolesProvider');
  }
  return context;
};

// Server-side rendering with `getServerSideProps`
export const getServerSideProps: GetServerSideProps = async () => {
  const queryClient = new QueryClient();

  // Prefetch roles data on the server
  await queryClient.prefetchQuery({
    queryKey: ['roles'],
    queryFn: () => getAllRoles(),
  });

  // Dehydrate the query cache for SSR
  const dehydratedState = dehydrate(queryClient);

  return {
    props: {
      dehydratedState,
    },
  };
};

// Main component to wrap with QueryClientProvider
const ManageUsers: React.FC<{ dehydratedState: unknown }> = ({ dehydratedState }) => {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <RolesProvider>
        {<></>}
      </RolesProvider>
    </QueryClientProvider>
  );
};

export default ManageUsers;
