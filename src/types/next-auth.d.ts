import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT, DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      firstName: string;
      lastName: string;
      accessToken: string;
    } & DefaultSession['user'];
    accessToken: string;
    error?: string;
  }

  interface User extends DefaultUser {
    role: string;
    firstName: string;
    lastName: string;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    accessToken: string;
    refreshToken: string;
    role: string;
    firstName: string;
    lastName: string;
    expiresAt: number;
    error?: string;
  }
}
