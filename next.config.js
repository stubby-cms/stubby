/**
 * @type {import('next').NextConfig}
 */
module.exports = {
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3018", "stubby.io"],
    },
    mdxRs: true,
    serverComponentsExternalPackages: [],
  },
  images: {
    remotePatterns: [
      { hostname: "avatars.githubusercontent.com" },
      { hostname: "i.stubby.io" },
    ],
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  reactStrictMode: false,
  rewrites: async () => {
    return [
      {
        source: "/home/privacy-policy",
        destination: "/home/privacy",
      },
      {
        source: "/home/terms-of-service",
        destination: "/home/tos",
      },
      {
        source: "/home/docs",
        destination: "/home/docs/quick-start",
      },
    ];
  },
  webpack: function (config, { isServer }) {
    config.experiments = {
      layers: true,
      asyncWebAssembly: true,
      syncWebAssembly: true,
    };

    if (!isServer) {
      config.output.environment = {
        ...config.output.environment,
        asyncFunction: true,
      };
    }

    return config;
  },
};
