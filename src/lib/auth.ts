import { NextAuthOptions } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'super_admin';
}

export interface AdminLoginResponse {
  user: AdminUser;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

// Environment-aware API base URL
const getApiBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return 'https://admin.digimall.ng/api/v1';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4800/api/v1';
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
          console.log('Attempting login with:', {
            url: `${API_BASE_URL}/auth/login`,
            email: credentials.email,
            passwordLength: credentials.password.length
          });

          const response = await fetch(`${API_BASE_URL}/auth/login`, {
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

          const result = await response.json();
          
          // Handle the response from admin service
          // Admin service returns: { user, tokens: { accessToken, refreshToken, expiresIn } }
          const { user, tokens } = result;

          return {
            id: user.id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresIn: tokens.expiresIn,
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
      // Call backend logout endpoint
      if (token?.accessToken) {
        try {
          await fetch(`${API_BASE_URL}/auth/logout`, {
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
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken: token.refreshToken,
      }),
    });

    const result = await response.json();
    const refreshedTokens = result.success ? result.data : result;

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.token,
      expiresAt: Date.now() + (refreshedTokens.expiresIn * 1000),
      refreshToken: refreshedTokens.refreshToken ?? token.refreshToken,
    };
  } catch (error) {
    console.error('Error refreshing access token:', error);
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}