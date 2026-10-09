// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'

const runtime = vi.hoisted(() => ({
  locale: 'en' as 'en' | 'vi',
  bootReady: false,
  reducedMotion: false,
  lenis: null as unknown,
  lenisScrollTo: vi.fn(),
}))

vi.mock('@/app/(frontend)/_components/providers/locale', () => ({
  useLocale: () => runtime.locale,
}))
vi.mock('@/app/(frontend)/_components/providers/boot-reveal', () => ({
  useBootReady: () => runtime.bootReady,
}))
vi.mock('lenis/react', () => ({
  useLenis: () => runtime.lenis,
}))
vi.mock('motion/react', () => ({
  useReducedMotion: () => runtime.reducedMotion,
}))

const { BackToTop } = await import('@/app/(frontend)/_components/layout/back-to-top')
let footerTestRoot: HTMLDivElement | null = null

function setScrollY(value: number) {
  Object.defineProperty(window, 'scrollY', { configurable: true, value })
}

function dispatchScroll() {
  act(() => window.dispatchEvent(new Event('scroll')))
}

function mockFooterBounds(top: number, bottom: number) {
  footerTestRoot = document.createElement('div')
  footerTestRoot.className = 'page-blocks'
  const footer = document.createElement('footer')
  footerTestRoot.appendChild(footer)
  document.body.appendChild(footerTestRoot)

  const getBounds = vi.spyOn(footer, 'getBoundingClientRect')
  const setBounds = (nextTop: number, nextBottom: number) => {
    getBounds.mockReturnValue(new DOMRect(0, nextTop, window.innerWidth, nextBottom - nextTop))
  }
  setBounds(top, bottom)
  return setBounds
}

describe('BackToTop', () => {
  beforeEach(() => {
    runtime.locale = 'en'
    runtime.bootReady = false
    runtime.reducedMotion = false
    runtime.lenis = null
    runtime.lenisScrollTo.mockReset()
    setScrollY(0)
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 })
  })

  afterEach(() => {
    cleanup()
    footerTestRoot?.remove()
    footerTestRoot = null
    vi.restoreAllMocks()
  })

  it('stays absent before boot and at the top, then follows scroll changes', () => {
    const view = render(<BackToTop />)
    expect(screen.queryByRole('button', { name: 'BACK TO TOP' })).toBeNull()

    runtime.bootReady = true
    view.rerender(<BackToTop />)
    expect(screen.queryByRole('button', { name: 'BACK TO TOP' })).toBeNull()

    setScrollY(240)
    dispatchScroll()
    const button = screen.getByRole('button', { name: 'BACK TO TOP' })
    expect(Array.from(button.querySelectorAll('span span'), (word) => word.textContent)).toEqual([
      'BACK',
      'TO',
      'TOP',
    ])

    setScrollY(0)
    dispatchScroll()
    expect(screen.queryByRole('button', { name: 'BACK TO TOP' })).toBeNull()
  })

  it('subscribes to passive scroll events and removes the listener on unmount', () => {
    const addSpy = vi.spyOn(window, 'addEventListener')
    const removeSpy = vi.spyOn(window, 'removeEventListener')
    const view = render(<BackToTop />)
    const scrollSubscription = addSpy.mock.calls.find(([type]) => String(type) === 'scroll')

    expect(scrollSubscription?.[2]).toEqual(expect.objectContaining({ passive: true }))
    view.unmount()
    expect(removeSpy.mock.calls.some(([type]) => String(type) === 'scroll')).toBe(true)
    expect(addSpy.mock.calls.some(([type]) => String(type) === 'resize')).toBe(true)
    expect(removeSpy.mock.calls.some(([type]) => String(type) === 'resize')).toBe(true)
  })

  it('hides while the page footer intersects the viewport and returns after it leaves', () => {
    runtime.bootReady = true
    setScrollY(500)
    const updateFooter = mockFooterBounds(820, 1100)
    const view = render(<BackToTop />)
    const button = screen.getByRole('button', { name: 'BACK TO TOP' })

    updateFooter(700, 1000)
    dispatchScroll()
    expect(screen.queryByRole('button', { name: 'BACK TO TOP' })).toBeNull()
    const retainedButton = document.querySelector('button[aria-label="BACK TO TOP"]')
    expect(retainedButton?.getAttribute('aria-hidden')).toBe('true')
    expect(retainedButton?.hasAttribute('inert')).toBe(true)

    updateFooter(-300, -20)
    dispatchScroll()
    expect(screen.getByRole('button', { name: 'BACK TO TOP' })).toBe(button)
    view.unmount()
  })

  it('rechecks footer visibility when the viewport resizes without scrolling', () => {
    runtime.bootReady = true
    setScrollY(500)
    mockFooterBounds(900, 1200)
    render(<BackToTop />)
    expect(screen.getByRole('button', { name: 'BACK TO TOP' })).toBeTruthy()

    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 1000 })
    act(() => window.dispatchEvent(new Event('resize')))
    expect(screen.queryByRole('button', { name: 'BACK TO TOP' })).toBeNull()

    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 })
    act(() => window.dispatchEvent(new Event('resize')))
    expect(screen.getByRole('button', { name: 'BACK TO TOP' })).toBeTruthy()
  })

  it('uses the active locale for the visible label', () => {
    runtime.bootReady = true
    setScrollY(1)
    const view = render(<BackToTop />)
    expect(screen.getByRole('button', { name: 'BACK TO TOP' }).textContent).toContain('BACK')

    runtime.locale = 'vi'
    view.rerender(<BackToTop />)
    const button = screen.getByRole('button', { name: 'VỀ ĐẦU TRANG' })
    expect(Array.from(button.querySelectorAll('span span'), (word) => word.textContent)).toEqual([
      'VỀ',
      'ĐẦU',
      'TRANG',
    ])
  })

  it('scrolls Lenis to the top and passes reduced motion as immediate', () => {
    runtime.bootReady = true
    runtime.lenis = { scrollTo: runtime.lenisScrollTo }
    setScrollY(100)
    const view = render(<BackToTop />)
    fireEvent.click(screen.getByRole('button', { name: 'BACK TO TOP' }))
    expect(runtime.lenisScrollTo).toHaveBeenLastCalledWith(0, { immediate: false })

    runtime.reducedMotion = true
    view.rerender(<BackToTop />)
    fireEvent.click(screen.getByRole('button', { name: 'BACK TO TOP' }))
    expect(runtime.lenisScrollTo).toHaveBeenLastCalledWith(0, { immediate: true })
  })

  it('uses native smooth scrolling when Lenis is unavailable', () => {
    runtime.bootReady = true
    setScrollY(100)
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    const view = render(<BackToTop />)
    fireEvent.click(screen.getByRole('button', { name: 'BACK TO TOP' }))
    expect(scrollTo).toHaveBeenLastCalledWith({ top: 0, behavior: 'smooth' })

    runtime.reducedMotion = true
    view.rerender(<BackToTop />)
    fireEvent.click(screen.getByRole('button', { name: 'BACK TO TOP' }))
    expect(scrollTo).toHaveBeenLastCalledWith({ top: 0, behavior: 'instant' })
  })
})
