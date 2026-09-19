'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '../../ui/DataTableComponents/dataTableColumnHeader';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Battery, BatteryLow, BatteryFull, BatteryMedium, BatteryWarning, TriangleAlert } from "lucide-react";
import { Signal, SignalHigh, SignalLow, SignalMedium, SignalZero } from "lucide-react";
import { ChevronRightIcon } from '@radix-ui/react-icons';

export type Device = {
  id: string;
  device_id: string;
  shutterRange: string;
  shutterClosed: boolean;
  alertPriority: number;
  vibrationIntensity: number;
  batteryLevel: number;
  isDocked: boolean;
  signalStrength: number;
  shopOpenTime: string;
  shopCloseTime: string;
  lastAlert: string;
  createdAt: string;
};

export const columns: ColumnDef<Device>[] = [
  {
    header: ({ column }) => (
      <DataTableColumnHeader
        className="font-semibold text-foreground"
        column={column}
        title="Device ID"
      />
    ),
    accessorKey: 'device_id',
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader
        className="font-semibold text-foreground"
        column={column}
        title="Shutter Status & Last Alert"
      />
    ),
    accessorKey: 'shutterClosed',
    cell: ({ row }) => (
      <div className="flex flex-row gap-3">
        <div>{row.original.shutterClosed ?
          <div className='text-lime rounded bg-neutral-900 px-2 py-1 text-xs font-semibold text-white'>Inactive</div>
          :
          <div className='text-lime-400 rounded bg-neutral-900 px-2 py-1 text-xs font-semibold'>Active</div>
        }</div>
        <div>{new Date(row.original.lastAlert).toLocaleString()}</div>
      </div>
    ),
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader
        className="font-semibold text-foreground"
        column={column}
        title="Battery"
      />
    ),
    accessorKey: 'batteryLevel',
    cell: ({ row }) => {
      const batteryLevel = row.original.batteryLevel;
      if (batteryLevel > 80) {
        return <div>
          <BatteryFull className='dark:text-steel-blue' />
        </div>;
      } else if (batteryLevel > 50) {
        return <div>
          <BatteryMedium className='dark:text-steel-blue' />
        </div>;
      } else if (batteryLevel > 30) {
        return <div>
          <BatteryLow className='dark:text-steel-blue' />
        </div>;
      }
      else if (batteryLevel > 15) {
        return <div>
          <Battery className='dark:text-steel-blue' />
        </div>;
      } else {
        return <div>
          <BatteryWarning className='dark:text-steel-blue' />
        </div>;
      }
    },
  },

  {
    header: ({ column }) => (
      <DataTableColumnHeader
        className="font-semibold text-foreground"
        column={column}
        title="Signal"
      />
    ),
    accessorKey: 'signalStrength',
    cell: ({ row }) => {
      const signalStrength = row.original.signalStrength;
      if (signalStrength > -50) {
        return <div>
          <Signal className='dark:text-steel-blue' />
        </div>;
      } else if (signalStrength > -70) {
        return <div>
          <SignalHigh className='dark:text-steel-blue' />
        </div>;
      } else if (signalStrength > -80) {
        return <div>
          <SignalMedium className='dark:text-steel-blue' />
        </div>;
      } else if (signalStrength > -90) {
        return <div>
          <SignalLow className='dark:text-steel-blue' />
        </div>;
      } else {
        return <div>
          <SignalZero className='dark:text-steel-blue' />
        </div>;
      }

    },
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader
        className="font-semibold text-foreground"
        column={column}
        title="Alert"
      />
    ),
    accessorKey: 'alertPriority',
    cell: ({ row }) => {
      const alertPriority = row.original.alertPriority;
      if (alertPriority <= 2) {
        return <div className=' ml-1 flex flex-row gap-1 justify-start items-center w-fit px-1 rounded bg-steel-blue text-black'>
          <TriangleAlert className='h-4 w-4' />
          <span className='text-s font-semibold '>2</span>
        </div>;
      } else if (alertPriority === 3) {
        return <div className=' ml-1 flex flex-row gap-1 justify-start items-center w-fit px-1 rounded bg-[#DC7609] text-destructive-foreground'>
          <TriangleAlert className='h-4 w-4' />
          <span className='text-s font-semibold '>3</span>
        </div>;
      } else {
        return <div className=' ml-1 flex flex-row gap-1 justify-start items-center w-fit px-1 rounded bg-destructive text-destructive-foreground'>
          <TriangleAlert className='h-4 w-4' />
          <span className='text-s font-semibold '>5</span>
        </div>;
      }
    },
  },

  {
    header: 'Details',
    accessorKey: 'id',
    cell: ({ row }: { row: any }) => (
      <Link
        href={{
          pathname: `/devices/device-details-will-come-here`,
        }}
        passHref
      >
        <Button
          variant="outline"
          className="px-6 py-2 rounded-sm bg-none"
          onClick={(e) => e.stopPropagation()}
        >
          <ChevronRightIcon />
        </Button>
      </Link>
    ),
  },
];
