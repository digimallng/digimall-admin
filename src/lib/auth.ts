import { NextAuthOptions } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'super_admin' | 'admin' | 'staff';
}

export interface AdminLoginResponse {
  user: AdminUser;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Environment-aware API base URL - now pointing to unified backend
const getApiBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    // In production, always use the backend API, not the admin frontend
    return 'https://api.digimall.ng/api/v1';
  }
  return process.env.NEXT_PUBLIC_BACKEND_URL
    ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1`
    : 'http://localhost:3000/api/v1';
};

const API_BASE_URL = getApiBaseUrl();

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'admin-credentials',
      name: 'Admin Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        try {
          console.log('Attempting staff login with:', {
            url: `${API_BASE_URL}/staff/auth/login`,
            email: credentials.email,
            passwordLength: credentials.password.length
          });

          const response = await fetch(`${API_BASE_URL}/staff/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          console.log('Login response status:', response.status);

          if (!response.ok) {
            const error = await response.text();
            console.log('Login error response:', error);
            throw new Error(error || 'Authentication failed');
          }

          // Check response content type
          const contentType = response.headers.get('content-type');
          console.log('Response content type:', contentType);
          
          let result;
          if (contentType && contentType.includes('application/json')) {
            result = await response.json();
            console.log('Full login result:', JSON.stringify(result, null, 2));
          } else {
            const text = await response.text();
            console.log('Non-JSON response:', text.substring(0, 200) + '...');
            throw new Error('Server returned non-JSON response');
          }
          
          // Handle the response from unified backend
          // Staff login endpoint returns: { accessToken, refreshToken, staff } or { accessToken, refreshToken, user }
          const { user, staff, accessToken, refreshToken } = result;

          // Support both "user" and "staff" field names
          const userData = user || staff;

          if (!userData || !accessToken || !refreshToken) {
            console.error('Missing user/staff or tokens in response:', {
              user: !!user,
              staff: !!staff,
              accessToken: !!accessToken,
              refreshToken: !!refreshToken
            });
            throw new Error('Invalid response structure from server');
          }

          // JWT tokens typically have 24 hours expiry (86400 seconds)
          const expiresIn = 86400;

          return {
            id: userData.id,
            email: userData.email,
            name: `${userData.firstName} ${userData.lastName}`,
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: userData.role,
            accessToken,
            refreshToken,
            expiresIn,
          };
        } catch (error) {
          console.error('Authentication error:', error);
          throw new Error('Invalid credentials');
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  jwt: {
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  callbacks: {
    async jwt({ token, user }): Promise<JWT> {
      // Initial sign in
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.role = user.role;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.userType = user.userType || 'admin'; // Default to admin for backward compatibility
        token.expiresAt = Date.now() + (user.expiresIn * 1000);
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < (token.expiresAt as number)) {
        return token;
      }

      // Access token has expired, try to update it
      return await refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.email = token.email!;
        session.user.name = token.name!;
        session.user.role = token.role as string;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.userType = token.userType as string;
        session.accessToken = token.accessToken as string;
        session.error = token.error as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  events: {
    async signOut({ token }) {
      // Call backend staff logout endpoint
      if (token?.accessToken) {
        try {
          await fetch(`${API_BASE_URL}/staff/auth/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token.accessToken}`,
              'Content-Type': 'application/json',
            },
          });
        } catch (error) {
          console.error('Logout error:', error);
        }
      }
    },
  },
};

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const response = await fetch(`${API_BASE_URL}/staff/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken: token.refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const result = await response.json();

    // Backend returns { accessToken, refreshToken }
    const { accessToken, refreshToken } = result;

    return {
      ...token,
      accessToken,
      expiresAt: Date.now() + (86400 * 1000), // 24 hours
      refreshToken: refreshToken ?? token.refreshToken,
    };
  } catch (error) {
    console.error('Error refreshing access token:', error);
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}