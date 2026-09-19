// utils/auth.ts
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  exp: number;
  [key: string]: any; // This allows for any additional properties in the token
}

export function isTokenValid(): boolean {
  const token = Cookies.get('jwt_token');
  if (!token) {
    return false;
  }

  try {
    const decoded: DecodedToken = jwtDecode<DecodedToken>(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch (error) {
    console.error('Invalid token:', error);
    return false;
  }
}


export function signOut() {
    Cookies.remove('jwt_token');
  }

