import type { InlineImageFields } from './inline-blocks'
import styles from './rich-text.module.css'

export function getInlineImageScale(scale: InlineImageFields['scale']): number {
  return typeof scale === 'number' && Number.isFinite(scale) && scale > 0 ? scale : 1
}

function createMarker(align: string): HTMLSpanElement {
  const marker = document.createElement('span')
  marker.className = styles.baselineMarker
  marker.style.verticalAlign = align
  return marker
}

export function syncUniformInlineImages(root: HTMLDivElement): void {
  const rootStyle = getComputedStyle(root)
  const images = Array.from(root.querySelectorAll<HTMLElement>('[data-inline-image-uniform]'))
  const probe = document.createElement('div')
  probe.className = styles.probe
  probe.setAttribute('aria-hidden', 'true')
  probe.inert = true
  const profiles = new Map<
    string,
    {
      aligned: HTMLSpanElement
      baseline: HTMLSpanElement
    }
  >()

  const entries = images.map((wrapper) => {
    const align = wrapper.dataset.inlineImageAlign ?? 'text-bottom'
    const font = align === 'top' || align === 'bottom' ? rootStyle : getComputedStyle(wrapper)
    const key = [font.font, font.fontVariationSettings, font.fontFeatureSettings, align].join('|')
    if (!profiles.has(key)) {
      const sample = document.createElement('p')
      sample.style.font = font.font
      sample.style.fontVariationSettings = font.fontVariationSettings
      sample.style.fontFeatureSettings = font.fontFeatureSettings
      sample.style.lineHeight = rootStyle.lineHeight
      const aligned = createMarker(align)
      const baseline = createMarker('baseline')
      sample.append('M')
      sample.appendChild(aligned)
      sample.appendChild(baseline)
      probe.appendChild(sample)
      profiles.set(key, { aligned, baseline })
    }
    return {
      wrapper,
      align,
      key,
      height: wrapper.querySelector('img')!.getBoundingClientRect().height,
    }
  })

  root.appendChild(probe)
  try {
    const offsets = new Map(
      Array.from(profiles, ([key, { aligned, baseline }]) => [
        key,
        aligned.getBoundingClientRect().top - baseline.getBoundingClientRect().top,
      ]),
    )
    for (const { wrapper, align, key, height } of entries) {
      const reference = offsets.get(key)!
      const top =
        align === 'top' || align === 'text-top'
          ? reference
          : align === 'middle'
            ? reference - height / 2
            : reference - height
      wrapper.style.setProperty('--inline-image-top', `${top}px`)
    }
  } finally {
    probe.remove()
  }

  // Reserve overflow only at the content edges, keeping inter-line spacing tight.
  const rect = root.getBoundingClientRect()
  const oldTop = Number.parseFloat(rootStyle.paddingTop)
  const oldBottom = Number.parseFloat(rootStyle.paddingBottom)
  const imageRects = images.map((wrapper) => wrapper.querySelector('img')!.getBoundingClientRect())
  const top = Math.max(0, ...imageRects.map((image) => oldTop + rect.top - image.top))
  const bottom = Math.max(0, ...imageRects.map((image) => oldBottom + image.bottom - rect.bottom))
  root.style.paddingTop = `${Math.ceil(top)}px`
  root.style.paddingBottom = `${Math.ceil(bottom)}px`
}
