/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  transpilePackages: ['@supabase/realtime-js'],
  trailingSlash: true,
  
  webpack: (config, { isServer }) => {
    config.ignoreWarnings = [
      { module: /@supabase\/realtime-js/ },
      { message: /Critical dependency: the request of a dependency is an expression/ },
    ];
    
    // Fix React JSX runtime resolution
    config.resolve.alias = {
      ...config.resolve.alias,
      'react': require.resolve('react'),
      'react-dom': require.resolve('react-dom'),
      'react/jsx-runtime': require.resolve('react/jsx-runtime'),
      'react/jsx-dev-runtime': require.resolve('react/jsx-dev-runtime'),
    };
    
    return config;
  },
};

module.exports = nextConfig;