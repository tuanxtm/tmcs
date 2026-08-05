import { withPayload } from '@payloadcms/next/withPayload'

function getAllowedDevOrigins(): string[] {
  const raw = process.env.ALLOWED_DEV_ORIGINS?.trim()
  if (!raw) return []

  return raw
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((value) => {
      try {
        return new URL(value.includes('://') ? value : `http://${value}`).host
      } catch {
        return value
      }
    })
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  //images: {
  //  localPatterns: [
  //    {
  //      pathname: '/api/media/file/**',
  //    },
  //  ],
  //},
  // React Compiler is built into Next.js 16 — runs in the SWC pipeline before
  // OpenNext bundles the output for Cloudflare Workers, so no runtime support
  // is required in workerd.
  reactCompiler: {
    compilationMode: 'annotation' as const,
  },
  // Packages with Cloudflare Workers (workerd) specific code
  // Read more: https://opennext.js.org/cloudflare/howtos/workerd
  serverExternalPackages: ['jose', 'pg-cloudflare'],
  allowedDevOrigins: (() => {
    const fromEnv = getAllowedDevOrigins()
    return fromEnv.length > 0 ? fromEnv : ['10.199.1.10']
  })(),
  // Your Next.js config here
  webpack: (webpackConfig: any) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
