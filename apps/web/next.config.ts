import path from 'path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  // In a monorepo, set the tracing root to the repo root so that
  // server.js is emitted at the top of .next/standalone/ (not nested under apps/web/)
  outputFileTracingRoot: path.join(__dirname, '../../'),
  transpilePackages: ['@lcm/shared'],
};

export default nextConfig;
