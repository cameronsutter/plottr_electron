import React, { useState } from 'react'
import isUrl from 'is-url'
import { FaImage } from "react-icons/fa"
import { Editor, Transforms, Range } from 'slate'
import { useSlate } from 'slate-react'
import { Button } from 'react-bootstrap'
import InputModal from '../InputModal'
import i18n from 'format-message'

export const ImageLinkButton = () => {
  const editor = useSlate()
  const [dialogOpen, setOpen] = useState(false)
  const [selection, setSelection] = useState()
  const getLink = (url) => {
    if (selection) {
      editor.apply({
        type: 'set_selection',
        properties: { anchor: selection.anchor, focus: selection.focus },
        newProperties: { anchor: selection.anchor, focus: selection.focus },
      })
    }
    if (url) insertImage(editor, url)
    setOpen(false)
  }

  return <Button
    bsStyle={isImageActive(editor) ? 'primary' : 'default'}
    onMouseDown={event => {
      event.preventDefault()
      if (!selection) {
        setSelection(editor.selection)
      }
      setOpen(true)
    }}
  >
    <FaImage/>
    <InputModal type='text' isOpen={dialogOpen} cancel={() => setOpen(false)} title={i18n('Enter the URL of the link:')} getValue={getLink} />
  </Button>
}

export const withImages = editor => {
  const { insertData, isVoid } = editor

  editor.isVoid = element => {
    return element.type === 'image-link' ? true : isVoid(element)
  }

  editor.insertData = data => {
    const text = data.getData('text/plain')
    const { files } = data

    if (files && files.length > 0) {
      for (const file of files) {
        const reader = new FileReader()
        const [mime] = file.type.split('/')

        if (mime === 'image') {
          reader.addEventListener('load', () => {
            const url = reader.result
            insertImage(editor, url)
          })

          reader.readAsDataURL(file)
        }
      }
    } else if (isImageUrl(text)) {
      insertImage(editor, text)
    } else {
      insertData(data)
    }
  }

  return editor
}


const isImageActive = editor => {
  const [link] = Editor.nodes(editor, { match: n => n.type === 'image-link' })
  return !!link
}

const isImageUrl = url => {
  if (!url) return false
  if (!isUrl(url)) return false
  const ext = new URL(url).pathname.split('.').pop()
  return imageExtensions.includes(ext)
}

const insertImage = (editor, url) => {
  const text = { text: '' }
  const image = { type: 'image-link', url, children: [text] }
  Transforms.insertNodes(editor, image)
}