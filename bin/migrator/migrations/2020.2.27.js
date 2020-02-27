const _ = require('lodash')
const { jsx } = require('slate-hyperscript')
const MarkDown = require('pagedown')
const md = MarkDown.getSanitizingConverter()

function migrate (data) {
  if (data.file && data.file.version === '2020.2.27') return

  var obj = _.cloneDeep(data)

  // convert all descriptions (where markdown was possible) to slate

  // character descriptions

  // character custom attributes

  // place descriptions

  // card descriptions

  return obj
}

function convert(text) {
  console.log('converting all descriptions')
  const html = md.makeHtml(this.props.description)
  const slate = deserialize(html)
  return slate
}

function deserialize (el) {
  if (el.nodeType === 3) {
    return el.textContent
  } else if (el.nodeType !== 1) {
    return null
  }

  const children = Array.from(el.childNodes).map(deserialize)

  switch (el.nodeName) {
    case 'BODY':
      return jsx('fragment', {}, children)
    case 'BR':
      return '\n'
    case 'BLOCKQUOTE':
      return jsx('element', { type: 'quote' }, children)
    case 'P':
      return jsx('element', { type: 'paragraph' }, children)
    case 'H1':
    case 'H2':
    case 'H3':
    case 'UL':
    case 'LI':
    case 'OL':
    case 'EM':
    case 'STRONG':
    case 'IMG':
      return jsx(
        'element',
        { type: 'img', url: el.getAttribute('src') },
        children
      )
    case 'A':
      return jsx(
        'element',
        { type: 'link', url: el.getAttribute('href') },
        children
      )
    default:
      return el.textContent
  }
}

module.exports = migrate