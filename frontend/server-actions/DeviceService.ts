// import { Device, DeviceAndLatestRecordData, DeviceConfigPayload, FetchError } from '@/lib/types';
// import { openDB } from 'idb';
// import { cookies } from 'next/headers';
// import { z } from 'zod';

// const API_URL = 'YOUR_API_URL';
// const DB_NAME = 'devicesDB';
// const STORE_NAME = 'devices';
// const PENDING_STORE = 'pendingChanges';


// const DeviceReadingsSchema = z.object({
//     id: z.string(),
//     alertPriority: z.number(),
//     batteryLevel: z.number(),
//     createdAt: z.string(),
//     device_id: z.string(),
//     isDocked: z.boolean(),
//     lastAlert: z.string(),
//     shutterClosed: z.boolean(),
//     shutterRange: z.string(),
//     signalStrength: z.number(),
//     vibrationIntensity: z.number(),
//   });


// const DeviceSchema = z.object({
//     Device: z.object({
//       ID: z.string(),
//       OrgID: z.string(),
//       CreatedAt: z.string(),
//       UpdatedAt: z.union([z.string(), z.null()]),
//       ShopCloseTime: z.union([z.string(), z.null()]).optional().default(null), // Set default to null
//       ShopOpenTime: z.union([z.string(), z.null()]).optional().default(null),  // Set default to null
//     }),
//     LatestRecord: DeviceReadingsSchema,
//   });
  
//   const DeviceArraySchema = z.array(DeviceSchema);









// async function initDB() {
//   return openDB(DB_NAME, 1, {
//     upgrade(db) {
//       if (!db.objectStoreNames.contains(STORE_NAME)) {
//         db.createObjectStore(STORE_NAME, { keyPath: 'id' });
//       }
//       if (!db.objectStoreNames.contains(PENDING_STORE)) {
//         db.createObjectStore(PENDING_STORE, { keyPath: 'id', autoIncrement: true });
//       }
//     },
//   });
// }

// async function getToken() {
//   return cookies().get('jwt_token')?.value;
// }

// export const DeviceService = {
//   async syncWithServer() {
//     const db = await initDB();
//     const pendingChanges = await db.getAll(PENDING_STORE);

//     for (const change of pendingChanges) {
//       switch (change.action) {
//         case 'create':
//           await this.createDevice(change.payload);
//           break;
//         case 'update':
//           await this.updateDevice(change.payload);
//           break;
//         case 'delete':
//           await this.deleteDevice(change.payload.device_id);
//           break;
//         default:
//           break;
//       }

//       // After successful sync, remove from pendingChanges store
//       await db.delete(PENDING_STORE, change.id);
//     }

//     // After syncing local changes, fetch latest data from server
//     return this.getDevicesByOrganisationId (organisationId: string);
//   },
  
//  async  getDevicesByOrganisationId (organisationId: string): Promise<DeviceAndLatestRecordData[] | FetchError> {
//     const token = cookies().get('jwt_token')?.value;
//     const url = `${API_URL}/device/organization/${organisationId}`;
  
//     try {
//       console.log(`F2 | Fetching devices for organisation ID: ${organisationId}...✅`);
//       console.log(`F2 | Request URL: ${url}`);
  
