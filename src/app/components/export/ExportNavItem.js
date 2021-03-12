import React, { useState } from 'react'
import { NavItem, Button, Glyphicon } from 'react-bootstrap'
import i18n from 'format-message'
import ExportDialog from './ExportDialog'

export default function ExportNavItem() {
  const [showDialog, setShowDialog] = useState(true) // TODO: set this back to false

  const ShowModal = () => {
    if (!showDialog) return null

    return <ExportDialog close={() => setShowDialog(false)} />
  }

  return (
    <NavItem>
      <span className="subnav__container__label">{i18n('Export')}: </span>
      <Button bsSize="small" onClick={() => setShowDialog(true)}>
        <Glyphicon glyph="export" />
      </Button>
      <ShowModal />
    </NavItem>
  )
}
