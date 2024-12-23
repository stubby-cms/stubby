import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    reactCompiler: {
      compilationMode: "annotation",
    },
    serverActions: {
      allowedOrigins: ["localhost:3000", "stubby.io"],
    },
  },
  serverExternalPackages: [],
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
        source: "/api/v1/sites/:siteId/folders",
        destination: "/api/v1/sites/:siteId/collections",
      },
    ];
  },
  webpack: function (config: any, { isServer }: any) {
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

    config.module.rules.push({
      test: /\.mdx$/i,
      loader: "raw-loader",
    });

    return config;
  },

  sassOptions: {
    silenceDeprecations: ["legacy-js-api"],
  },
};

export default nextConfig;
