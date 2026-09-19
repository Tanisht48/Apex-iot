// Note: Columns are where you define the core of what your table will look like. They define the data that will be displayed, how it will be formatted, sorted and filtered.

'use client';
import { Organisation } from '@/lib/types';
import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '../../ui/DataTableComponents/dataTableColumnHeader';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';

export const columns: ColumnDef<Organisation>[] = [
  {
    header: ({ column }) => (
      <DataTableColumnHeader
        className="font-semibold text-foreground"
        column={column}
        title="Name"
      />
    ),
    accessorKey: 'OrgName',
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader
        className="font-semibold text-foreground"
        column={column}
        title="Type"
      />
    ),
    accessorKey: 'Type',
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader
        className="font-semibold text-foreground"
        column={column}
        title="Devices"
      />
    ),
    accessorKey: 'DeviceCount',
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader
        className="font-semibold text-foreground"
        column={column}
        title="Users"
      />
    ),
    accessorKey: 'UserCount',
  },
  {
    header: 'Edit',
    accessorKey: 'ID',
    cell: ({ row }: { row: any }) => (
      <Link
        href={{
          pathname: `/organisations/${row.getValue('ID')}/settings`,
        }}
        passHref
      >
        <Button
          variant="default"
          className="px-6 py rounded-sm bg-muted text-foreground dark:bg-muted dark:text-foreground hover:text-background dark:hover:text-background"
          onClick={(e) => e.stopPropagation()}
        >
          Edit
          <Edit className="ml-2 w-4 h-2" />
        </Button>
      </Link>
    ),
  },
];
