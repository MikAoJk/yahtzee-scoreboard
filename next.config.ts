import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactStrictMode: true,
    basePath: process.env.NEXT_PUBLIC_BASE_PATH,
    images: {
        loader: 'akamai',
        path: '/'
    },
    output: 'export'
};

export default nextConfig;
