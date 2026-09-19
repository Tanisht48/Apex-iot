'use server';
import { z } from 'zod';
import { API_URL } from '../lib/constants';
import { cookies } from 'next/headers';
import { User, FetchError, AccessRolesResponse } from '@/lib/types';


const AccessRoleSchema = z.object({
  ID: z.string(),
  Org: z.string().optional().nullable(), // Optional and nullable string
  Name: z.string(),
  Groups: z.array(z.string()).optional().nullable(), // Optional and nullable array of strings
  UserActions: z.array(z.string()), // Array of strings
  DeviceActions: z.array(z.string()), // Array of strings
  CreatedAt: z.string(), // ISO timestamp
  UpdatedAt: z.string().optional().nullable(), // Optional and nullable ISO timestamp
});

const AccessRolesResponseSchema = z.object({
  data: z.array(AccessRoleSchema), // Array of AccessRoleSchema
  message: z.string(), // Message string
})




const UserSchema = z.object({
  ID: z.string(),
  Name: z.string(),
  Email: z.string().optional().nullable(), // Matches TypeScript: string | undefined | null
  Phone: z.string().optional().nullable(), // Ensure this is correct as per your data model
  OrganisationID: z.string().optional().nullable(), // Matches TypeScript: string | undefined | null
  AccessRole: z.string(),
  CreatedAt: z.string(),
  UpdatedAt: z.string().optional().nullable(), // Matches TypeScript: string | undefined | null
});

const CreateUserResponseSchema = z.object({
  data: z.object({
    ID: z.string(),
    Name: z.string(),
    Email: z.string().optional().nullable(), // Matches TypeScript: string | undefined | null
    Phone: z.string().optional().nullable(), // Ensure this is correct as per your data model
    OrganisationID: z.string().optional().nullable(), // Matches TypeScript: string | undefined | null
    AccessRole: z.string(),
    CreatedAt: z.string(),
    UpdatedAt: z.string().optional().nullable(), // Matches TypeScript: string | undefined | null
  }),
  message: z.string(),
});

export async function createUser(userData: {
  Name: string;
  Email?: string | null;
  Phone?: string | null;
  OrgID?: string;
  AccessRole: string;
}) {
  const token = cookies().get('jwt_token')?.value;
  try {
    console.log('Creating user...', userData);
    const response = await fetch(`${API_URL}/user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${token}`,
      },
      body: JSON.stringify({
        name: userData.Name,
        email: userData.Email,
        phone: userData.Phone,
        org_id: userData.OrgID,
        access_role: userData.AccessRole,
      }),
    });

    const res = await response.json();
    console.log('Received data from create user:', res);

    if (response.ok) {
      const data = CreateUserResponseSchema.parse(res);
      return data;
    } else {
      return {
        success: false,
        message: res.error?.message || 'Unknown error',
      };
    }
  } catch (error: any) {
    console.error('Error processing request:', error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors,
      };
    }
    return {
      success: false,
      message: 'Internal Server Error',
    };
  }
}

