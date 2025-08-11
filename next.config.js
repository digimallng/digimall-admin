/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@tanstack/react-query', 'socket.io-client'],
  skipMiddlewareUrlNormalize: true,
  skipTrailingSlashRedirect: true,
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
