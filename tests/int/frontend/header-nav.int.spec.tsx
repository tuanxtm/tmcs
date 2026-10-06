// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { NavItemView } from '@/app/(frontend)/_lib/types'

const route = vi.hoisted(() => ({ pathname: '/projects' }))
vi.mock('next/navigation', () => ({ usePathname: () => route.pathname }))
const { HeaderNav } = await import('@/app/(frontend)/_components/layout/header-nav')
const items: NavItemView[] = [
  {
    id: 'work',
    label: 'Work',
    href: '/projects',
    newTab: false,
    external: false,
    children: [{ id: 'posts', label: 'Posts', href: '/posts', newTab: false, external: false }],
  },
  {
    id: 'contact',
    label: 'Contact',
    href: 'https://example.com',
    newTab: true,
    external: true,
    children: [],
  },
]
let desktop = false
let breakpointChange: (() => void) | undefined
beforeEach(() => {
  route.pathname = '/projects'
  desktop = false
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query.includes('min-width: 1024px') && desktop,
    addEventListener: (_: string, callback: () => void) => {
      breakpointChange = callback
    },
    removeEventListener: vi.fn(),
  }))
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('Header navigation disclosure', () => {
  it('opens on desktop hover, dismisses outside, and retains the parent destination', () => {
    desktop = true
    render(<HeaderNav items={items} locale="en" />)
    const parent = screen.getByRole('link', { name: 'Work' })
    expect(parent.getAttribute('href')).toBe('/projects')
    expect(parent.getAttribute('aria-expanded')).toBe('false')
    fireEvent.pointerEnter(parent.closest('li')!, { pointerType: 'mouse' })
    expect(parent.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByRole('link', { name: 'Posts' })).toBeTruthy()
    fireEvent.pointerDown(document.body)
    expect(parent.getAttribute('aria-expanded')).toBe('false')
  })

  it('toggles the submenu from the whole parent link on mobile without navigating', () => {
    render(<HeaderNav items={items} locale="en" />)
    const parent = screen.getByRole('link', { name: 'Work' })
    const click = fireEvent.click(parent)
    expect(click).toBe(false)
    expect(parent.getAttribute('href')).toBe('/projects')
    expect(parent.getAttribute('aria-expanded')).toBe('true')
    fireEvent.click(parent)
    expect(parent.getAttribute('aria-expanded')).toBe('false')
  })

  it('opens from ArrowDown and Space, then Escape restores parent link focus', async () => {
    render(<HeaderNav items={items} locale="en" />)
    const parent = screen.getByRole('link', { name: 'Work' })
    parent.focus()
    fireEvent.keyDown(parent, { key: 'ArrowDown' })
    const child = screen.getByRole('link', { name: 'Posts' })
    await act(async () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())))
    expect(document.activeElement).toBe(child)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(parent.getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(parent)
    fireEvent.keyDown(parent, { key: ' ' })
    expect(parent.getAttribute('aria-expanded')).toBe('true')
  })

  it('preserves external attributes and localized destinations', () => {
    render(<HeaderNav items={items} locale="en" />)
    expect(screen.getAllByRole('link')[0].textContent).toBe('EN/VI')
    const contact = screen.getByRole('link', { name: 'Contact' })
    expect(contact.getAttribute('href')).toBe('https://example.com')
    expect(contact.getAttribute('target')).toBe('_blank')
    expect(contact.getAttribute('rel')).toBe('noopener noreferrer')
    expect(
      screen.getByRole('link', { name: 'Switch language to Vietnamese' }).getAttribute('href'),
    ).toBe('/vi/projects')
  })

  it('dismisses on outside interaction, navigation, and breakpoint changes', () => {
    render(<HeaderNav items={items} locale="en" />)
    const menu = screen.getByRole('button', { name: 'Open menu' })
    fireEvent.click(menu)
    fireEvent.pointerDown(document.body)
    expect(menu.getAttribute('aria-expanded')).toBe('false')
    fireEvent.click(menu)
    fireEvent.click(screen.getByRole('link', { name: 'Contact' }))
    expect(menu.getAttribute('aria-expanded')).toBe('false')
    fireEvent.click(menu)
    act(() => breakpointChange?.())
    expect(menu.getAttribute('aria-expanded')).toBe('false')
  })

  it('resets disclosure across routes and preserves localized switching', () => {
    const view = render(<HeaderNav items={items} locale="en" />)
    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))
    route.pathname = '/vi/posts'
    view.rerender(<HeaderNav items={items} locale="vi" />)
    expect(screen.getByRole('button', { name: 'Mở menu' }).getAttribute('aria-expanded')).toBe(
      'false',
    )
    expect(
      screen.getByRole('link', { name: 'Switch language to English' }).getAttribute('href'),
    ).toBe('/posts')
    route.pathname = '/projects'
    view.rerender(<HeaderNav items={items} locale="en" />)
    expect(screen.getByRole('button', { name: 'Open menu' }).getAttribute('aria-expanded')).toBe(
      'false',
    )
  })
})
