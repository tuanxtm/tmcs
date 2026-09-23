import { readActiveLocale } from '@/app/(frontend)/_lib/locale-server'

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
