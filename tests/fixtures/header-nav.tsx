import { createRoot } from 'react-dom/client'
import { flushSync } from 'react-dom'
import { HeaderNav } from '@/app/(frontend)/_components/layout/header-nav'
import styles from '@/app/(frontend)/_components/layout/site-header.module.css'
import type { NavItemView } from '@/app/(frontend)/_lib/types'

const items: NavItemView[] = [
  {
    id: 'work',
    label: 'Work',
    href: '/projects',
    newTab: false,
    external: false,
    children: [
      { id: 'posts', label: 'Posts', href: '/posts', newTab: false, external: false },
      {
        id: 'design-workflows',
        label: 'Design workflows',
        href: '/design-workflows',
        newTab: false,
        external: false,
      },
      { id: 'videos', label: 'Videos', href: '/videos', newTab: false, external: false },
    ],
  },
  {
    id: 'projects',
    label: 'Projects',
    href: '/projects',
    newTab: false,
    external: false,
    children: [],
  },
  {
    id: 'contact',
    label: 'Contact',
    href: '/contact',
    newTab: false,
    external: false,
    children: [],
  },
]

const root = createRoot(document.getElementById('fixture')!)
flushSync(() =>
  root.render(
    <header className={styles.header}>
      <div className={styles.logoCell}>TMCS</div>
      <HeaderNav items={items} locale="en" />
    </header>,
  ),
)
