// Note: Columns are where you define the core of what your table will look like. They define the data that will be displayed, how it will be formatted, sorted and filtered.

'use client';
import { Organisation } from '@/lib/types';
import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/ui/DataTableComponents/dataTableColumnHeader';
import EditDeviceButton from './DeviceButton/EditDeviceButton';
import DeleteDeviceButton from './DeviceButton/DeleteDeviceButton';



export const columns: ColumnDef<Organisation>[] = [
  {
    header: ({ column }) => (
      <DataTableColumnHeader
        className="font-semibold text-foreground"
        column={column}
        title="Device Id"
      />
    ),
    accessorKey: 'ID',
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader
        className="font-semibold text-foreground"
        column={column}
        title="Shutter Open Time"
      />
    ),
    accessorKey: 'ShopOpenTime',
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader
        className="font-semibold text-foreground"
        column={column}
        title="Shutter Close Time"
      />
    ),
    accessorKey: 'ShopCloseTime',
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader
        className="font-semibold text-foreground"
        column={column}
        title="LastAlert"
      />
    ),
    accessorKey: 'CreatedAt',
  },
  {
    header: 'Actions',
    accessorKey: 'Edit&Del',
    cell: ({ row }) => (
     <div className="flex justify-center items-center gap-x-4">
        <EditDeviceButton
          device={{
            device_id: row.getValue('ID'),
            shop_open_time: row.getValue('ShopOpenTime'),
            shop_close_time: row.getValue('ShopCloseTime'),
          }}
        />
        <DeleteDeviceButton 
         device={{
          device_id: row.getValue('ID'),
          shop_open_time: row.getValue('ShopOpenTime'),
          shop_close_time: row.getValue('ShopCloseTime'),
        }}
        />
      </div>
    ),
  }
];
