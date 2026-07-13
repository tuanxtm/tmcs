/**
 * URL validation helpers for absolute URLs and same-origin checks.
 */

export const isAbsoluteHttpUrl = (value: string): boolean => {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export const validateAbsoluteHttpUrl = (value: unknown): true | string => {
  if (value == null || value === '') return true
  if (typeof value !== 'string' || !isAbsoluteHttpUrl(value)) {
    return 'Must be an absolute http(s) URL'
  }
  return true
}
