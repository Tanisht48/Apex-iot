// Note: Columns are where you define the core of what your table will look like. They define the data that will be displayed, how it will be formatted, sorted and filtered.

'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/ui/DataTableComponents/dataTableColumnHeader';
import { Device } from '@/lib/types';

export const columns: ColumnDef<Device>[] = [
  {
    header: ({ column }) => (
      <DataTableColumnHeader
        className="font-semibold text-foreground"
        column={column}
        title="Device ID"
      />
    ),
    accessorKey: 'ID',
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader
        className="font-semibold text-foreground"
        column={column}
        title="Created At"
      />
    ),
    accessorKey: 'CreatedAt',
    cell: ({ row: { original } }) => new Date(original.CreatedAt).toLocaleString()
  }
]
