import React, { memo, useMemo } from 'react';
import {
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  Legend,
  Area,
  ResponsiveContainer,
} from 'recharts';
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  eachDayOfInterval,
  getTime,
} from 'date-fns';
import { ChartConfig, ChartTooltipContent } from '@/components/ui/chart';
import { DeviceReadings } from '@/lib/types';
import { useDebouncedDeviceReadingsQuery } from '@/lib/services/ReadingDeviceQuery'; // Ensure the path is correct

// Define the props interface
interface MemoizedAreaChartProps {
  deviceID: string;
  tickFormat: string;
  dataKey: string;
  chartConfig: ChartConfig;
  timeRange: string;
  startDate?: string | undefined;
  endDate?: string | undefined;
}

// Memoized Area Chart Component
const MemoizedAreaChart = memo(
  ({
    deviceID,
    tickFormat,
    dataKey,
    chartConfig,
    timeRange,
    startDate,
    endDate,
  }: MemoizedAreaChartProps) => {
    console.log('Component Rendered: MemoizedAreaChart');
    console.log('Props:', { deviceID, tickFormat, dataKey, chartConfig, timeRange, startDate, endDate });
   
    // Fetch device readings data
    const { data: deviceReadings = [], isLoading, error } = useDebouncedDeviceReadingsQuery({
      deviceID,
      startDate,
      endDate,
    });

    // console.log('Device Readings Fetched:', deviceReadings);
    // console.log('Is Loading:', isLoading);
    // console.log('Error:', error);

    

    // Calculate domain and ticks based on the time range
    const { domain, ticks } = useMemo(() => {
      let start: Date;
      let end: Date;

      const currentDate = new Date();
      if (startDate && endDate) {
        start = new Date(startDate);
        end = new Date(endDate);
      } else {
        switch (timeRange) {
          case '1D':
            start = new Date(currentDate); 
            start.setHours(0, 0, 0, 0); 
        
            end = new Date(currentDate); 
            end.setHours(23, 59, 59, 999); 
            break;
          case '1 week':
            start = startOfWeek(currentDate, { weekStartsOn: 1 });
            end = endOfWeek(currentDate, { weekStartsOn: 1 });
            break;
          case '1 month':
            start = startOfMonth(currentDate);
            end = endOfMonth(currentDate);
            break;
          case '1 year':
            start = startOfYear(currentDate);
            end = endOfYear(currentDate);
            break;
          default:
            start = startOfWeek(currentDate, { weekStartsOn: 1 });
            end = endOfWeek(currentDate, { weekStartsOn: 1 });
        }
      }

      console.log('Start Date:', start);
      console.log('End Date:', end);

      const generateTicksArray = (start: Date, end: Date, timeRange: string): number[] => {
        switch (timeRange) {
          case '1D':
            return Array.from({ length: 7 }, (_, i) => {
              const tickTime = new Date(start);
              tickTime.setHours(i * 4);
              return getTime(tickTime);
            });
          case '1 week':
            return eachDayOfInterval({ start, end }).map(date => getTime(date));
          case '1 month':
            return eachDayOfInterval({ start, end })
              .filter((_, index) => index % 5 === 0)
              .map(date => getTime(date));
          case '1 year':
            return Array.from({ length: 12 }, (_, i) => {
              const monthStart = new Date(start.getFullYear(), i, 1);
              return getTime(monthStart);
            });
          default:
            return eachDayOfInterval({ start, end }).map(date => getTime(date));
        }
      };

      const ticksArray = generateTicksArray(start, end, timeRange);
      //console.log('Generated Ticks Array:', ticksArray);

      return {
        domain: [getTime(start), getTime(end)],
        ticks: ticksArray,
      };
    }, [timeRange, startDate, endDate]);
    
    const tickFormatter = useMemo(
      () => (timestamp: number) => format(new Date(timestamp), tickFormat),
      [tickFormat]
    );
    
    const yAxisTicks = useMemo(() => {
      if (!deviceReadings || deviceReadings.length === 0) return [20,40,60,80,100];

      const maxYValue = Number(Math.max(...deviceReadings.map(reading => Number(reading.shutterRange)))); // assuming 'shutterRange' is the y-axis data key
      const interval = Math.ceil(maxYValue / 10); // Calculate interval dynamically (10 ticks)
      const ticksArray = [];

      for (let i = 0; i <= maxYValue; i += interval) {
        ticksArray.push(i);
      }

      return ticksArray;
    }, [deviceReadings]);

    // Format device readings
    const formattedData = useMemo(() => {
      if (!deviceReadings || !Array.isArray(deviceReadings)) {
       // console.log('No device readings or data is not an array');
        return [];
      }
      
      const formatted = deviceReadings
        .map(reading => ({
          ...reading,
          createdAt: new Date(reading.createdAt).getTime(),
        }))
        .filter(
          reading =>
            reading.createdAt >= domain[0] && reading.createdAt <= domain[1]
        )
        .sort((a, b) => a.createdAt - b.createdAt);
      
      console.log('Formatted Data:', formatted);
      return formatted;
    }, [deviceReadings, domain]);

    console.log('Final Formatted Data to be Rendered:', formattedData);

    return (
      <ResponsiveContainer
        width="100%"
        height={275}
        className="aspect-auto w-full"
      >
          <AreaChart
            data={formattedData || []}
            margin={{ top: 0, right: 0, left: -35, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="5 5"
              fill="background"
              fillOpacity={0.6}
            />
            <XAxis
              dataKey="createdAt"
              type="number"
              domain={domain}
              ticks={ticks}
              tickFormatter={tickFormatter}
              interval={0}
              padding={{ left: 25, right: 35 }}
            />
            <YAxis />
            <ChartTooltip
              content={
                <ChartTooltipContent labelKey={dataKey} nameKey={dataKey} />
              }
            />
            <Legend />
            <Area
              type="monotone"
              dataKey={dataKey}
              legendType="square"
              stroke={chartConfig?.[dataKey]?.color?.toString()}
              fill={chartConfig?.[dataKey]?.color?.toString()}
              fillOpacity={0.4}
            />
          </AreaChart>
        
      </ResponsiveContainer>
    );
  }
);

MemoizedAreaChart.displayName = 'MemoizedAreaChart'
export default MemoizedAreaChart;
