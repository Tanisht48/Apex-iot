import React, { memo, useState } from 'react';
import { DataTable } from '@/components/ui/DataTableComponents/data-table';
import { columns } from '@/components/organisationDashboard/DeviceReadingsTable/columns';
import { DeviceReadings } from '@/lib/types';
import { useDebouncedDeviceReadingsQuery } from '@/lib/services/ReadingDeviceQuery';

// Define the props for the DataTableWrapper component
interface DataTableWrapperProps {
  deviceID: string;
  startDate: string | undefined;
  endDate: string | undefined;
  timeRange: string;
}

const DataTableWrapper = memo<DataTableWrapperProps>(({ deviceID, startDate, endDate, timeRange }) => {
  // State to manage the limit of data rows
  const [limit, setLimit] = useState<number>(400); // Default limit set to 200

  // Use the custom hook to fetch data with the current limit
  const { data: deviceReadings = [], isLoading, error } = useDebouncedDeviceReadingsQuery({
    deviceID,
    startDate,
    endDate,
    limit,
  });


  return (
    <div className="table-container relative">
      {isLoading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}
      <DataTable data={deviceReadings as DeviceReadings[] | []} columns={columns} />
    </div>
  );
});

DataTableWrapper.displayName = 'DataTableWrapper'
export default DataTableWrapper;
