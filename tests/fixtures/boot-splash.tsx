import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BootSplash } from '@/app/(frontend)/_components/layout/boot-splash'
import {
  BootRevealContent,
  BootRevealProvider,
} from '@/app/(frontend)/_components/providers/boot-reveal'

const query = new URLSearchParams(location.search)
function mount() {
  createRoot(document.getElementById('fixture')!).render(
    <StrictMode>
      <BootRevealProvider>
        <BootSplash locale={query.get('locale') === 'vi' ? 'vi' : 'en'} />
        <BootRevealContent>
          <main>Page content</main>
        </BootRevealContent>
      </BootRevealProvider>
    </StrictMode>,
  )
}
if (query.has('afterLoad')) window.addEventListener('load', mount, { once: true })
else mount()
