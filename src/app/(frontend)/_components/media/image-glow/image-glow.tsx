'use client';
import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import styles from './image-glow.module.css';
function syncGlow(wrapper: HTMLSpanElement, image: HTMLImageElement) {
    if (!image.complete || image.naturalWidth === 0)
        return;
    const style = getComputedStyle(image);
    wrapper.style.setProperty('--image-glow-source', `url(${JSON.stringify(image.currentSrc || image.src)})`);
    wrapper.style.setProperty('--image-glow-fit', style.objectFit === 'fill' ? '100% 100%' : style.objectFit);
    wrapper.style.setProperty('--image-glow-position', style.objectPosition);
    wrapper.dataset.imageGlow = 'ready';
}
export function ImageGlow({ children, className, style, enabled = true, }: {
    children: ReactNode;
    className?: string;
    style?: CSSProperties;
    enabled?: boolean;
}) {
    return (<span className={cn(styles.root, styles.glow, className)} style={style} data-image-glow={enabled ? 'pending' : undefined} ref={enabled
            ? (element) => {
                const image = element?.querySelector('img');
                if (element && image)
                    syncGlow(element, image);
            }
            : undefined} onLoadCapture={enabled
            ? (event) => {
                if (event.target instanceof HTMLImageElement)
                    syncGlow(event.currentTarget, event.target);
            }
            : undefined}>
      {children}
    </span>);
}
