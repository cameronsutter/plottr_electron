import React, { useState } from 'react'
import { PropTypes } from 'prop-types'
import { FaImage } from 'react-icons/fa'
import { Editor, Transforms } from 'slate'
import { Button } from 'react-bootstrap'
import UnconnectedImagePicker from '../images/ImagePicker'
import { actions } from 'pltr/v2'
import { readImage, isImageUrl, readImageFromURL } from '../images'
import { checkDependencies } from '../checkDependencies'

const { addImage } = actions.image

const ImagesButtonConnector = (connector) => {
  const ImagePicker = UnconnectedImagePicker(connector)

  const {
    platform: {
      log,
      storage: { isStorageURL },
    },
  } = connector
  checkDependencies({ isStorageURL, log })

  const ImagesButton = ({ editor }) => {
    const [dialogOpen, setOpen] = useState(false)
    const [selection, setSelection] = useState()
    const getData = (id, data) => {
      if (selection) {
        editor.apply({
          type: 'set_selection',
          properties: { anchor: selection.anchor, focus: selection.focus },
          newProperties: { anchor: selection.anchor, focus: selection.focus },
        })
      }
      if (isStorageURL(data)) insertImageLink(editor, data)
      else if (data) insertImageData(editor, data)
      setOpen(false)
    }

    // TODO: send ImagePicker the selectedId
    return (
      <Button
        bsStyle={isImageActive(editor, log) ? 'primary' : 'default'}
        onMouseDown={(event) => {
          event.preventDefault()
          setSelection(editor.selection)
          setOpen(true)
        }}
      >
        <FaImage />
        {dialogOpen ? (
          <ImagePicker modalOnly chooseImage={getData} close={() => setOpen(false)} />
        ) : null}
      </Button>
    )
  }

  ImagesButton.propTypes = {
    editor: PropTypes.object.isRequired,
  }

  return ImagesButton
}

export default ImagesButtonConnector

export const withImages = (editor) => {
  const { insertData, isVoid } = editor

  editor.isVoid = (element) => {
    return element.type === 'image-link' || element.type === 'image-data' ? true : isVoid(element)
  }

  editor.insertData = (data) => {
    const text = data.getData('text/plain')
    const { files } = data

    if (files && files.length > 0) {
      for (const file of files) {
        const [mime] = file.type.split('/')

        if (mime === 'image') {
          readImage(file, (data) => {
            window.specialDelivery(addImage({ data, name: file.name, path: file.path }))
            insertImageData(editor, data)
          })
        }
      }
    } else if (isImageUrl(text)) {
      readImageFromURL(text, (strData) => {
        window.specialDelivery(addImage({ data: strData, name: text, path: text }))
        insertImageData(editor, strData)
      })
    } else {
      insertData(data)
    }
  }

  return editor
}

const isImageActive = (editor, log) => {
  try {
    const [link] = Editor.nodes(editor, {
      match: (n) => n.type === 'image-link' || n.type === 'image-data',
    })
    return !!link
  } catch (error) {
    log.error('Error finding whether image is active', error)
    return false
  }
}

const insertImageData = (editor, data) => {
  const text = { text: '' }
  const image = { type: 'image-data', data, children: [text] }
  Transforms.insertNodes(editor, image)
}

const insertImageLink = (editor, storageUrl) => {
  const text = { text: '' }
  const image = { type: 'image-link', storageUrl, children: [text] }
  Transforms.insertNodes(editor, image)
}
