import React, { useState, useCallback } from 'react'
import { PropTypes } from 'prop-types'
import isUrl from 'is-url'
import { FaLink } from 'react-icons/fa'
import { Editor, Transforms, Range } from 'slate'
import { Button } from 'react-bootstrap'
import InputModal from '../dialogs/InputModal'
import { t as i18n } from 'plottr_locales'

export const LinkButton = ({ editor, logger }) => {
  const [dialogOpen, setOpen] = useState(false)
  const [selection, setSelection] = useState()
  const getLink = useCallback(
    (url) => {
      if (selection) {
        editor.apply({
          type: 'set_selection',
          properties: { anchor: selection.anchor, focus: selection.focus },
          newProperties: { anchor: selection.anchor, focus: selection.focus },
        })
      }
      if (url) insertLink(editor, url, logger)
      setOpen(false)
    },
    [selection, editor, setOpen]
  )
  const cancel = useCallback(() => setOpen(false), [setOpen])

  return (
    <Button
      bsStyle={isLinkActive(editor, logger) ? 'primary' : 'default'}
      onMouseDown={(event) => {
        event.preventDefault()
        if (editor.selection) {
          setSelection(editor.selection)
        }
        if (isLinkActive(editor, logger)) {
          unwrapLink(editor)
        } else {
          setOpen(true)
        }
      }}
    >
      <FaLink />
      <InputModal
        type="text"
        isOpen={dialogOpen}
        cancel={cancel}
        title={i18n('Enter the URL of the link:')}
        getValue={getLink}
      />
    </Button>
  )
}

LinkButton.propTypes = {
  editor: PropTypes.object.isRequired,
  logger: PropTypes.object.isRequired,
}

export const withLinks = (editor, logger) => {
  const { insertData, insertText, isInline } = editor

  editor.isInline = (element) => {
    return element.type === 'link' ? true : isInline(element)
  }

  editor.insertText = (text) => {
    if (text && isUrl(text)) {
      wrapLink(editor, text)
    } else {
      insertText(text)
    }
  }

  editor.insertData = (data) => {
    const text = data.getData('text/plain')

    if (text && isUrl(text)) {
      wrapLink(editor, text, logger)
    } else {
      insertData(data)
    }
  }

  return editor
}

const insertLink = (editor, url, logger) => {
  if (editor.selection) {
    wrapLink(editor, url, logger)
  }
}

const isLinkActive = (editor, logger) => {
  try {
    const [link] = Editor.nodes(editor, { match: (n) => n.type === 'link' })
    return !!link
  } catch (error) {
    if (logger) {
      logger.error('Error checking whether link is active', error)
    }
    return false
  }
}

const unwrapLink = (editor) => {
  Transforms.unwrapNodes(editor, { match: (n) => n.type === 'link' })
}

const wrapLink = (editor, url, logger) => {
  if (isLinkActive(editor, logger)) {
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
