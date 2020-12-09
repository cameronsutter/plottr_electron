import React from 'react'
import t from 'format-message'
import { Glyphicon } from 'react-bootstrap'

export default function MissingIndicator (props) {
  return <Glyphicon glyph='warning-sign' title={t("File can't be found. Did it move?")}/>
}