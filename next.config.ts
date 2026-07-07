import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pins the workspace root to this project so Turbopack doesn't get confused
  // by the unrelated lockfile in the Windows user profile folder above it.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
