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

import { InlineBlock, type InlineBlockFields } from './inline-blocks'

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

const inlineBlockConverter: JSXConverter<InlineBlockNode> = ({ node }) => (
  <InlineBlock fields={node.fields} />
)

type CmsRichTextProps = {
  data: DefaultTypedEditorState
  className?: string
  paragraphClassName?: string
}

function buildParagraphConverter(
  paragraphClassName?: string,
): JSXConverter<SerializedParagraphNode> {
  const converter: JSXConverter<SerializedParagraphNode> = ({ node, nodesToJSX }) => {
    const children = nodesToJSX({ nodes: node.children })
    return (
      <p className={paragraphClassName}>
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

export function CmsRichText({ data, className, paragraphClassName }: CmsRichTextProps) {
  const converters: JSXConvertersFunction = ({ defaultConverters }) => {
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
      paragraph: buildParagraphConverter(paragraphClassName),
      text: wrappedText,
      blocks: {
        pageBlankSpace: blockConverter,
      },
      inlineBlocks: {
        inlineImage: inlineBlockConverter,
      },
    }
  }

  return <ConvertRichText data={data} converters={converters} className={className} />
}

// Re-export the SerializedBlockNode type so other modules can type inline
// block payloads without depending on the lexical package.
export type { SerializedBlockNode }
