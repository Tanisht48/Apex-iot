'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import DeviceReadings2 from '@/components/organisationDashboard/DeviceReadingsTable/devices-chart';
import { DeviceTable } from '@/components/organisationDashboard/DeviceTable/DeviceTable';
import { DeviceReadings } from '@/lib/types';
import { ArrowLeft } from 'lucide-react'; // Importing the arrow icon from Lucide

interface DeviceDashboardProps {
  Data: DeviceReadings[];
}

const DeviceDashboard: React.FC<DeviceDashboardProps> = ({ Data }) => {
  const [selectedDeviceID, setSelectedDeviceID] = useState<string | null>(null);
  const router = useRouter();

  // const handleBackClick = () => {
  //   router.push('/organisations'); // Navigate to /organisation
  // };

  return (
    <div className="flex flex-col w-full gap-4">
      {/* Back arrow
      <div
        className="flex items-center cursor-pointer text-blue-500 hover:text-blue-600 transition duration-200"
        onClick={handleBackClick}
      >
        <ArrowLeft className="w-6 h-6 mr-2" />
        <span>Back</span>
      </div> */}

      {/* Display the device table */}
      <DeviceTable setSelectedDeviceID={setSelectedDeviceID} />

      {/* Always show the device readings, using selectedDeviceID */}
      <DeviceReadings2 deviceID={selectedDeviceID as string} initialData={Data} />
    </div>
  );
};

export default DeviceDashboard;
