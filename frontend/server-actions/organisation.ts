'use server';
import { z } from 'zod';
import { API_URL } from '../lib/constants';
import { cookies } from 'next/headers';
import { FetchError, OrgType, Organisation, OrganisationById } from '@/lib/types';

const OrganisationSchema = z.object({
  ID: z.string(),
  OrganisationID: z.string(),
  OrgName: z.string(),
  Type: z.nativeEnum(OrgType),
  UserCount: z.number(),
  DeviceCount: z.number(),
});

const OrganisationsResponseSchema = z.array(OrganisationSchema);

export async function getOrg(): Promise<Organisation[] | FetchError> {
  // Get cookie
  const value = cookies().get('jwt_token')?.value;

  try {
    console.log('F1 | Fetching organisations...✅');
    const res = await fetch(`${API_URL}/organization`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${value}`,
      },
      credentials: 'include'
    });

    if (!res.ok) {
      console.error('Error response from API:', await res.text());
      return [];
    }

    const data = await res.json();
    console.log('F1 | Received data ✅', data);

    // Filter out invalid entries
    const validData = data.filter(
      (org: any) =>
        org.Type && (org.Type === 'Kirana' || org.Type === 'Enterprise')
    );
    const invalidData = data.filter(
      (org: any) =>
        !org.Type || (org.Type !== 'Kirana' && org.Type !== 'Enterprise')
    );

    if (invalidData.length > 0) {
      console.warn('🚨 Invalid entries found and excluded ❌:', invalidData);
    }

    try {
      const parsedData = OrganisationsResponseSchema.parse(validData);
      console.log('F1 | Parsed data ✅', parsedData);

      if (res.ok) {
        return parsedData;
      } else {
        console.error('Error response from API:', data);
        throw new Error(data.error.message);
      }
    } catch (validationError) {
      console.error('Validation error:', validationError);
      throw validationError;
    }
  } catch (error) {
    console.error('Error fetching organisations:', error);

    if (error instanceof Error) {
      return {
        error: true,
        message: error.message,
      };
    } else {
      return {
        error: true,
        message: 'Error fetching organisations: Unkown error',
      };
    }
  }
}

/// 📍 CREATE ORGANISATIONS | see @/components/organisations/SideSheetWorker.tsx for issues

const CreateOrganisationSchema = z.object({
  OrgName: z.string(),
  OrgType: z.nativeEnum(OrgType),
});

const CreateOrganisationResponseSchema = z.object({
  data: z.object({
    ID: z.string(),
    OrganisationID: z.string(),
    OrgName: z.string(),
    Type: z.nativeEnum(OrgType),
    CreatedAt: z.string(),
    UpdatedAt: z.string(),
  }),
  message: z.string(),
});

// Moved createOrganisation function
export async function createOrganisation(values: {
  OrgName: string;
  OrgType: OrgType;
}) {
  try {
    const value = cookies().get('jwt_token')?.value;
    console.log('🏁 Parsed body for API calls successfully', values);

    const res = await fetch(`${API_URL}/organization/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
         Authorization: `${value}`,
      },
      body: JSON.stringify({ name: values.OrgName, type: values.OrgType }),
      credentials: 'include'
    });

    const responseBody = await res.json();
    console.log('🏁  Received??', responseBody);

    if (res.ok) {
      const data = CreateOrganisationResponseSchema.parse(responseBody);
      return data;
    } else {
      return {
        success: false,
        message: responseBody.error?.message || 'Unknown error',
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

// UPDATE ORGANISATIONS
export async function updateOrganisation(values: {
  ID: string;
  OrgName: string;
  OrgType: OrgType;
}) {
  const value = cookies().get('jwt_token')?.value;
  console.log('🚨 Starting update for organisation', values);

  try {
    const res = await fetch(`${API_URL}/organization/${values.ID}`, {
      // Include the ID in the URL
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${value}`,
      },
      body: JSON.stringify({
        name: values.OrgName,
        type: values.OrgType,
      }),
      credentials: 'include'
    });

    const responseBody = await res.json();
    console.log('🚨 Update response:', responseBody);

    if (res.ok) {
      return {
        success: true,
        data: responseBody,
      };
    } else {
      return {
        success: false,
        message: responseBody.error?.message || 'Unknown error during update',
      };
    }
  } catch (error) {
    console.error('Error updating organisation:', error);
    return {
      success: false,
      message: 'Internal Server Error',
    };
  }
}

// DELETE ORGANISATIONS
export async function deleteOrganisation(values: { ID: string }) {
  const value = cookies().get('jwt_token')?.value;
  console.log('🚨 Starting deletion for organisation', values);

  try {
    const res = await fetch(`${API_URL}/organization/${values.ID}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${value}`,
      },
      credentials: 'include'
    });

    const responseBody = await res.json();
    console.log('🚨 Delete response:', responseBody);

    if (res.ok) {
      return {
        success: true,
        message: 'Organisation deleted successfully',
      };
    } else {
      return {
        success: false,
        message: responseBody.error?.message || 'Unknown error during deletion',
      };
    }
  } catch (error) {
    console.error('Error deleting organisation:', error);
    return {
      success: false,
      message: 'Internal Server Error',
    };
  }
}


const OrganisationByIdSchema = z.object({
  ID: z.string(),
  OrganisationID: z.string(),
  OrgName: z.string(),
  Type: z.nativeEnum(OrgType),
  CreatedAt: z.string(),
  UpdatedAt: z.string(),
});


export async function getOrganizationById(orgId: string): Promise<OrganisationById | FetchError> {
  const token = cookies().get('jwt_token')?.value;

  try {
    const response = await fetch(`${API_URL}/organization/${orgId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${token}`,
      },
      credentials: 'include'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error fetching organization by ID:', errorText);
      return { error: true, message: errorText };
    }

    const data = await response.json();
    console.log('Fetched organization data by ID:', data);

    // Validate the data with Zod schema
    const parsedData = OrganisationByIdSchema.safeParse(data);
    
    if (!parsedData.success) {
      console.error('Validation error:', parsedData.error.flatten());
      return { error: true, message: 'Data validation error' };
    }
    return parsedData.data; // Return the validated data
  } catch (error) {
    console.error('Error in getOrganizationById:', error);
    return {
      error: true,
      message: 'Unknown error',
    };
  }
}
