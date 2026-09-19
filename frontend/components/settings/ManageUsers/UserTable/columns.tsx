// Note: Columns are where you define the core of what your table will look like. They define the data that will be displayed, how it will be formatted, sorted and filtered.

'use client';
import { Organisation } from '@/lib/types';
import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/ui/DataTableComponents/dataTableColumnHeader';
import DeleteUserButton from '../DeleteUserButton';
import EditUserButton from '../EditUserButton';

export const columns: ColumnDef<Organisation>[] = [
  {
    header: ({ column }) => (
      <DataTableColumnHeader
        className="font-semibold text-foreground"
        column={column}
        title="Name"
      />
    ),
    accessorKey: 'Name',
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader
        className="font-semibold text-foreground"
        column={column}
        title="User Type"
      />
    ),
    accessorKey: 'AccessRole',
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader
        className="font-semibold text-foreground"
        column={column}
        title="Phone Number"
      />
    ),
    accessorKey: 'Phone',
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader
        className="font-semibold text-foreground"
        column={column}
        title="Email"
      />
    ),
    accessorKey: 'Email',
  },
  {
    header: 'User Actions',
    accessorKey: 'ID',
    cell: ({ row }) => (
      <div className="flex justify-center items-center gap-x-4">
        <EditUserButton
          user={{
            ID: row.getValue('ID'),
            Name: row.getValue('Name'),
            Phone: row.getValue('Phone'),
            Email: row.getValue('Email'),
            AccessRole: row.getValue('AccessRole'),
          }}
        />
        <DeleteUserButton userID={row.original.ID} />
      </div>
    ),
  },
];
