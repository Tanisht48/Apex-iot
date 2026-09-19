import React, { memo, useEffect, useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Tooltip as ChartTooltip,
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
import { ChartConfig, ChartContainer } from '@/components/ui/chart';
import { useDebouncedDeviceReadingsQuery} from '@/lib/services/ReadingDeviceQuery';

interface MemoizedBarChartProps {
  deviceID: string;
  tickFormat: string;
  chartConfig: ChartConfig;
  timeRange: string;
  startDate?: string | undefined;
  endDate?: string | undefined;
  onChartDataUpdate?: (data: any[]) => void;
}

const MemoizedBarChart = memo<MemoizedBarChartProps>(
  ({ deviceID, tickFormat, chartConfig, timeRange, startDate, endDate, onChartDataUpdate }) => {
    const [formattedData, setFormattedData] = useState<any[]>([]);

    // Fetch device readings data
    const { data: deviceReadings = [], isLoading, error } = useDebouncedDeviceReadingsQuery({
      deviceID,
      startDate,
      endDate,
    });

    

    // Format the tick labels
    const tickFormatter = useMemo(
      () => (timestamp: number) => format(new Date(timestamp), tickFormat),
      [tickFormat]
    );

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
            start = new Date(currentDate.setHours(0, 0, 0, 0));
            end = new Date(currentDate.setHours(23, 59, 59, 999));
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

      return {
        domain: [getTime(start), getTime(end)],
        ticks: generateTicksArray(start, end, timeRange),
      };
    }, [timeRange, startDate, endDate]);
   
   
    useEffect(() => {
      // Format device readings and update state only when new data is available
      if (deviceReadings && Array.isArray(deviceReadings)) {
        const reducedData = deviceReadings
          .map(reading => ({
            ...reading,
            createdAt: new Date(reading.createdAt).getTime(),
          }))
          .filter(
            reading =>
              reading.createdAt >= domain[0] && reading.createdAt <= domain[1]
          )
          .sort((a, b) => a.createdAt - b.createdAt);
        
        // Example: Show only every nth data point
        const nth = Math.ceil(reducedData.length / 100); // Show a maximum of 100 points
        setFormattedData(reducedData.filter((_, index) => index % nth === 0));
      }
    }, [deviceReadings, domain]);

    const yAxisTicks = useMemo(() => {
      if (!formattedData || formattedData.length === 0) return [20,40,60,80,100];

      const maxYValue = Number(Math.max(...formattedData.map(reading => Number(reading.shutterRange)))); // assuming 'shutterRange' is the y-axis data key
      const interval = Math.ceil(maxYValue / 10); // Calculate interval dynamically (10 ticks)
      const ticksArray = [];

      for (let i = 0; i <= maxYValue; i += interval) {
        ticksArray.push(i);
      }

      return ticksArray;
    }, [formattedData]);
    
    return (
        <ChartContainer
          config={chartConfig?.['shutterRange'] as ChartConfig}
          className="flex aspect-auto h-[250px] w-full">
          <BarChart data={formattedData}>
            <CartesianGrid vertical={false} />
            <Legend />
            <XAxis
              dataKey="createdAt"
              type="number"
              domain={domain}
              ticks={ticks}
              tickFormatter={tickFormatter}
              padding={{ left: 50, right: 10 }}
            />
            <YAxis
              orientation="right"
              ticks={yAxisTicks}  // Use the dynamic ticks calculated above
              domain={[0, Math.max(...yAxisTicks)]} // Adjust the domain dynamically based on ticks
            />
            <ChartTooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-background p-2 border rounded shadow">
                      <p className="text-sm text-muted-foreground">
                        Created At: {new Date(data.createdAt).toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Shutter Range: {data.shutterRange}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="shutterRange"
              fill={chartConfig?.['shutterRange']?.color?.toString()}
              legendType="circle"
              background={{ fill: '#ffffff' }}
            />
          </BarChart>
        </ChartContainer>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.deviceID === nextProps.deviceID &&
      prevProps.tickFormat === nextProps.tickFormat &&
      prevProps.chartConfig === nextProps.chartConfig &&
      prevProps.timeRange === nextProps.timeRange &&
      prevProps.startDate === nextProps.startDate &&
      prevProps.endDate === nextProps.endDate
    );
  }
);

MemoizedBarChart.displayName = 'MemoizedBarChart';

export default MemoizedBarChart;
