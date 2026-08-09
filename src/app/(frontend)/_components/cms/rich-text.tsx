import type { CSSProperties, ReactNode } from 'react'
import type { DefaultTypedEditorState, SerializedBlockNode } from '@payloadcms/richtext-lexical'
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

const blockConverter: JSXConverter<BlockNode> = ({ node }) => (
  <InlineBlock fields={node.fields as InlineBlockFields} />
)

const jsxConverters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  blocks: {
    layoutBlankSpace: blockConverter,
  },
  text: (args) => {
    const { node } = args

    let text: ReactNode =
      typeof defaultConverters.text === 'function' ? defaultConverters.text(args) : node.text

    const nodeState = (node as Record<string, unknown>)[NODE_STATE_KEY] as
      | Record<string, string>
      | undefined

    if (nodeState) {
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
    }

    return text
  },
})

type CmsRichTextProps = {
  data: DefaultTypedEditorState
  className?: string
}

export function CmsRichText({ data, className }: CmsRichTextProps) {
  return <ConvertRichText data={data} converters={jsxConverters} className={className} />
}

// Re-export the SerializedBlockNode type so other modules can type inline
// block payloads without depending on the lexical package.
export type { SerializedBlockNode }
