'use client'

import { useLayoutEffect, useRef } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import type {
  DefaultTypedEditorState,
  SerializedBlockNode,
  SerializedParagraphNode,
} from '@payloadcms/richtext-lexical'
import {
  type JSXConverter,
  type JSXConvertersFunction,
  RichText as ConvertRichText,
} from '@payloadcms/richtext-lexical/react'

import { textStateConfig } from '@/fields/textStateConfig'
import { cn } from '@/lib/utils'

import { InlineBlock, type InlineBlockFields } from './inline-blocks'
import { syncUniformInlineImages } from './inline-image-layout'
import styles from './rich-text.module.css'

const NODE_STATE_KEY = '$'

function hyphenToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase())
}

type BlockNode = SerializedBlockNode<{
  blockName?: string | null
  blockType: string
}>

type InlineBlockNode = {
  type: 'inlineBlock'
  version: number
  fields: InlineBlockFields
}

const blockConverter: JSXConverter<BlockNode> = ({ node }) => (
  <InlineBlock fields={node.fields as InlineBlockFields} />
)

type CmsRichTextProps = {
  data: DefaultTypedEditorState
  className?: string
  paragraphClassName?: string
  /** Custom outer layout for natural spacing. Uniform spacing uses block flow. */
  wrapperLayoutClassName?: string
  lineSpacing?: 'natural' | 'uniform'
  /** Fit the desktop Hero's fixed text cell. */
  fitToContainer?: boolean
}

function buildParagraphConverter(
  paragraphClassName?: string,
  uniform = false,
): JSXConverter<SerializedParagraphNode> {
  const converter: JSXConverter<SerializedParagraphNode> = ({ node, nodesToJSX }) => {
    const children = nodesToJSX({ nodes: node.children })
    return (
      <p className={cn('m-0', !uniform && 'overflow-hidden', paragraphClassName)}>
        {children && children.length > 0 ? children : <br />}
      </p>
    )
  }
  return Object.assign(converter, { displayName: 'ParagraphConverter' }) as typeof converter
}

function applyTextStateStyles(
  node: Record<string, unknown> & { text?: ReactNode },
  fallback: ReactNode,
): ReactNode {
  let text: ReactNode = fallback ?? node.text
  const nodeState = node[NODE_STATE_KEY] as Record<string, string> | undefined
  if (!nodeState) return text

  const styles: CSSProperties = {}
  for (const [stateKey, stateValue] of Object.entries(nodeState)) {
    const css =
      textStateConfig[stateKey as keyof typeof textStateConfig]?.[
        stateValue as keyof (typeof textStateConfig)[keyof typeof textStateConfig]
      ]?.css
    if (css) {
      for (const [prop, value] of Object.entries(css)) {
        ;(styles as Record<string, string | undefined>)[hyphenToCamel(prop)] = value
      }
    }
  }
  if (Object.keys(styles).length > 0) {
    text = <span style={styles}>{text}</span>
  }
  return text
}

export function CmsRichText({
  data,
  className,
  paragraphClassName,
  wrapperLayoutClassName,
  lineSpacing = 'natural',
  fitToContainer = false,
}: CmsRichTextProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const uniform = lineSpacing === 'uniform'

  // Fit text and sync inline images after layout, content, or fonts change.
  useLayoutEffect(() => {
    const el = wrapperRef.current
    if (!el) return

    let disposed = false
    let frame = 0
    const updateMetrics = () => {
      el.style.setProperty('--rich-text-font-size', getComputedStyle(el).fontSize)
      if (uniform) syncUniformInlineImages(el)
    }
    const sync = () => {
      if (disposed) return
      if (fitToContainer) el.style.removeProperty('font-size')
      updateMetrics()
      const parent = el.parentElement
      if (fitToContainer && parent && window.matchMedia('(min-width: 1024px)').matches) {
        const parentStyle = getComputedStyle(parent)
        const height =
          parent.clientHeight -
          parseFloat(parentStyle.paddingTop) -
          parseFloat(parentStyle.paddingBottom)
        const width =
          parent.clientWidth -
          parseFloat(parentStyle.paddingLeft) -
          parseFloat(parentStyle.paddingRight)
        if (height <= 0 || width <= 0) return
        const fits = () => el.scrollHeight <= height && el.scrollWidth <= width
        if (fits()) return
        let lower = 1
        let upper = parseFloat(getComputedStyle(el).fontSize)
        // Find the largest size that fits, preserving normal text wrapping.
        for (let step = 0; step < 10; step++) {
          const size = (lower + upper) / 2
          el.style.fontSize = `${size}px`
          updateMetrics()
          if (fits()) lower = size
          else upper = size
        }
        el.style.fontSize = `${lower}px`
        updateMetrics()
      }
    }
    const schedule = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(sync)
    }
    const observer = fitToContainer ? new ResizeObserver(schedule) : null
    if (el.parentElement) observer?.observe(el.parentElement)
    sync()
    window.addEventListener('resize', schedule)
    if (uniform || fitToContainer) {
      void document.fonts.ready.then(sync)
      document.fonts.addEventListener('loadingdone', schedule)
    }
    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      observer?.disconnect()
      window.removeEventListener('resize', schedule)
      if (uniform || fitToContainer) document.fonts.removeEventListener('loadingdone', schedule)
      if (fitToContainer) el.style.removeProperty('font-size')
    }
  }, [className, data, fitToContainer, paragraphClassName, uniform, wrapperLayoutClassName])

  const converters: JSXConvertersFunction = ({ defaultConverters }) => {
    const inlineBlockConverter: JSXConverter<InlineBlockNode> = ({ node }) => (
      <InlineBlock fields={node.fields} uniform={uniform} />
    )
    const defaultTextFn =
      typeof defaultConverters.text === 'function' ? defaultConverters.text : null

    const wrappedText: JSXConverter = (innerArgs) => {
      const fallback = defaultTextFn
        ? // defaultConverters.text is typed against SerializedTextNode; cast
          // through `unknown` so the wrapper can accept any node type.
          (defaultTextFn as (a: typeof innerArgs) => ReactNode)(innerArgs)
        : null
      const node = innerArgs.node as Record<string, unknown> & { text?: ReactNode }
      return applyTextStateStyles(node, fallback)
    }

    return {
      ...defaultConverters,
      paragraph: buildParagraphConverter(paragraphClassName, uniform),
      text: wrappedText,
      blocks: {
        pageBlankSpace: blockConverter,
      },
      inlineBlocks: {
        inlineImage: inlineBlockConverter,
        heroInlineImage: inlineBlockConverter,
      },
    }
  }

  return (
    <div
      ref={wrapperRef}
      className={cn(
        uniform ? styles.uniform : (wrapperLayoutClassName ?? 'flex flex-col gap-4'),
        className,
      )}
    >
      <ConvertRichText data={data} converters={converters} disableContainer={uniform} />
    </div>
  )
}

// Re-export the SerializedBlockNode type so other modules can type inline
// block payloads without depending on the lexical package.
export type { SerializedBlockNode }
