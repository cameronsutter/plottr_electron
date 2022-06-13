import React from 'react'
import { FaOutdent } from 'react-icons/fa'

import Button from '../Button'

const DedentParagraphButton = () => {
  return (
    <Button
      bsStyle="default"
      onMouseDown={(event) => {
        event.preventDefault()
      }}
    >
      <FaOutdent />
    </Button>
  )
}

export default DedentParagraphButton
