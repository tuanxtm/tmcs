import styles from './background.module.css'
const PAPER_TEXTURE = `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
    <defs>
      <pattern id="weave" width="4" height="4" patternUnits="userSpaceOnUse">
        <rect width="4" height="4" fill="#808080"/>
        <path d="M0 .5H4M.5 0V4" stroke="#fff" stroke-opacity=".45"/>
        <path d="M0 2.5H4M2.5 0V4" stroke="#000" stroke-opacity=".45"/>
      </pattern>
      <filter id="paper" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency=".55" numOctaves="3" seed="8" stitchTiles="stitch" result="grain"/>
        <feDisplacementMap in="SourceGraphic" in2="grain" scale="1.5" xChannelSelector="R" yChannelSelector="G" result="fibers"/>
        <feBlend in="fibers" in2="grain" mode="soft-light"/>
        <feColorMatrix type="saturate" values="0"/>
      </filter>
    </defs>
    <rect width="100%" height="100%" fill="url(#weave)" filter="url(#paper)" opacity=".35"/>
  </svg>`)}")`
export function Background() {
  return (
    <div
      aria-hidden="true"
      className={styles.root}
      style={{
        backgroundImage: PAPER_TEXTURE,
      }}
    />
  )
}
