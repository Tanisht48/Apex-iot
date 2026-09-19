import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getDeviceReadings } from '@/server-actions/devices';
import { DeviceReadings } from '@/lib/types';
import { debounce } from 'lodash';

type UseDebouncedDeviceReadingsQueryParams = {
  deviceID: string;
  debounceTime?: number;
  startDate?: string;
  endDate?: string;
  limit?: number;
};

export function useDebouncedDeviceReadingsQuery({
  deviceID,
  debounceTime = 300,
  startDate,
  endDate,
  limit = 400, // Default value of 200 if not provided
}: UseDebouncedDeviceReadingsQueryParams) {
  const [debouncedDeviceID, setDebouncedDeviceID] = useState(deviceID);
  const queryClient = useQueryClient();

  useEffect(() => {
    const handler = debounce(() => {
      setDebouncedDeviceID(deviceID);
    }, debounceTime);

    handler();

    return () => {
      handler.cancel();
    };
  }, [deviceID, debounceTime]);

  useEffect(() => {
    if (debouncedDeviceID) {
      queryClient.prefetchQuery({
        queryKey: ['deviceReadings', debouncedDeviceID, startDate, endDate, limit], // Include limit in query key
        queryFn: () =>
          getDeviceReadings({
            deviceID: debouncedDeviceID,
            createdAtStart: startDate,
            createdAtEnd: endDate,
            limit,
          }),
      });
    }
  }, [debouncedDeviceID, startDate, endDate, limit, queryClient]);

  const queryResult = useQuery<DeviceReadings[]>({
    queryKey: ['deviceReadings', debouncedDeviceID, startDate, endDate, limit], // Include limit in query key
    queryFn: async () => {
      return await getDeviceReadings({
        deviceID: debouncedDeviceID,
        createdAtStart: startDate,
        createdAtEnd: endDate,
        limit,
      });
    },
    enabled: !!debouncedDeviceID,
    initialData: () => {
      return queryClient.getQueryData(['deviceReadings', debouncedDeviceID, startDate, endDate, limit]) as DeviceReadings[] | undefined;
    },
    staleTime: 5 * 60 * 1000, // Data is considered fresh for 5 minutes
  });

  return queryResult;
}
