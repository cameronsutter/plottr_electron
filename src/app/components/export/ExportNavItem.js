import React from 'react'
import path from 'path'
import { ipcRenderer, remote } from 'electron'
import { NavItem, Button, Glyphicon, Popover, OverlayTrigger, Alert } from 'react-bootstrap'
import i18n from 'format-message'
import { MPQ } from 'middlewares/helpers'

const win = remote.getCurrentWindow()
const dialog = remote.dialog

function ExportNavItem (props) {

  const doWordExport = () => {
    doExport('word')
  }

  const doScrivenerExport = () => {
    doExport('scrivener')
  }

  const doExport = (type) => {
    let label = i18n('Where would you like to save the export?')
    const defaultPath = path.basename(props.fileName).replace('.pltr', '')
    let filters = []
    switch (type) {
      case 'word':
        filters = [{name: i18n('MS Word'), extensions: ['docx']}]
        break
      case 'scrivener':
        filters = [{name: i18n('Scrivener Project'), extensions: ['scriv']}]
        break
    }
    const fileName = dialog.showSaveDialogSync(win, {title: label, filters, defaultPath})
    if (fileName) {
      const options = { fileName, bookId: props.bookId }
      MPQ.push('Export', {export_type: type})
      switch (type) {
        case 'word':
          ipcRenderer.send('export', options, win.id)
          break
        case 'scrivener':
          ipcRenderer.sendTo(win.webContents.id, 'export-scrivener', fileName) // sends this message to this same process
          break
      }
    }
  }

  const renderPopover = () => {
    return <Popover id='export-popover'>
      <ul className='export-list'>
        <li onClick={doWordExport}>{i18n('MS Word')}</li>
        <li onClick={doScrivenerExport}>{i18n('Scrivener')}</li>
      </ul>
    </Popover>
  }

  return <NavItem>
    <span className='subnav__container__label'>{i18n('Export')}: </span>
    <OverlayTrigger trigger='click' rootClose placement='bottom' overlay={renderPopover()}>
      <Button bsSize='small'><Glyphicon glyph='export' /></Button>
    </OverlayTrigger>
  </NavItem>
}

export default ExportNavItem