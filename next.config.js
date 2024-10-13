/**
 * @type {import('next').NextConfig}
 */
module.exports = {
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "stubby.io"],
    },
    mdxRs: true,
    serverComponentsExternalPackages: [],
  },
  images: {
    remotePatterns: [{ hostname: "i.stubby.io" }],
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  reactStrictMode: false,
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
