'use client'

import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { IconSend2 } from '@tabler/icons-react'
import type { LocaleCode } from '@/lib/locales'
import styles from './footer.module.css'
import interactionStyles from '@/app/(frontend)/_components/_styles/interactions.module.css'

export function FooterContactForm({ locale }: { locale: LocaleCode }) {
  const id = useId()
  const openedAt = useRef(0)
  const request = useRef<AbortController | null>(null)
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle')
  const [validEmail, setValidEmail] = useState(false)
  const vi = locale === 'vi'
  const busy = status === 'pending'
  const done = status === 'success'

  useEffect(() => {
    openedAt.current = Date.now()
    return () => request.current?.abort()
  }, [])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (request.current || done || !validEmail) return
    const form = event.currentTarget
    const data = new FormData(form)
    const controller = new AbortController()
    request.current = controller
    setStatus('pending')
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          intent: 'footer-callback',
          email: data.get('email'),
          website: data.get('website'),
          locale,
          sourcePage: window.location.href,
          consent: true,
          openedAt: openedAt.current,
        }),
      })
      const result = (await response.json()) as { ok?: unknown } | null
      if (!response.ok || result?.ok !== true) throw new Error('Submission failed')
      setStatus('success')
    } catch {
      if (!controller.signal.aborted) setStatus('error')
    } finally {
      request.current = null
    }
  }

  return (
    <form
      className={styles.contact}
      onSubmit={submit}
      aria-labelledby={`${id}-title`}
      aria-busy={busy}
      data-footer-tile="contact"
      data-cursor-popup=""
    >
      <div className={styles.contactCopy}>
        <p id={`${id}-title`} className={styles.contactTitle}>
          {vi ? 'LIÊN HỆ CÔNG VIỆC' : 'CONTACT ME'}
        </p>
        <p id={`${id}-description`} className={styles.contactDescription}>
          {vi
            ? 'Có dự án đang ấp ủ? Để lại email, mình cùng bắt sóng nhé.'
            : 'Got a project brewing? Leave your email. Let’s make something click.'}
        </p>
        <p className={styles.status} role="status" aria-live="polite" aria-atomic="true">
          {busy
            ? vi
              ? 'Đang gửi…'
              : 'Sending…'
            : done
              ? vi
                ? 'Đã nhận email. Mình sẽ liên hệ lại nhé.'
                : 'Email received. I’ll be in touch.'
              : status === 'error'
                ? vi
                  ? 'Chưa gửi được. Bạn thử lại nhé.'
                  : 'Couldn’t send that. Please try again.'
                : ''}
        </p>
      </div>
      <div hidden aria-hidden="true">
        <label htmlFor={`${id}-website`}>Website</label>
        <input id={`${id}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <div className={styles.emailRow}>
        <label className="sr-only" htmlFor={`${id}-email`}>
          {vi ? 'Email của bạn' : 'Your email'}
        </label>
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          required
          maxLength={254}
          pattern={'[^\\s@]+@[^\\s@]+\\.[^\\s@]+'}
          autoComplete="email"
          onChange={(event) => setValidEmail(event.currentTarget.validity.valid)}
          placeholder={vi ? 'Nhập email của bạn' : 'Enter your email'}
          aria-describedby={`${id}-description`}
          disabled={busy || done}
          className={styles.emailInput}
        />
        <button
          type="submit"
          className={`${styles.submit} ${interactionStyles.cellHover}`}
          disabled={busy || done || !validEmail}
          aria-label={vi ? 'Yêu cầu liên hệ qua email' : 'Request an email reply'}
        >
          <IconSend2 aria-hidden="true" />
        </button>
      </div>
    </form>
  )
}
