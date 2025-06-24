/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  transpilePackages: ['@supabase/realtime-js'],
  trailingSlash: true,
  
  // Performance optimizations
  experimental: {
    // Enable SWC minification for faster builds
    swcMinify: true,
    // Optimize package imports
    optimizePackageImports: [
      '@radix-ui/react-dialog',
      '@radix-ui/react-select',
      '@radix-ui/react-slider',
      '@radix-ui/react-switch',
      'lucide-react',
      'recharts'
    ],
    // Enable turbo mode for faster development
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  
  // Compiler optimizations
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  webpack: (config, { dev, isServer }) => {
    // Ignore warnings that slow down compilation
    config.ignoreWarnings = [
      { module: /@supabase\/realtime-js/ },
      { message: /Critical dependency: the request of a dependency is an expression/ },
    ];
    
    // Optimize for development speed
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ['**/node_modules', '**/.git', '**/.next'],
      };
      
      // Reduce the number of chunks in development
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Bundle all vendor code together
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20,
            },
            // Bundle common code
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
          },
        },
      };
    }
    
    // Optimize module resolution
    config.resolve.alias = {
      ...config.resolve.alias,
      // Reduce bundle size by aliasing to specific builds
      'react': require.resolve('react'),
      'react-dom': require.resolve('react-dom'),
    };
    
    return config;
  },
  
  // Optimize page loading
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
};

module.exports = nextConfig;