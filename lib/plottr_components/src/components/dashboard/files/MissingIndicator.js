import React from 'react'
import { t } from 'plottr_locales'
import Glyphicon from 'reeact-bootstrap/Glyphicon'

export default function MissingIndicator(props) {
  return <Glyphicon glyph="warning-sign" title={t("File can't be found. Did it move?")} />
}
