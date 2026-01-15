import type { NextConfig } from "next";
import { PrismaPlugin } from "@prisma/nextjs-monorepo-workaround-plugin";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
    devIndicators: false,
    experimental: {
        authInterrupts: true,
    },
    webpack: (config, { isServer }) => {
        if (isServer) {
            config.plugins = [...config.plugins, new PrismaPlugin()];
            // Externalize rate-limiter-flexible to prevent webpack from bundling it
            config.externals = config.externals || [];
            config.externals.push('rate-limiter-flexible');
        }
        return config;
    },
};

export default nextConfig;