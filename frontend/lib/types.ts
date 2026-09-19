export enum OrgType {
  Kirana = 'Kirana',
  Enterprise = 'Enterprise',
}
export type Organisation = {
  ID: string;
  OrganisationID: string;
  OrgName: string;
  Type: OrgType;
  UserCount: number;
  DeviceCount: number;
};

export type OrganisationById = {
  ID: string;
  OrganisationID: string;
  OrgName: string;
  Type: OrgType;
  CreatedAt: string;
  UpdatedAt?: string | null; // Allow both undefined and null
};

export type FetchError = {
  error: boolean;
  message: string;
};

export type User = {
  ID: string;
  Name: string;
  Email?: string | null; // Allow both undefined and null
  Phone?: string | null; // Ensure this matches the optional and nullable definition if needed
  OrganisationID?: string | null; // Allow both undefined and null
  AccessRole: string;
  CreatedAt: string;
  UpdatedAt?: string | null; // Allow both undefined and null
};
// Standards
// 1. Auditing data per request - log/store
// 2. Req, req schema/validation
// 3. Internal data model standard (casing)
// 4. Error/Global exceptional handling

export type DeviceReadings = {
  id: string;
  device_id: string;
  alertPriority: number;
  batteryLevel: number;
  createdAt:string | number;
  isDocked: boolean;
  lastAlert: string;
  shutterClosed: boolean;
  shutterRange: string;
  signalStrength: number;
  vibrationIntensity: number;
};

export type Device = {
  ID: string;
  OrgID: string;
  CreatedAt: string;
  UpdatedAt?: string | null; // Allow both undefined and null
  ShopCloseTime?: string | null;
  ShopOpenTime?: string | null;
};

export type DeviceAndLatestRecordData = {
  Device : Device;
  LatestRecord: {
    id: string;
    device_id: string;
    alertPriority: number;
    batteryLevel: number;
    createdAt: string; 
    isDocked: boolean;
    lastAlert: string;
    shutterClosed: boolean;
    shutterRange: string; 
    signalStrength: number;
    vibrationIntensity: number;
  };
};


export type GetDeviceReadingsParams = {
  deviceID: string;
  createdAtStart?: string;
  createdAtEnd?: string;
  limit?: number;
};


export type DeviceConfigPayload = {
  device_id: string;
  org_id: string;
  shop_open_time: string;
  shop_close_time: string;
}

export type AccessRole = {
  ID: string;
  Org?: string | null;         // Optional property, can be string or null
  Name: string;
  Groups?: string[] | null;     // Optional property, can be string[] or null
  UserActions: string[];
  DeviceActions: string[];
  CreatedAt: string;
  UpdatedAt?: string | null;    // Optional property, can be string or null
};

export type AccessRolesResponse = {
  data: AccessRole[];           // Array of AccessRole objects
  message: string;              // Message string
};
