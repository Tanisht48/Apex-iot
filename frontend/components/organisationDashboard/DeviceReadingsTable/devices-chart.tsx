'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  format,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  getTime,
  parseISO,
  subHours,
  addHours,
  startOfWeek,
  endOfWeek,
  addDays as addDaysToDate,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subWeeks,
  subYears,
  subMonths,
  addWeeks,
  addMonths,
  addYears,
  subDays,
  addDays,
} from 'date-fns';
import { columns } from '@/components/organisationDashboard/DeviceReadingsTable/columns';
import { DataTable } from '@/components/ui/DataTableComponents/data-table';
import { Activity, ArrowLeft, ArrowRight } from 'lucide-react';
import {Card,CardContent,CardDescription,CardHeader,CardTitle} from '@/components/ui/card';
import {ChartConfig,ChartContainer,} from '@/components/ui/chart';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThreeCircles } from 'react-loader-spinner';
import { debounce } from 'lodash';
import { useDebouncedDeviceReadingsQuery } from '@/lib/services/ReadingDeviceQuery';
import MemoizedAreaChart from './MemoizedChart';
import MemoizedBarChart from './MemoizedBarChart';
import { DeviceReadings } from '@/lib/types';
import  DataTableWrapper  from './DataTableWrapper'

interface DeviceReadings2Props {
  initialData :DeviceReadings[];
  deviceID: string;
}
interface CardContainerProps {
  isLoading: boolean;
  children: React.ReactNode;
}


