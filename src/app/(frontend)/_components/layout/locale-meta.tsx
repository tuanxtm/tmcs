import { readActiveLocale } from '@/app/(frontend)/_lib/locale-server'

/**
 * Server-rendered head fragment that exposes the active locale to the browser.
 *
 * The static shell renders `<html lang="en">`; before paint, this inline script
 * updates `document.documentElement.lang` to the request-time locale. Because
 * the script is parsed and executed synchronously while the parser streams the
 * document, there is no visible flash.
 *
 * The header `<meta name="x-site-locale">` lets client code re-derive the locale
 * via `document.querySelector('meta[name="x-site-locale"]')` without re-reading
 * cookies/headers.
 *
 * Must be wrapped in `<Suspense>` by the parent layout - calling `headers()` is
 * a request-time API and would otherwise block the static shell.
 */
export async function LocaleMeta() {
  const locale = await readActiveLocale()

  return (
    <>
      <meta name="x-site-locale" content={locale} />
      <script
        // Synchronous inline script: runs before paint, updates <html lang>.
        // `locale` is one of two literal strings (`"en"` or `"vi"`).
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.lang=${JSON.stringify(locale)};`,
        }}
      />
    </>
  )
}