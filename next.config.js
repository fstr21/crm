/** @type {import("next").NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  webpack: (config, { isServer }) => {
    // Server-side: Handle node: protocol imports for Node.js 22.x
    if (isServer) {
      config.externals = config.externals || []
      config.externals.push({
        'node:crypto': 'crypto',
        'node:stream': 'stream',
        'node:buffer': 'buffer',
        'node:util': 'util',
        'node:fs': 'fs',
        'node:path': 'path',
        'node:events': 'events',
        'node:net': 'net',
        'node:tls': 'tls',
        'node:timers': 'timers',
        'node:timers/promises': 'timers/promises',
        'node:dns': 'dns',
        'node:url': 'url',
        'node:os': 'os',
        'node:querystring': 'querystring',
        'node:zlib': 'zlib',
      })
    } else {
      // Client-side: Provide fallbacks for Node.js modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer'),
        events: require.resolve('events'),
        util: require.resolve('util'),
        path: require.resolve('path-browserify'),
        url: require.resolve('url'),
        os: false,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        querystring: require.resolve('querystring-es3'),
        zlib: false,
        timers: false,
        'timers/promises': false,
        // Redis should not be used on client side
        redis: false,
      }
    }

    return config
  },
}

module.exports = nextConfig
