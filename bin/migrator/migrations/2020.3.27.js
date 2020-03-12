const _ = require('lodash')
const { jsx } = require('slate-hyperscript')
const MarkDown = require('pagedown')
const md = MarkDown.getSanitizingConverter()
const DomParser = require('dom-parser')
const parser = new DomParser()

function migrate (data) {
  if (data.file && data.file.version === '2020.3.27') return

  var obj = _.cloneDeep(data)

  // convert all descriptions (where markdown was possible) to slate

  // character notes
  // character custom attributes
  obj.characters = obj.characters.map(ch => {
    let newCharacter = {
      ...ch,
      notes: convert(ch.notes)
    }
    obj.customAttributes.characters.forEach(ca => {
      const parts = ca.split(':#:')
      if (parts[1] && parts[1] == 'paragraph') {
        newCharacter[parts[0]] = convert(newCharacter[parts[0]])
      }
    })
    return newCharacter
  })

  // place notes
  obj.places = obj.places.map(pl => {
    return {
      ...pl,
      notes: convert(pl.notes)
    }
  })

  // card description
  obj.cards = obj.cards.map(c => {
    return {
      ...c,
      description: convert(c.description)
    }
  })

  // note content
  obj.notes = obj.notes.map(n => {
    return {
      ...n,
      content: convert(n.content)
    }
  })

  return obj
}

function convert(text) {
  const html = md.makeHtml(text)
  const dom = parser.parseFromString('<body>' + html + '</body>')
  const slate = deserialize(dom.getElementsByTagName('body')[0])
  if (!slate.length) {
    slate.push({
      type: 'paragraph',
      children: [{ text: '' }],
    })
  }
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
    case 'body':
      return jsx('fragment', {}, children)
    case 'br':
      return '\n'
    case 'blockquote':
      return jsx('element', { type: 'block-quote' }, children)
    case 'p':
      return jsx('element', { type: 'paragraph' }, children)
    case 'h1':
      return jsx('element', {type: 'heading-one'}, children)
    case 'h2':
      return jsx('element', {type: 'heading-two'}, children)
    case 'h3':
      return jsx('element', {type: 'heading-three'}, children)
    case 'h4':
      return jsx('element', {type: 'heading-four'}, children)
    case 'h5':
      return jsx('element', {type: 'heading-five'}, children)
    case 'h6':
      return jsx('element', {type: 'heading-six'}, children)
    case 'ul':
      return jsx('element', {type: 'bulleted-list'}, children)
    case 'li':
      return jsx('element', {type: 'list-item'}, children)
    case 'ol':
      return jsx('element', {type: 'numbered-list'}, children)
    case 'em':
      return jsx('text', {italic: true})
    case 'strong':
      return jsx('text', {bold: true})
    case 'img':
      return jsx('element', { type: 'img', url: el.getAttribute('src') }, children )
    case 'a':
      return jsx('element', { type: 'link', url: el.getAttribute('href') }, children )
    default:
      return el.textContent
  }
}

module.exports = migrate