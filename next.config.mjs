/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  async rewrites() {
    const isVercel = Boolean(process.env.VERCEL || process.env.VERCEL_ENV);
    const isProd = Boolean(process.env.NODE_ENV === 'production' || isVercel);
    let backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    // In production or on Vercel, localhost/private IPs cannot be resolved and cause DNS_HOSTNAME_RESOLVED_PRIVATE
    if (!backendUrl || (isProd && (backendUrl.includes('localhost') || backendUrl.includes('127.0.0.1')))) {
      backendUrl = 'https://teamstowaveb.vercel.app';
    }

    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;

