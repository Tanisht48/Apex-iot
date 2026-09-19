// Note: Columns are where you define the core of what your table will look like. They define the data that will be displayed, how it will be formatted, sorted and filtered.

'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '../../ui/DataTableComponents/dataTableColumnHeader';
import {
  Battery,
  BatteryLow,
  BatteryFull,
  BatteryMedium,
  BatteryWarning,
  TriangleAlert,
} from 'lucide-react';
import {
  Signal,
  SignalHigh,
  SignalLow,
  SignalMedium,
  SignalZero,
} from 'lucide-react';
import { DeviceReadings } from '@/lib/types';

export const columns: ColumnDef<DeviceReadings>[] = [
  {
    header: ({ column }) => (
      <DataTableColumnHeader
        className="font-semibold text-foreground"
        column={column}
        title="Time"
      />
    ),
    accessorKey: 'createdAt',
    cell: ({ row }) => (
      <div className="flex flex-row gap-3">
        <div>{new Date(row.original.createdAt).toLocaleString()}</div>
      </div>
    ),
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader
        className="font-semibold text-foreground"
        column={column}
        title="Battery %"
      />
    ),
    accessorKey: 'batteryLevel',
    cell: ({ row }) => {
      const batteryLevel = row.original.batteryLevel;
      if (batteryLevel > 80) {
        return (
          <div className="bg-muted">
            <BatteryFull className=" text-green-600 dark:text-green-400" />
          </div>
        );
      } else if (batteryLevel > 50) {
        return (
          <div>
            <BatteryMedium className="text-green-600 dark:text-green-400" />
          </div>
        );
      } else if (batteryLevel > 30) {
        return (
          <div>
            <BatteryLow className="text-destructive" />
          </div>
        );
      } else if (batteryLevel > 15) {
        return (
          <div>
            <Battery className="text-destructive" />
          </div>
        );
      } else {
        return (
          <div>
            <BatteryWarning className="text-destructive" />
          </div>
        );
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
        return (
          <div className="flex flex-row gap-1">
            <Signal />
            <div className="font-semibold">{signalStrength}</div>
          </div>
        );
      } else if (signalStrength > -70) {
        return (
          <div className="flex flex-row gap-1">
            <SignalHigh />
            <div className="font-semibold">{signalStrength}</div>
          </div>
        );
      } else if (signalStrength > -80) {
        return (
          <div className="flex flex-row gap-1">
            <SignalMedium />
            <div className="font-semibold">{signalStrength}</div>
          </div>
        );
      } else if (signalStrength > -90) {
        return (
          <div className="flex flex-row gap-1">
            <SignalLow />
            <div className="font-semibold">{signalStrength}</div>
          </div>
        );
      } else {
        return (
          <div className="flex flex-row gap-1">
            <SignalZero className="dark:text-steel-blue" />
            <div className="font-semibold">{signalStrength}</div>
          </div>
        );
      }
    },
  },
  // {
  //   header: ({ column }) => (
  //     <DataTableColumnHeader
  //       className="font-semibold text-foreground"
  //       column={column}
  //       title="Alert"
  //     />
  //   ),
  //   accessorKey: 'alertPriority',
  //   cell: ({ row }) => {
  //     const alertPriority = row.original.alertPriority;
  //     if (alertPriority <= 2) {
  //       return (
  //         <div className=" ml-1 flex flex-row gap-1 justify-start items-center w-fit px-1 rounded bg-steel-blue text-black">
  //           <TriangleAlert className="h-4 w-4" />
  //           <span className="text-s font-semibold ">2</span>
  //         </div>
  //       );
  //     } else if (alertPriority === 3) {
  //       return (
  //         <div className=" ml-1 flex flex-row gap-1 justify-start items-center w-fit px-1 rounded bg-[#DC7609] text-destructive-foreground">
  //           <TriangleAlert className="h-4 w-4" />
  //           <span className="text-s font-semibold ">3</span>
  //         </div>
  //       );
  //     } else {
  //       return (
  //         <div className=" ml-1 flex flex-row gap-1 justify-start items-center w-fit px-1 rounded bg-destructive text-destructive-foreground">
  //           <TriangleAlert className="h-4 w-4" />
  //           <span className="text-s font-semibold ">5</span>
  //         </div>
  //       );
  //     }
  //   },
  // },
  {
    header: ({ column }) => (
      <DataTableColumnHeader
        className="font-semibold text-foreground"
        column={column}
        title="Docked ?"
      />
    ),
    accessorKey: 'isDocked',
    cell: ({ row }) => {
      const isDocked = row.getValue('isDocked');
      if (isDocked) {
        return (
          <div className="flex flex-row gap-1 py-1 bg-green-950 items-center rounded-full mx-auto max-w-20">
            <p className="text-xs tracking-tighter font-semibold w-full text-green-500 text-center">
              Yes
            </p>
          </div>
        );
      } else {
        return (
          <div className="flex flex-row gap-1 py-1 bg-red-950   items-center rounded-full mx-auto max-w-20">
            <p className="text-xs tracking-tighter font-semibold w-full text-red-500 text-center">
              No
            </p>
          </div>
        );
      }
    },
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader
        className="font-semibold text-foreground"
        column={column}
        title="Vibration Intensity"
      />
    ),
    accessorKey: 'vibrationIntensity',
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader
        className="font-semibold text-foreground"
        column={column}
        title="Shutter Range"
      />
    ),
    accessorKey: 'shutterRange',
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader
        className="font-semibold text-foreground"
        column={column}
        title="Shutter Closed"
      />
    ),
    accessorKey: 'shutterClosed',
    cell: ({ row }) => {
      const shutterClosed = row.getValue('shutterClosed');
      return (
        <div className="flex flex-row gap-1 py-1 items-center rounded-full bg-muted mx-auto max-w-16">
          <p className="text-xs tracking-tighter font-semibold w-full text-center">
            {shutterClosed ? 'Yes' : 'No'}
          </p>
        </div>
      );
    },
  },
];