//       const res = await fetch(url, {
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`, // Use Bearer token format
//         },
//       });
  
//       console.log(`F2 | Response status: ${res.status}`);
//       if (!res.ok) {
//         const errorText = await res.text();
//         console.error('Error response from API:', errorText);
//         return { error: true, message: `Fetch error: ${res.statusText}` }; // Return proper FetchError
//       }
  
//       const responseText = await res.text();
//       console.log(`F2 | Response text: ${responseText}`);
  
//       try {
//         const data = JSON.parse(responseText);
//         console.log('F2 | Parsed data ✅', data);
  
//         if (Array.isArray(data)) {
//           // Validate against the schema
//           const parsedData = DeviceArraySchema.parse(data);
//           await this.saveDevicesToIndexedDBWithOrg(parsedData);

//           return parsedData;
//         } else {
//           console.log('F2 | Unexpected data structure');
//           return { error: true, message: 'Unexpected data structure' };
//         }
//       } catch (parseError) {
//         console.error('Error parsing JSON:', parseError);
//         return { error: true, message: 'Error parsing API response' };
//       }
//     } catch (error) {
//       console.error('Error fetching devices:', error);
//       return {
//         error: true,
//         message: error instanceof Error ? error.message : 'Unknown error',
//       };
//     }
//   },

//   async getAllDevices(): Promise<{ success: boolean; devices: Device[]; message?: string }> {
//     const token = await getToken();
//     const url = `${API_URL}/device/`;

//     try {
//       console.log('Fetching all devices from server...✅');
//       const res = await fetch(url, {
//         method: 'GET',
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (!res.ok) {
//         const errorText = await res.text();
//         console.error('Error response from API:', errorText);
//         return { success: false, devices: [], message: 'Failed to fetch devices from server.' };
//       }

//       const devices: Device[] = await res.json();
//       console.log('Devices fetched from server:', devices);

//       // Save devices to IndexedDB after successful fetch
//       await this.saveDevicesToIndexedDBWithoutOrg(devices);

//       return { success: true, devices };

//     } catch (error) {
//       console.error('Error fetching devices:', error);
//       return { success: false, devices: [], message: 'Failed to fetch devices from server.' };
//     }
//   },

//   async createDevice(payload: DeviceConfigPayload): Promise<{ success: boolean; message: string }> {
//     try {
//       const token = await getToken();
//       const url = `${API_URL}/device/`;
      
//       const res = await fetch(url, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(payload),
//       });

//       if (!res.ok) {
//         throw new Error(await res.text());
//       }

//       // Save the created device to IndexedDB after successful creation
//       await this.addDeviceToIndexedDB(payload);

//       return { success: true, message: 'Device created successfully.' };
//     } catch (error) {
//       console.error('Error creating device on server. Queuing for sync...', error);
//       await this.queueForSync('create', payload);
//       return { success: false, message: 'Device creation queued for server sync.' };
//     }
//   },

//   async updateDevice(payload: DeviceConfigPayload): Promise<{ success: boolean; message: string }> {
//     try {
//       const token = await getToken();
//       const url = `${API_URL}/device/`;

//       const res = await fetch(url, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(payload),
//       });

//       if (!res.ok) {
//         throw new Error(await res.text());
//       }

//       // Update the device in IndexedDB after successful update
//       await this.updateDeviceInIndexedDB(payload);

//       return { success: true, message: 'Device updated successfully.' };
//     } catch (error) {
//       console.error('Error updating device on server. Queuing for sync...', error);
//       await this.queueForSync('update', payload);
//       return { success: false, message: 'Device update queued for server sync.' };
//     }
//   },

//   async deleteDevice(deviceId: string): Promise<{ success: boolean; message: string }> {
//     try {
//       const token = await getToken();
//       const url = `${API_URL}/device/${deviceId}`;

//       const res = await fetch(url, {
//         method: 'DELETE',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (!res.ok) {
//         throw new Error(await res.text());
//       }

//       // Remove the device from IndexedDB after successful deletion
//       await this.deleteDeviceFromIndexedDB(deviceId);

//       return { success: true, message: 'Device deleted successfully.' };
//     } catch (error) {
//       console.error('Error deleting device on server. Queuing for sync...', error);
//       await this.queueForSync('delete', { device_id: deviceId });
//       return { success: false, message: 'Device deletion queued for server sync.' };
//     }
//   },

//   async queueForSync(action: string, payload: any) {
//     const db = await initDB();
//     const tx = db.transaction(PENDING_STORE, 'readwrite');
//     const store = tx.objectStore(PENDING_STORE);
//     await store.add({ action, payload });
//     await tx.done;
//     console.log(`Queued action "${action}" for sync with payload:`, payload);
//   },

//   async saveDevicesToIndexedDBWithoutOrg(devices: Device[]) {
//     const db = await initDB();
//     const tx = db.transaction(STORE_NAME, 'readwrite');
//     const store = tx.objectStore(STORE_NAME);
//     for (const device of devices) {
//       store.put(device);
//     }
//     await tx.done;
//   },
  
//   async saveDevicesToIndexedDBWithOrg(devices:DeviceAndLatestRecordData[])
//   {
//     const db = await initDB();
//     const tx = db.transaction(STORE_NAME,'readwrite');
//     const store = tx.objectStore(STORE_NAME);
//     for (const device of devices) {
//         store.put(device);
//       }
//       await tx.done;
//   },

//   async addDeviceToIndexedDB(device: DeviceConfigPayload) {
//     const db = await initDB();
//     const tx = db.transaction(STORE_NAME, 'readwrite');
//     const store = tx.objectStore(STORE_NAME);
//     await store.add(device);
//     await tx.done;
//   },

//   async updateDeviceInIndexedDB(device: DeviceConfigPayload) {
//     const db = await initDB();
//     const tx = db.transaction(STORE_NAME, 'readwrite');
//     const store = tx.objectStore(STORE_NAME);
//     await store.put(device);
//     await tx.done;
//   },

//   async deleteDeviceFromIndexedDB(deviceId: string) {
//     const db = await initDB();
//     const tx = db.transaction(STORE_NAME, 'readwrite');
//     const store = tx.objectStore(STORE_NAME);
//     await store.delete(deviceId);
//     await tx.done;
//   },
// };
