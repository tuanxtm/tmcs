'use client'

import Link from 'next/link'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { NavChildView } from '@/app/(frontend)/_lib/types'
import type { LocaleCode } from '@/lib/locales'
import { SOCIAL_ICONS } from '@/app/(frontend)/_lib/social-icons'

export type ContactLinks = {
  email: string | null
  links: NavChildView[]
}

type MissingLinkDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  locale: LocaleCode
  thingName: string
  contact: ContactLinks
}

const COPY = {
  en: {
    title: 'Link coming soon',
    body: "We'll add this link later. Contact me if you need it now.",
    email: 'Email me',
    close: 'Close',
  },
  vi: {
    title: 'Liên kết sắp có',
    body: 'Liên kết sẽ được cập nhật sau. Hãy liên hệ với tôi nếu bạn cần ngay.',
    email: 'Gửi email',
    close: 'Đóng',
  },
} as const

function inferPlatform(label: string, href: string): string {
  const hay = `${label} ${href}`.toLowerCase()
  if (hay.includes('github')) return 'github'
  if (hay.includes('linkedin')) return 'linkedin'
  if (hay.includes('youtube') || hay.includes('youtu.be')) return 'youtube'
  if (hay.includes('instagram')) return 'instagram'
  if (hay.includes('tiktok')) return 'tiktok'
  if (hay.includes('threads')) return 'threads'
  if (hay.includes('facebook')) return 'facebook'
  if (hay.includes('twitter') || hay.includes('x.com') || /\bx\b/.test(hay)) return 'x'
  return 'other'
}

export function MissingLinkDialog({
  open,
  onOpenChange,
  locale,
  thingName,
  contact,
}: MissingLinkDialogProps) {
  const copy = COPY[locale]
  const mailto = contact.email
    ? `mailto:${contact.email}?subject=${encodeURIComponent(`Link for ${thingName}`)}`
    : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription>{copy.body}</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          {mailto ? (
            <Button asChild variant="outline" className="w-full justify-center">
              <a href={mailto}>{copy.email}</a>
            </Button>
          ) : null}

          {contact.links.length > 0 ? (
            <ul className="flex flex-wrap items-center justify-center gap-2">
              {contact.links.map((link) => {
                const platform = inferPlatform(link.label, link.href)
                const Icon = SOCIAL_ICONS[platform] || SOCIAL_ICONS.other
                return (
                  <li key={link.id}>
                    <Link
                      href={link.href}
                      target={link.newTab || link.external ? '_blank' : undefined}
                      rel={
                        link.newTab || link.external
                          ? 'noopener noreferrer'
                          : undefined
                      }
                      className="inline-flex min-h-11 min-w-11 items-center justify-center border border-border text-foreground transition-colors hover:bg-hover-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label={link.label}
                    >
                      <Icon className="size-4" aria-hidden="true" />
                    </Link>
                  </li>
                )
              })}
            </ul>
          ) : null}

          <Button
            type="button"
            variant="ghost"
            className="w-full justify-center"
            onClick={() => onOpenChange(false)}
          >
            {copy.close}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
