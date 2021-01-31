import { jsx } from 'slate-hyperscript'
import MarkDown from 'pagedown'
const md = MarkDown.getSanitizingConverter()
import DomParser from 'dom-parser'
const parser = new DomParser()

export default function convert(text) {
  if (!text) return [{ children: [{ text: '' }] }]
  if (text == '') return [{ children: [{ text: '' }] }]

  const html = md.makeHtml(text)
  const dom = parser.parseFromString('<body>' + html + '</body>')
  const slate = deserialize(dom.getElementsByTagName('body')[0])
  if (!slate.length) {
    slate.push({ children: [{ text: '' }] })
  }
  return slate
}

function deserialize(el) {
  if (el.nodeType === 3) {
    if (el.textContent == '\n\n') return null

    return el.textContent
  } else if (el.nodeType !== 1) {
    return null
  }

  const children = Array.from(el.childNodes).map(deserialize)

  switch (el.nodeName) {
    case 'body':
      return jsx('fragment', {}, children)
    case 'br':
      return jsx('element', { type: 'paragraph' }, [{ text: '' }])
    case 'blockquote':
      return jsx(
        'element',
        { type: 'block-quote' },
        children.filter((node) => !node.text)
      )
    case 'p':
      return jsx('element', { type: 'paragraph' }, fixParagraphChildren(children))
    case 'h1':
      return jsx('element', { type: 'heading-one' }, children)
    case 'h2':
      return jsx('element', { type: 'heading-two' }, children)
    case 'h3':
      return jsx('element', { type: 'heading-three' }, children)
    case 'h4':
      return jsx('element', { type: 'heading-four' }, children)
    case 'h5':
      return jsx('element', { type: 'heading-five' }, children)
    case 'h6':
      return jsx('element', { type: 'heading-six' }, children)
    case 'ul':
      return jsx(
        'element',
        { type: 'bulleted-list' },
        children.filter((node) => node != '\n')
      )
    case 'li':
      return jsx('element', { type: 'list-item' }, fixParagraphChildren(children))
    case 'ol':
      return jsx(
        'element',
        { type: 'numbered-list' },
        children.filter((node) => node != '\n')
      )
    case 'em':
      return jsx('text', { italic: true, text: el.textContent })
    case 'strong':
      return jsx('text', { bold: true, text: el.textContent })
    case 'u':
      return jsx('text', { underline: true, text: el.textContent })
    case 'img':
      return jsx('element', { type: 'image-link', url: el.getAttribute('src') }, children)
    case 'a':
      return jsx('element', { type: 'link', url: el.getAttribute('href') }, children)
    default:
      return el.textContent
  }
}

function fixParagraphChildren(children) {
  return children.map((node) => {
    if (node.type) return node.children.map((child) => child.text).join(' ')

    return node
  })
}
