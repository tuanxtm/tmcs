import type { CSSProperties, ReactNode } from 'react'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import {
  type JSXConvertersFunction,
  RichText as ConvertRichText,
} from '@payloadcms/richtext-lexical/react'

import { textStateConfig } from '@/fields/textStateConfig'

const NODE_STATE_KEY = '$'

function hyphenToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase())
}

const jsxConverters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
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
