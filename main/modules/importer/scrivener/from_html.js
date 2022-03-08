import jsdom from 'jsdom'
import { jsx } from 'slate-hyperscript'

export function convertHTMLString(html) {
  const dom = new jsdom.JSDOM('<body>' + html + '</body>')
  const slate = deserialize(dom.window.document.body)
  if (!slate.length) {
    slate.push({ type: 'paragraph', children: [{ text: '' }] })
  }
  return slate
}

function deserialize(el) {
  if (el.nodeType === 3) {
    // if it's only a bunch of white space, ignore it
    if (el.textContent == '\n' || el.textContent == '\n\n' || el.textContent == '\n\n\n') {
      return null
    }

    return el.textContent.replace(/[\n]/g, ' ')
  } else if (el.nodeType !== 1) {
    return null
  }

  const children = Array.from(el.childNodes).map(deserialize).flat()
  if (el.textContent.includes('Plotline')) {
    const plotline = el.textContent.split('Plotline: ').pop()
    return [jsx('element', { type: 'plotline' }, plotline)]
  } else {
    switch (el.nodeName) {
      case 'BODY':
        return jsx('fragment', {}, children)
      case 'BR':
        return '\n'
      case 'BLOCKQUOTE':
        return jsx('element', { type: 'block-quote' }, children)
      case 'P':
        return jsx('element', { type: 'paragraph' }, children)
      case 'SPAN':
        return jsx('element', { type: 'text' }, children)
      case 'H1':
        return jsx('element', { type: 'heading-one' }, children)
      case 'H3':
      case 'H4':
      case 'H5':
      case 'H6':
      case 'H2':
        return jsx('element', { type: 'heading-two' }, children)
      case 'UL':
        return jsx('element', { type: 'bulleted-list' }, children)
      case 'LI':
        return jsx('element', { type: 'list-item' }, children)
      case 'OL':
        return jsx('element', { type: 'numbered-list' }, children)
      case 'EM':
      case 'I':
        return jsx('text', { italic: true, text: el.textContent })
      case 'STRONG':
        return jsx('text', { bold: true, text: el.textContent })
      case 'U':
        return jsx('text', { underline: true, text: el.textContent })
      case 'DEL':
        return jsx('text', { strike: true, text: el.textContent })
      case 'IMG': {
        let childrenNodes = children && children.length ? children : [{ text: '' }]
        return jsx('element', { type: 'image-link', url: el.getAttribute('src') }, childrenNodes)
      }
      case 'A':
        return jsx('element', { type: 'link', url: el.getAttribute('href') }, children)
      default:
        if (children && children.length == 0) return el.textContent
        return children
    }
  }
}
