import React, { useState } from 'react'
import isUrl from 'is-url'
import { FaLink } from "react-icons/fa"
import { Editor, Transforms, Range } from 'slate'
import { useSlate } from 'slate-react'
import { Button } from 'react-bootstrap'
import InputModal from '../InputModal'
import i18n from 'format-message'

export const LinkButton = () => {
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
    if (url) insertLink(editor, url)
    setOpen(false)
  }
  return <Button
    bsStyle={isLinkActive(editor) ? 'primary' : 'default'}
    onMouseDown={event => {
      event.preventDefault()
      if (isLinkActive(editor)) {
        unwrapLink(editor)
        return
      }
      if (!selection) {
        setSelection(editor.selection)
      }
      setOpen(true)
    }}
  >
    <FaLink/>
    <InputModal type='text' isOpen={dialogOpen} cancel={() => setOpen(false)} title={i18n('Enter the URL of the link:')} getValue={getLink} />
  </Button>
}

export const withLinks = editor => {
  const { insertData, insertText, isInline } = editor

  editor.isInline = element => {
    return element.type === 'link' ? true : isInline(element)
  }

  editor.insertText = text => {
    if (text && isUrl(text)) {
      wrapLink(editor, text)
    } else {
      insertText(text)
    }
  }

  editor.insertData = data => {
    const text = data.getData('text/plain')

    if (text && isUrl(text)) {
      wrapLink(editor, text)
    } else {
      insertData(data)
    }
  }

  return editor
}

const insertLink = (editor, url) => {
  if (editor.selection) {
    wrapLink(editor, url)
  }
}

const isLinkActive = editor => {
  const [link] = Editor.nodes(editor, { match: n => n.type === 'link' })
  return !!link
}

const unwrapLink = editor => {
  Transforms.unwrapNodes(editor, { match: n => n.type === 'link' })
}

const wrapLink = (editor, url) => {
  if (isLinkActive(editor)) {
    unwrapLink(editor)
  }

  const { selection } = editor
  const isCollapsed = selection && Range.isCollapsed(selection)
  const link = {
    type: 'link',
    url,
    children: isCollapsed ? [{ text: url }] : [],
  }

  if (isCollapsed) {
    Transforms.insertNodes(editor, link)
  } else {
    Transforms.wrapNodes(editor, link, { split: true })
    Transforms.collapse(editor, { edge: 'end' })
  }
}