export async function getUser(): Promise<User[] | Error> {
  const value = cookies().get('jwt_token')?.value;

  try {
    console.log('F1 | Fetching users...✅');
    const res = await fetch(`${API_URL}/user`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${value}`,
      },
    });

    const data = await res.json();
    console.log('F1 | Received data ✅', data);

    try {
      // Since we are getting an array of users, we use array(UserSchema)
      const parsedData = z.array(UserSchema).parse(data);
      console.log('F1 | Parsed data ✅', parsedData);

      if (res.ok) {
        return parsedData;
      } else {
        console.error('Error response from API:', data);
        throw new Error(data.error?.message || 'Failed to fetch users');
      }
    } catch (validationError) {
      console.error('Validation error:', validationError);
      throw validationError;
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    if (error instanceof Error) {
      return new Error('Error fetching users: ' + error.message);
    } else {
      return new Error('Error fetching users: Unknown error');
    }
  }
}

export async function getUsersByOrganisationId(
  orgId: string
): Promise<User[] | FetchError> {
  const value = cookies().get('jwt_token')?.value;

  try {
    console.log(
      `F2.Users.ID | Fetching users for organisation ID ${orgId}...✅`
    );
    const res = await fetch(`${API_URL}/user/organization/${orgId}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${value}`,
      },
    });

    const data = await res.json();
    console.log('F.Users.ID | Received data ✅', data);

    try {
      // since we only getting back a single user, we need to wrap it in an array
      const parsedData = z.array(UserSchema).parse(data);
      console.log('F.Users.ID | Parsed data ✅', parsedData);

      if (res.ok) {
        return parsedData;
      } else {
        console.error('Error response from API:', data);
        throw new Error(
          data.error?.message ||
            `Failed to fetch users for organisation ID ${orgId}`
        );
      }
    } catch (validationError) {
      console.error('Validation error:', validationError);
      throw validationError;
    }
  } catch (error) {
    console.error('Error in getOrganizationById:', error);
    return {
      error: true,
      message: 'Unknown error',
    };
  }
}


export async function deleteUser(userId: string) {
  const value = cookies().get('jwt_token')?.value;
  try {
    console.log(`F3.Users.ID | Deleting user ID ${userId}...✅`);
    const res = await fetch(`${API_URL}/user/${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${value}`,
      },
    });
    const data = await res.json();
    console.log('F3.Users.ID | Received data ✅', data);
    if (res.ok) {
      return data;
    } else {
      console.error('Error response from API:', data);
      throw new Error(data.error?.message || `Failed to delete user ID ${userId}`);
    }
  } catch (error) {
    console.error('Error in deleteUser:', error);
    return {
      error: true,
      message: 'Unknown error',
    };
  }
}

// Assuming UserSchema is defined elsewhere in your project
const UserUpdateSchema = z.object({
  ID: z.string(),
  Name: z.string().optional(),
  Email: z.string().optional(),
  Phone: z.string().optional(),
  AccessRole: z.string().optional(),
});

export async function updateUser(userData: z.infer<typeof UserUpdateSchema>): Promise<User | FetchError> {
  const token = cookies().get('jwt_token')?.value;

  try {
    console.log(`Updating user ID ${userData.ID}...`);
    const response = await fetch(`${API_URL}/user/${userData.ID}`, {
      method: 'PUT', // or 'PUT' depending on your API
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${token}`,
      },
      body: JSON.stringify({
        name: userData.Name,
        email: userData.Email,
        Phone: userData.Phone,
        access_role: userData.AccessRole,
      }),
    });

    const data = await response.json();
    console.log('Received data from update user:', data);

    if (response.ok) {
      // Assuming UserSchema is defined to validate the user object
      const parsedData = CreateUserResponseSchema.parse(data);
      console.log('Parsed data:', parsedData);
      return parsedData.data;
    } else {
      console.error('Error response from API:', data);
      return {
        error: true,
        message: data.error?.message || `Failed to update user ID`,
      };
    }
  } catch (error) {
    console.error('Error in updateUser:', error);
    return {
      error: true,
      message: 'Unknown error',
    };
  }
}
type Role ={
  ID: string,
  Name: string
}

export async function getAllRoles(): Promise<Role[]> {
  const value = cookies().get('jwt_token')?.value;

  try {
    console.log('F1 | Fetching roles...✅');
    const res = await fetch(`${API_URL}/role`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${value}`,
      },
    });

    if (!res.ok) {
      // If the response is not OK, throw an error here
      throw new Error('Failed to fetch roles');
    }

    const data = await res.json();
    console.log('F1 | Received Roles ✅', data);

    // Validate the data using your schema
    const parsedData = AccessRolesResponseSchema.parse(data);
    console.log('F1 | Parsed Roles ✅', parsedData);

    // Map the data to roles with ID and Name
    const roles = parsedData.data
    .filter((role: { ID: string; Name: string }) => role.Name.toLowerCase() !== 'god') // Filter out roles with Name 'god'
    .map((role: { ID: string; Name: string }) => ({
    ID: role.ID,
    Name: role.Name.charAt(0).toUpperCase() + role.Name.slice(1).toLowerCase(), // Capitalize the first letter
    }));
    console.log('F1 | Parsed Roles and Edited ✅', parsedData);
    return roles;

  } catch (error) {
    console.error('Error fetching roles:', error);
    // Always throw an error here so that it can be caught in `useQuery`
    throw new Error('Error fetching roles: ' + (error as Error).message);
  }
}

