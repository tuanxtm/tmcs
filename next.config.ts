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
  // View Transitions API is enabled by default in the App Router on
  // Next.js 16.3+. `<Link transitionTypes>` and `<ViewTransition>` work
  // automatically. Browser support: Chromium 111+, Firefox 144+,
  // Safari 18.2+ - graceful fallback is the default cross-fade.
  //
  // Cache Components replaces the legacy `dynamic`/`revalidate`/`fetchCache`
  // route segment configs. Every page is dynamic by default; static shells are
  // produced only when data reads are wrapped in `"use cache"` and request-time
  // reads (`headers()`, `cookies()`, `await params`, `await searchParams`) are
  // pushed into a `<Suspense>` boundary. See:
  // https://nextjs.org/docs/app/guides/migrating-to-cache-components
  cacheComponents: true,
  // React Compiler is built into Next.js 16 - runs in the SWC pipeline before
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