const CardContainer: React.FC<CardContainerProps> = ({ isLoading, children }) => (
  <div className={`w-full ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
    {children}
  </div>
);


const DeviceReadings2 = ({ deviceID,initialData }: DeviceReadings2Props) => {
  const [timeRange, setTimeRange] = useState('1 week');
  const [tickFormatBar, setTickFormatBar] = useState<string>('h:mm a');
  const[tickFormatArea,setTickFormatArea] = useState('EEE');
  const [debouncedDeviceID, setDebouncedDeviceID] = useState(deviceID);
  const [startDate, setStartDate] = useState<string | undefined>('');
  const [endDate, setEndDate] = useState<string | undefined>('');
  const [isAtPresent, setIsAtPresent] = useState(false);
  const fallbackDataRef = useRef<DeviceReadings[]>(initialData);
 
  const keyDisplayMap: { [key: string]: string } = {
    // alertPriority: 'Alert Priority',
    vibrationIntensity: 'Vibration Intensity',
    // batteryLevel: 'Battery Level',
    signalStrength: 'Signal Strength',
    shutterRange: 'Shutter Range',
  };
    
  const chartConfig: { [key: string]: ChartConfig } = Object.keys(
    keyDisplayMap
  ).reduce(
    (acc, key, index) => ({
      ...acc,
      [key]: {
        label: keyDisplayMap[key],
        color: `hsl(var(--chart-${index + 1}))`,
        icon: Activity,
      },
    }),
    {}
  );
  
  


  useEffect(() => {
    const handler = debounce(() => {
      if (deviceID !== debouncedDeviceID) {
        setDebouncedDeviceID(deviceID);
      }
    }, 300);
  
    handler();
  
    return () => {
      handler.cancel();
    };
  }, [deviceID, debouncedDeviceID]);
  

  const handleChartData = (data  : DeviceReadings[]) => {
    fallbackDataRef.current = ([...data]);  // Update state with data received from child
  };
  


  useEffect(() => {
    const fixTime = (date: Date): Date => {
      const fixedDate = new Date(date);
      fixedDate.setHours(0, 0, 0, 0); // Set to 00:00:00
      return fixedDate;
    };
    const currentDate = fixTime(new Date());
    let domainStart: Date;
    let domainEnd: Date;
   
    const calculateTimeRange = () => {
  
      switch (timeRange) {
        case '1D':
          domainStart = currentDate
          domainEnd = addHours(currentDate, 24);
          setTickFormatBar('EEE d h:mma');
          setTickFormatArea('d h:mma')
          break;
  
        case '1 week':
          domainStart = startOfWeek(currentDate, { weekStartsOn: 1 });
          domainEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
          setTickFormatBar('EEE d');
          setTickFormatArea('EEE');
          break;
  
        case '1 month':
          domainStart = startOfMonth(currentDate);
          domainEnd = endOfMonth(currentDate);
          setTickFormatBar('MMM d');
          setTickFormatArea('MMM d');
          break;
  
        case '1 year':
          domainStart = startOfYear(currentDate);
          domainEnd = endOfYear(currentDate);
          setTickFormatBar('MMM yy');
          setTickFormatArea('MMM yy');
          break;
  
        default:
          domainStart = startOfWeek(currentDate, { weekStartsOn: 1 });
          domainEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
          setTickFormatBar('EEE d');
          setTickFormatArea('EEE')
      }
         // Update state if necessary
         setStartDate(domainStart.toISOString());
         setEndDate(domainEnd.toISOString());
     
    };
    
    calculateTimeRange();
  }, [timeRange]);
  

  // if (isLoading) {
  //   return (
  //     <div className="flex justify-center items-center h-screen">
  //       <ThreeCircles />
  //     </div>
  //   );
  // }

  // if (error) {
  //   return <div>{error.message}</div>;
  // }
  function handlePrevClick(timeRange: string): void {
    let newStart: Date | undefined;
    let newEnd: Date | undefined;
  
    const fixTime = (date: Date): Date => {
      const fixedDate = new Date(date);
      fixedDate.setHours(0, 0, 0, 0); // Set to 00:00:00
      return fixedDate;
    };
  
    switch (timeRange) {
      case '1D':
       
        newStart = fixTime(subDays(new Date(startDate || ''), 1));
        newEnd = addDays(newStart, 1);
        break;
      case '1 week':
      
        newStart = startOfWeek(subWeeks(new Date(startDate || ''), 1), { weekStartsOn: 1 });
        newEnd = endOfWeek(newStart, { weekStartsOn: 1 });
        break;
      case '1 month':
       
        newStart = startOfMonth(subMonths(new Date(startDate || ''), 1));
        newEnd = endOfMonth(newStart);
        break;
      case '1 year':
      
        newStart = startOfYear(subYears(new Date(startDate || ''), 1));
        newEnd = endOfYear(newStart);
        break;
      default:
        newStart = startOfWeek(subWeeks(new Date(startDate || ''), 1), { weekStartsOn: 1 });
        newEnd = endOfWeek(newStart, { weekStartsOn: 1 });
        
    }
  
     if (newStart && newEnd) {
      setStartDate(newStart.toISOString());
      setEndDate(newEnd.toISOString());
      setIsAtPresent(false);
    }
  }
  
  function handleNextClick(timeRange: string): void {
    let newStart: Date | undefined;
    let newEnd: Date | undefined;
  
    switch (timeRange) {
      case '1D':
        newStart = addDays(new Date(startDate || ''), 1);
        newEnd = addDays(newStart, 1);
        break;
      case '1 week':
        
        newStart = startOfWeek(addWeeks(new Date(startDate || ''), 1), { weekStartsOn: 1 });
        newEnd = endOfWeek(newStart, { weekStartsOn: 1 });
        break;
      case '1 month':
        
        newStart = startOfMonth(addMonths(new Date(startDate || ''), 1));
        newEnd = endOfMonth(newStart);
        break;
      case '1 year':
        
        newStart = startOfYear(addYears(new Date(startDate || ''), 1));
        newEnd = endOfYear(newStart);
        break;
      default:
        newStart = startOfWeek(addWeeks(new Date(startDate || ''), 1), { weekStartsOn: 1 });
        newEnd = endOfWeek(newStart, { weekStartsOn: 1 });
       
    }
  
    if (newStart && newEnd) {
      setStartDate(newStart.toISOString());
      setEndDate(newEnd.toISOString());
  
      // Modify the isAtPresent condition to compare only dates (not exact times)
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);  // Normalizes current date to 00:00:00
      const endDateNormalized = new Date(newEnd);
      endDateNormalized.setHours(0, 0, 0, 0);  // Normalizes newEnd to 00:00:00
  
      setIsAtPresent(currentDate >= endDateNormalized);  // Check only dates, ignoring time
    }
  }
  

  

    return (
      <div className="space-y-4">
        {/* Card for shutterRange */}
       
        <Card className="w-full"  style={{ backgroundColor: 'hsl(336, 10%, 10%, 1)' }}>
          <CardHeader className="p-2 py-4">
            <CardTitle className="text-base font-medium"></CardTitle>
            
            <div className="flex items-center justify-between text-white">
              {/* Previous Button */}
              <div
                className="flex items-center cursor-pointer hover:text-blue-600 transition duration-200"
                onClick={() => handlePrevClick(timeRange)}
              >
                <ArrowLeft className="w-6 h-6 mr-2" /> Prev
              </div>

              {/* Tabs for Time Range Selection */}
              <Tabs defaultValue={timeRange} onValueChange={setTimeRange}>
                <TabsList aria-label="Time Range" className="flex">
                  <TabsTrigger value="1D">Day</TabsTrigger>
                  <TabsTrigger value="1 week">Week</TabsTrigger>
                  <TabsTrigger value="1 month">Month</TabsTrigger>
                  <TabsTrigger value="1 year">Year</TabsTrigger>
                </TabsList>
              </Tabs>
              
              {/* Next Button */}
              <div
                className="flex items-center cursor-pointer hover:text-blue-600 transition duration-200"
                onClick={() => handleNextClick(timeRange)}
              >
                Next <ArrowRight className="w-6 h-6 ml-2" />
              </div>
            </div>
          </CardHeader>
          <div className="mb-4">
          </div>
          <CardContent>
          <ChartContainer
            config={chartConfig?.['shutterRange'] as ChartConfig}
              className="flex aspect-auto h-[250px] w-full">
              <MemoizedBarChart
                deviceID={debouncedDeviceID}
                tickFormat={tickFormatBar}
                chartConfig={chartConfig}
                timeRange={timeRange}
                startDate={startDate}  // Pass the optional startDate
                endDate={endDate}      // Pass the optional endDate
              />
          </ChartContainer>
          </CardContent>
        </Card>
            
        <Card className="w-full"  style={{ backgroundColor: 'hsl(336, 10%, 10%, 1)' }}>
          <CardContent className="w-full p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-12 md:gap-16 ">
              {Object.entries(keyDisplayMap)
                .filter(([key]) => key !== 'shutterRange')
                .map(([key, value]) => (
                  <ChartContainer
                    className="aspect-auto w-full h-fit"
                    key={key}
                    config={chartConfig[key]}
                  >
                    <div className="">
                      <CardTitle className="mb-4 text-sm tracking-wide font-semibold">
                        {value}
                      </CardTitle>
                        <MemoizedAreaChart
                          deviceID={deviceID}
                          tickFormat={tickFormatArea}
                          dataKey={key}
                          chartConfig={chartConfig}
                          startDate={startDate}
                          endDate={endDate}
                          timeRange={timeRange}
                        />
                    </div>
                  </ChartContainer>
                ))}
            </div>
          </CardContent>
        </Card>
        {/* @ts-ignore */}
        <DataTableWrapper
          deviceID={debouncedDeviceID}
          startDate={startDate}
          endDate={endDate}
          timeRange={timeRange}
        />
       
      </div>
    );
  }


export default React.memo(DeviceReadings2);
