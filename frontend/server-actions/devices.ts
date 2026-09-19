'use server';
import { z } from 'zod';
import { API_URL } from '../lib/constants';
import { cookies } from 'next/headers';
import { FetchError, DeviceReadings, GetDeviceReadingsParams,DeviceAndLatestRecordData, DeviceConfigPayload, Device } from '@/lib/types';

const DeviceReadingsSchema = z.object({
  id: z.string(),
  alertPriority: z.number(),
  batteryLevel: z.number(),
  createdAt: z.string(),
  device_id: z.string(),
  isDocked: z.boolean(),
  lastAlert: z.string(),
  shutterClosed: z.boolean(),
  shutterRange: z.string(),
  signalStrength: z.number(),
  vibrationIntensity: z.number(),
});

const DeviceReadingsArraySchema = z.array(DeviceReadingsSchema);

export async function getDeviceReadings({
  deviceID,
  createdAtStart,
  createdAtEnd,
  limit = 200,  // Default limit is 200 if not provided
}: GetDeviceReadingsParams): Promise<DeviceReadings[]> {

  console.log('getDeviceReadings called with:', { deviceID, createdAtStart, createdAtEnd, limit });

  // Helper function to get the date string with an offset of 'daysOffset' days from today
  const getDefaultDate = (daysOffset: number): string => {
    const date = new Date();
    date.setDate(date.getDate() - daysOffset);
    return date.toISOString();
  };

  // Set default date range to the past 7 days
  const defaultEndDate = new Date().toISOString();
  const defaultStartDate = getDefaultDate(7);

  // Log default dates
  console.log('Default date range:', { defaultStartDate, defaultEndDate });

  // Use provided dates if available, otherwise use default dates
  const startDate = createdAtStart || defaultStartDate;
  const endDate = createdAtEnd || defaultEndDate;

  // Log final date range used for the API request
  console.log('Final date range for API request:', { startDate, endDate });

  // Retrieve the JWT token from cookies
  const value = cookies().get('jwt_token')?.value;
  console.log('JWT token retrieved:', value ? 'Token exists' : 'No token found');

  try {
    // Construct query parameters
    const queryParams = new URLSearchParams({
      createdAtStart: startDate,
      createdAtEnd: endDate,
      ...(limit ? { limit: limit.toString() } : {}),  // Include limit if provided
    });

    // Log the constructed query parameters
    console.log('Query parameters:', queryParams.toString());

    // Fetch data from API with the constructed query string
    const res = await fetch(`${API_URL}/deviceRecord/${deviceID}?${queryParams.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
         Authorization: `${value}`,
      },
      credentials: 'include'  
    });

    // Log the response status
    console.log('API response status:', res.status);

    // Handle non-OK response status
    if (!res.ok) {
      console.error(`API responded with status ${res.status}`);
      throw new Error(`API responded with status ${res.status}`);
    }

    // Parse the response data
    const data = await res.json();
    
    // Log the received data before validation
    console.log('Data received from API:', data);

    try {
      // Validate the data using your schema
      const validatedData = DeviceReadingsArraySchema.parse(data);
      
      // Log the validated data
      console.log('Validated data:', validatedData);

      return validatedData;
    } catch (validationError) {
      console.error('Validation error:', validationError);
      throw validationError;
    }
  } catch (error) {
    console.error('Error fetching device readings:', error);
    throw error;
  }
}



const DeviceSchema = z.object({
  Device: z.object({
    ID: z.string(),
    OrgID: z.string(),
    CreatedAt: z.string(),
    UpdatedAt: z.union([z.string(), z.null()]),
    ShopCloseTime: z.union([z.string(), z.null()]).optional().default(null), // Set default to null
    ShopOpenTime: z.union([z.string(), z.null()]).optional().default(null),  // Set default to null
  }),
  LatestRecord: DeviceReadingsSchema,
});

const DeviceArraySchema = z.array(DeviceSchema);

export async function getDevicesByOrganisationId(
  organisationId: string
): Promise<DeviceAndLatestRecordData[] | FetchError> {
  const token = cookies().get('jwt_token')?.value;
  const url = `${API_URL}/device/organization/${organisationId}`;

  try {
    console.log(`F2 | Fetching devices for organisation ID: ${organisationId}...✅`);
    console.log(`F2 | Request URL: ${url}`);

    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
         Authorization: `${token}`, // Use Bearer token format
      },
      credentials: 'include'
    });

    console.log(`F2 | Response status: ${res.status}`);
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Error response from API:', errorText);
      return { error: true, message: `Fetch error: ${res.statusText}` }; // Return proper FetchError
    }

    const responseText = await res.text();
    console.log(`F2 | Response text: ${responseText}`);

    try {
      const data = JSON.parse(responseText);
      console.log('F2 | Parsed data ✅', data);

      if (Array.isArray(data)) {
        // Validate against the schema
        const parsedData = DeviceArraySchema.parse(data);
        return parsedData;
      } else {
        console.log('F2 | Unexpected data structure');
        return { error: true, message: 'Unexpected data structure' };
      }
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      return { error: true, message: 'Error parsing API response' };
    }
  } catch (error) {
    console.error('Error fetching devices:', error);
    return {
      error: true,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}



export async function updateDevice(
  payload: DeviceConfigPayload
): Promise<{ success: boolean; message: string }> {
  const token = cookies().get('jwt_token')?.value;
  const url = `${API_URL}/device/`;

  try {
    console.log(`Updating device ID: ${payload.device_id} for organisation ID: ${payload.org_id}...✅`);
    console.log(`Request URL: ${url}`);

    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
         Authorization: `${token}`,
      },
      body: JSON.stringify(payload),
      credentials: 'include'
    });

    console.log(`Response status: ${res.status}`);

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Error response from API:', errorText);
      // Return a generic error object instead of throwing
      return { success: false, message: 'Failed to update the device. Please try again later.' };
    }

    const responseText = await res.text();
    console.log(`Response text: ${responseText}`);

    try {
      const data = JSON.parse(responseText);
      console.log('Parsed response data ✅', data);
      return { success: true, message: 'Device updated successfully' };
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      // Return a generic error object instead of throwing
      return { success: false, message: 'Failed to update the device. Please try again later.' };
    }
  } catch (error) {
    console.error('Error updating device:', error);
    // Return a generic error object instead of throwing
    return { success: false, message: 'Failed to update the device. Please try again later.' };
  }
}



//For Future Use
export async function deleteDevice(deviceId: string): Promise<void | FetchError> {
  const token = cookies().get('jwt_token')?.value;
  const url = `${API_URL}/device/${deviceId}`;

  try {
    console.log(`Deleting device with ID: ${deviceId}...`);
    console.log(`Request URL: ${url}`);

    const res = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${token}`, // Use Bearer token format
      },
      credentials: 'include'
    });

    console.log(`Response status: ${res.status}`);
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Error response from API:', errorText);
      return { error: true, message: `Fetch error: ${res.statusText}` }; // Return proper FetchError
    }

    console.log('Device deleted successfully');
  } catch (error) {
    console.error('Error deleting device:', error);
    return {
      error: true,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}


export async function createDevice(
  payload: DeviceConfigPayload
): Promise<{ success: boolean; message: string }> {
  
  const token = cookies().get('jwt_token')?.value;
  const url = `${API_URL}/device/`;

  try {
    console.log(`Updating device ID: ${payload.device_id} for organisation ID: ${payload.org_id}...✅`);
    console.log(`Request URL: ${url}`);

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
         Authorization: `${token}`,
      },
      body: JSON.stringify(payload),
      credentials: 'include'
    });

    console.log(`Response status: ${res.status}`);

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Error response from API:', errorText);
      // Return a generic error object instead of throwing
      return { success: false, message: 'Failed to create the device. Please try again later.' };
    }

    const responseText = await res.text();
    console.log(`Response text: ${responseText}`);

    try {
      const data = JSON.parse(responseText);
      console.log('Parsed response data ✅', data);
      return { success: true, message: 'Device Created successfully' };
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      // Return a generic error object instead of throwing
      return { success: false, message: 'Failed to Create the device. Please try again later.' };
    }
  } catch (error) {
    console.error('Error create device:', error);
    // Return a generic error object instead of throwing
    return { success: false, message: 'Failed to Create the device. Please try again later.' };
  }
}

export async function getAllDevices(): Promise<{ success: boolean; devices: Device[]; message?: string }> {
  const token = cookies().get('jwt_token')?.value;
  const url = `${API_URL}/device/`;

  try {
    console.log(`Fetching all devices...✅`);
    console.log(`Request URL: ${url}`);

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization':`${token}`,
      },
      credentials: 'include'
    });

    console.log(`Response status: ${res.status}`);

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Error response from API:', errorText);
      return { success: false, devices: [], message: 'Failed to fetch devices. Please try again later.' };
    }

    const responseData: DeviceAndLatestRecordData[] = await res.json();
    console.log(`Response data:`, responseData);

    // Filter devices where OrgID is empty, undefined, or null
    const filteredDevices = responseData
      .map((item) => item.Device)
      .filter((device) => !device.OrgID || device.OrgID.trim() === '');

    console.log('Filtered devices with empty OrgID ✅', filteredDevices);

    return { success: true, devices: filteredDevices };

  } catch (error) {
    console.error('Error fetching devices:', error);
    return { success: false, devices: [], message: 'Failed to fetch devices. Please try again later.' };
  }
}
