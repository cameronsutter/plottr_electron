import React, { useState } from 'react'
import cx from 'classnames'
import { ipcRenderer } from 'electron'

export default function DevFileDrop(props) {
  const [inDropZone, drop] = useState(false)

  const handleDragOver = (e) => {
    e.preventDefault()
    drop(true)
  }

  const handleDrop = (e) => {
    e.stopPropagation()
    e.preventDefault()
    drop(false)

    const { files } = e.dataTransfer

    if (files && files.length > 0) {
      for (const file of files) {
        ipcRenderer.send('dev-open-analyzer-file', file.name, file.path)
      }
    }
  }

  return (
    <div
      className={cx('image-picker__dropzone', { dropping: inDropZone })}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      style={{
        height: '20px',
        width: '200px',
        border: '1px solid orange',
        display: 'inline-block',
        margin: 0,
        marginLeft: '10px',
      }}
    />
  )
}
