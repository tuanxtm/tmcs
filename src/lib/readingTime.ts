/**
 * Estimate reading time from Lexical rich text JSON.
 * Uses ~200 words per minute.
 */

type LexicalNode = {
  type?: string
  text?: string
  children?: LexicalNode[]
}

type LexicalRoot = {
  root?: {
    children?: LexicalNode[]
  }
}

const collectText = (node: LexicalNode | undefined, parts: string[]): void => {
  if (!node) return
  if (typeof node.text === 'string' && node.text.length > 0) {
    parts.push(node.text)
  }
  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      collectText(child, parts)
    }
  }
}

export const lexicalToPlainText = (content: unknown): string => {
  const parts: string[] = []
  const lexical = content as LexicalRoot | null | undefined
  collectText(lexical?.root, parts)
  return parts.join(' ').replace(/\s+/g, ' ').trim()
}

export const estimateReadingMinutes = (content: unknown): number => {
  const text = lexicalToPlainText(content)
  if (!text) return 1

  const words = text.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}
