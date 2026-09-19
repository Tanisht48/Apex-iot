// api.ts
import { API_URL } from '../constants';
import Cookies from 'js-cookie';

interface Params {
  [key: string]: any;
}

interface ApiResponse {
  data: any;
  headers?: Headers;
}

// Function to create query string from parameters
const createQueryString = (params: Params): string => {
  return Object.entries(params)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    )
    .join('&');
};

// General GET function with optional credentials inclusion
const get = async (
  url: string,
  params: Params = {},
  includeCredentials: boolean = true
): Promise<any> => {
  const queryString = params ? `?${createQueryString(params)}` : '';
  try {
    const response = await fetch(`${url}${queryString}`, {
      method: 'GET',
      credentials: includeCredentials ? 'include' : 'omit',
      headers: {
        Authorization: `${Cookies.get('jwt_token') || ''}`,
      },
    });

    return await response.json();
  } catch (err) {
    console.error('Error in GET request:', err);
    throw err;
  }
};

// General POST function with optional credentials inclusion
const post = async (
  url: string,
  params: Params,
  includeCredentials: boolean = true
): Promise<ApiResponse> => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${Cookies.get('jwt_token') || ''}`,
      },
      body: JSON.stringify(params),
      credentials: includeCredentials ? 'include' : 'omit',
    });

    const data = await response.json();
    return { data, headers: response.headers };
  } catch (err) {
    console.error('Error in POST request:', err);
    throw err;
  }
};

// General PUT function with optional credentials inclusion
const put = async (
  url: string,
  params: Params,
  includeCredentials: boolean = true
): Promise<ApiResponse> => {
  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${Cookies.get('jwt_token') || ''}`,
      },
      body: JSON.stringify(params),
      credentials: includeCredentials ? 'include' : 'omit',
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return { data, headers: response.headers };
  } catch (err) {
    console.error('Error in PUT request:', err);
    throw err;
  }
};

// General Delete function with id
const deleteRequest = async (
  url: string,
  params: Params = {},
  includeCredentials: boolean = true
): Promise<ApiResponse> => {
  const queryString = params ? `?${createQueryString(params)}` : '';

  try {
    const response = await fetch(`${url}${queryString}`, {
      method: 'DELETE',
      credentials: includeCredentials ? 'include' : 'omit',
      headers: {
        Authorization: `${Cookies.get('jwt_token') || ''}`,
      },
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return { data, headers: response.headers };
  } catch (err) {
    console.error('Error in Delete request:', err);
    throw err;
  }
};

// Specific function for sending OTP without including credentials
const sendOTP = async (phonenumber: string): Promise<string | false> => {
  try {
    const response = await get(
      `${API_URL}/user/otp`,
      { phone: phonenumber },
      false
    );
    if (response && response['verification token']) {
      return response['verification token'];
    } else {
      throw new Error('Invalid response object');
    }
  } catch {
    return false;
  }
};

// Specific function for verifying OTP without including credentials
const verifyOTP = async (
  verificationID: string,
  otp: string,
  phonenumber: string
): Promise<{ token: string; data: any }> => {
  try {
    const { data, headers } = await post(
      `${API_URL}/user/otp/verify`,
      {
        verification_code: verificationID,
        otp: otp,
        phone: phonenumber,
      },
      false
    );

    const token = headers?.get('Authorization');
    if (!token) {
      throw new Error('No token received');
    }

    Cookies.set('jwt_token', token.trim());

    return { token: token.trim(), data };
  } catch (error) {
    console.error('Error in verifyOTP:', error);
    throw error;
  }
};

// Create a new user
const createUser = async (data: {
  name: string;
  phone: string;
  email: string;
  org_id: string;
  acess_role: string;
}): Promise<ApiResponse> => {
  return post(`${API_URL}/user/`, data);
};

// Retrieve all organizations
const getAllOrganisations = async (): Promise<any> => {
  return get(`${API_URL}/organization/`);
};

// Create a new organization
const createOrganisation = async (data: {
  name: string;
  type: string;
}): Promise<ApiResponse> => {
  return post(`${API_URL}/organization/`, data);
};

// Fetch an organization by ID
const getOrganizationById = async (id: string): Promise<ApiResponse> => {
  return get(`${API_URL}/organization/${id}`);
};

// Update an organization
const updateOrganization = async (
  id: string,
  data: { name: string; type: string }
): Promise<ApiResponse> => {
  const url = `${API_URL}/organization/${id}`;
  try {
    const response = await put(url, data);
    return response;
  } catch (error) {
    console.error('Error updating organization:', error);
    throw error;
  }
};

// Delete an organisation

const deleteOrganisation = async (id: string): Promise<any> => {
  return deleteRequest(`${API_URL}/organization/${id}`);
};

// Fetch users by organization ID
const getUsersByOrganisationId = async (
  orgId: string
): Promise<ApiResponse> => {
  try {
    const response = await get(`${API_URL}/user?orgId=${orgId}`);
    return response;
  } catch (error) {
    console.error('Error fetching users by organization ID:', error);
    throw error;
  }
};

const api = {
  get,
  post,
  deleteRequest,
  sendOTP,
  verifyOTP,
  getAllOrganisations,
  createOrganisation,
  createUser,
  deleteOrganisation,
  updateOrganization,
  getOrganizationById,
  getUsersByOrganisationId,
};

export default api;
