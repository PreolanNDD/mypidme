/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  transpilePackages: ['@supabase/realtime-js'],
  trailingSlash: true,
  // Enable SWC but with fallback handling
  swcMinify: true,
  experimental: {
    // Disable problematic experimental features in WebContainer
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
  webpack: (config, { isServer, dev }) => {
    config.ignoreWarnings = [
      { module: /@supabase\/realtime-js/ },
      { message: /Critical dependency: the request of a dependency is an expression/ },
      { message: /Failed to load SWC binary/ },
    ];
    
    // WebContainer-specific optimizations
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    
    // Optimize for development in WebContainer
    if (dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
            },
          },
        },
      };
    }
    
    return config;
  },
  // Handle SWC loading gracefully
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

module.exports = nextConfig;