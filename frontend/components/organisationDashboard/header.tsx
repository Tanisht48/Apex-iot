'use client';

import React from 'react';
import { GearIcon } from '@radix-ui/react-icons';
import { useSearchParams, useParams } from 'next/navigation';
import Link from 'next/link';

const Header = () => {
  //   const orgID = useSearchParams().get('orgID');
  const orgID = useParams().id;
  const orgName = useSearchParams().get('orgName');
  return (
    <div className="flex flex-row gap-4 mb-12 items-center">
      <h1 className="m-0 text-2xl font-bold">{orgName}</h1>
      <Link href={`/organisations/${orgID}/settings`}>
        <GearIcon className="w-6 h-6" />
      </Link>
    </div>
  );
};

export default Header;
