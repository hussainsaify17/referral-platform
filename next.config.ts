import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for static export (GitHub Pages)
  output: "export",
  
  // If your GitHub repository is named "referral-platform" and you host at username.github.io/referral-platform,
  // uncomment the following line and replace with your repository name.
  basePath: "/referral-platform",
  
  images: {
    // Required for GitHub Pages since it doesn't support Next.js Image Optimization server
    unoptimized: true,
  },
  
  typescript: {
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
