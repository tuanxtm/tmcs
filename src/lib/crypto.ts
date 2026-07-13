/**
 * Privacy helpers for contact abuse metadata.
 * Hash network identifiers instead of storing raw IPs.
 */

import { createHash, timingSafeEqual } from 'crypto'

export const hashWithSecret = (value: string, secret: string): string =>
  createHash('sha256').update(`${secret}:${value}`).digest('hex')

export const constantTimeEqual = (a: string, b: string): boolean => {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  if (left.length !== right.length) return false
  return timingSafeEqual(left, right)
}
