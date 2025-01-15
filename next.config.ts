import type {NextConfig} from "next";

const nextConfig: NextConfig = {
    output: "export",
    env: {
        NEXT_PUBLIC_ADMIN_USERNAME: process.env.ADMIN_USERNAME,
        NEXT_PUBLIC_ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    },
};

export default nextConfig;