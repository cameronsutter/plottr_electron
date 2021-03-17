import React, { useState } from 'react'
import { NavItem, Button, Glyphicon } from 'react-bootstrap'
import { t as i18n } from 'plottr_locales'
import ExportDialog from './ExportDialog'

export default function ExportNavItem() {
  const [showDialog, setShowDialog] = useState(false)

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
