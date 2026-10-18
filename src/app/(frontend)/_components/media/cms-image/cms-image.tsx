'use client';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { MediaView } from '@/app/(frontend)/_lib/types';
import { ImageGlow } from '../image-glow';
import styles from './cms-image.module.css';
type CmsImageProps = {
    media: MediaView;
    className?: string;
    imgClassName?: string;
    imgStyle?: React.CSSProperties;
    sizes: string;
    priority?: boolean;
    fill?: boolean;
    glow?: boolean;
};
export function CmsImage({ media, className, imgClassName, imgStyle, sizes, priority = false, fill = false, glow = true, }: CmsImageProps) {
    const style = media.dominantColor
        ? ({ backgroundColor: media.dominantColor } as React.CSSProperties)
        : undefined;
    if (fill) {
        return (<ImageGlow className={cn(styles.fill, className)} style={style} enabled={glow}>
        <span className={styles.clip}>
          <Image src={media.url} alt={media.alt} fill sizes={sizes} priority={priority} className={cn(styles.cover, imgClassName)}/>
        </span>
      </ImageGlow>);
    }
    const width = media.width || 1600;
    const height = media.height || 900;
    return (<ImageGlow className={className} style={style} enabled={glow}>
      <Image src={media.url} alt={media.alt} width={width} height={height} sizes={sizes} priority={priority} style={imgStyle} className={cn(styles.natural, imgClassName)}/>
    </ImageGlow>);
}
