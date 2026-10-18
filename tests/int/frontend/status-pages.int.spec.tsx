import React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { ErrorPage } from '@/app/(frontend)/_components/pages/error-page'
import { NotFoundPage } from '@/app/(frontend)/_components/pages/not-found-page'

afterEach(cleanup)

describe.each(['en', 'vi'] as const)('status pages in %s', (locale) => {
  const home = locale === 'vi' ? '/vi' : '/'

  it('preserves the retry action and localized home link', () => {
    const reset = vi.fn()
    render(<ErrorPage locale={locale} reset={reset} />)

    fireEvent.click(screen.getByRole('button', { name: locale === 'vi' ? /Thử lại/ : /try again/ }))
    expect(reset).toHaveBeenCalledOnce()
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('500.')
    expect(screen.getByRole('link').getAttribute('href')).toBe(home)
  })

  it('preserves the not-found heading and home navigation', () => {
    render(<NotFoundPage locale={locale} />)

    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('404.')
    expect(screen.getByRole('link').getAttribute('href')).toBe(home)
  })
})
