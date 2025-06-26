/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  transpilePackages: ['@supabase/realtime-js'],
  trailingSlash: true,
  
  // Enhanced caching configuration
  experimental: {
    // Enable static generation optimizations
    optimizePackageImports: ['@supabase/supabase-js', '@tanstack/react-query'],
  },
  
  // Optimize bundle splitting for better caching
  webpack: (config, { isServer, dev }) => {
    config.ignoreWarnings = [
      { module: /@supabase\/realtime-js/ },
      { message: /Critical dependency: the request of a dependency is an expression/ },
    ];

    // Production optimizations
    if (!dev && !isServer) {
      // Split vendor chunks for better caching
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          // Separate Supabase into its own chunk
          supabase: {
            test: /[\\/]node_modules[\\/]@supabase[\\/]/,
            name: 'supabase',
            chunks: 'all',
            priority: 30,
          },
          // Separate React Query into its own chunk
          reactQuery: {
            test: /[\\/]node_modules[\\/]@tanstack[\\/]react-query[\\/]/,
            name: 'react-query',
            chunks: 'all',
            priority: 25,
          },
          // Separate Recharts into its own chunk
          recharts: {
            test: /[\\/]node_modules[\\/]recharts[\\/]/,
            name: 'recharts',
            chunks: 'all',
            priority: 20,
          },
          // Common vendor chunk for other libraries
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
        },
      };
    }

    return config;
  },

  // Enhanced headers for better caching
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;