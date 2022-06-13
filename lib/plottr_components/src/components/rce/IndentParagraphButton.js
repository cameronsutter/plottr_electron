import React from 'react'
import { FaIndent } from 'react-icons/fa'

import Button from '../Button'

const IndentParagraphButton = () => {
  return (
    <Button
      bsStyle="default"
      onMouseDown={(event) => {
        event.preventDefault()
      }}
    >
      <FaIndent />
    </Button>
  )
}

export default IndentParagraphButton
