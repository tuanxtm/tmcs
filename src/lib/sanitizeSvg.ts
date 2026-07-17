/** Strip obviously dangerous bits from CMS SVG before inline render. */
export function sanitizeSvgMarkup(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed || !/<svg[\s>]/i.test(trimmed)) return null

  const cleaned = trimmed
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, '')
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(href|xlink:href)\s*=\s*("|')\s*javascript:[^"']*\2/gi, '')
    .replace(/javascript:/gi, '')

  if (!/<svg[\s>]/i.test(cleaned)) return null
  return cleaned
}
