import { createRoot } from 'react-dom/client'
import { flushSync } from 'react-dom'
import { CmsRichText } from '@/app/(frontend)/_components/cms/rich-text'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

type FixtureOptions = {
  scales?: number[]
  alignments?: string[]
  unresolved?: boolean
  font?: 'serif' | 'sans' | 'mono'
  multiple?: boolean
  edgeImages?: boolean
  fitToContainer?: boolean
}

const imageURL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
const root = createRoot(document.getElementById('fixture')!)

function makeData({
  scales = [0.5, 1, 1.5, 2, 2.5, 3],
  alignments,
  unresolved,
  font,
  multiple,
  edgeImages,
}: FixtureOptions) {
  const text = (value: string) => ({
    type: 'text',
    text: value,
    format: 0,
    detail: 0,
    mode: 'normal',
    style: '',
    version: 1,
    ...(font ? { $: { font } } : {}),
  })
  const paragraph = (children: unknown[]) => ({
    type: 'paragraph',
    children,
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
    textFormat: 0,
    textStyle: '',
  })
  const children = scales.map((scale, index) =>
    paragraph([
      text('Lorem ipsum '),
      {
        type: 'inlineBlock',
        version: 2,
        fields: {
          blockType: 'inlineImage',
          scale,
          align: alignments?.[index % alignments.length] ?? 'text-bottom',
          image: unresolved
            ? 123
            : { url: imageURL, width: index % 2 ? 180 : 100, height: 100, alt: 'Inline sample' },
        },
      },
      text(' dolor sit amet consectetur adipiscing elit. '),
      { type: 'linebreak', version: 1 },
      text('Tiếng Việt: sáng tạo và phát triển.'),
    ]),
  )
  if (multiple) {
    children[0].children.push(
      {
        type: 'link',
        version: 3,
        fields: { linkType: 'custom', url: 'https://example.com', newTab: false },
        children: [
          {
            type: 'inlineBlock',
            version: 2,
            fields: {
              blockType: 'inlineImage',
              scale: 3,
              align: 'text-top',
              image: { url: imageURL, width: 100, height: 100, alt: 'Linked image' },
            },
          },
        ],
      },
      { ...text(' Mixed fonts '), $: { font: 'mono' } },
      {
        type: 'inlineBlock',
        version: 2,
        fields: {
          blockType: 'inlineImage',
          scale: 2,
          align: 'baseline',
          image: { url: imageURL, width: 180, height: 100, alt: 'Second image' },
        },
      },
    )
  }
  children.push(
    paragraph([text('A text-only paragraph with enough words to wrap at narrow viewport widths.')]),
  )
  children.push(paragraph([]))
  children.push(
    paragraph([
      text('Last paragraph.'),
      ...(edgeImages
        ? [
            {
              type: 'inlineBlock',
              version: 2,
              fields: {
                blockType: 'inlineImage',
                scale: 3,
                align: 'text-top',
                image: { url: imageURL, width: 100, height: 100, alt: 'Trailing image' },
              },
            },
          ]
        : []),
    ]),
  )
  return {
    root: { type: 'root', children, direction: 'ltr', format: '', indent: 0, version: 1 },
  } as DefaultTypedEditorState
}

declare global {
  interface Window {
    renderRichTextFixture: (options?: FixtureOptions) => void
  }
}

window.renderRichTextFixture = (options = {}) => {
  const data = makeData(options)
  flushSync(() =>
    root.render(
      <>
        <div
          id="uniform"
          style={
            options.fitToContainer
              ? { width: '60vw', height: 300, padding: 16, boxSizing: 'border-box' }
              : undefined
          }
        >
          <CmsRichText data={data} lineSpacing="uniform" fitToContainer={options.fitToContainer} />
        </div>
        <div id="natural">
          <CmsRichText data={data} />
        </div>
      </>,
    ),
  )
}

window.renderRichTextFixture()
