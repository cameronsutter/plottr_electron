import React, { useRef, useState } from 'react'
import PropTypes from 'react-proptypes'
import { remote } from 'electron'
import { connect } from 'react-redux'
import { NavItem, Button, Glyphicon, Popover, OverlayTrigger } from 'react-bootstrap'
import { t } from 'plottr_locales'
import log from 'electron-log'
import ExportDialog from './ExportDialog'
import askToExport from '../../../common/exporter/start_export'
import export_config from '../../../common/exporter/default_config'

const { dialog } = remote

function ExportNavItem(props) {
  const [showDialog, setShowDialog] = useState(false)
  const overlayRef = useRef(null)

  const openDialog = () => {
    setShowDialog(true)
    overlayRef.current.hide()
  }

  const doExport = (type) => {
    overlayRef.current.hide()
    const { ui, seriesName, books, fullState } = props
    const bookId = ui.currentTimeline
    const defaultPath =
      bookId == 'series' ? seriesName + ' ' + t('(Series View)') : books[`${bookId}`].title

    askToExport(defaultPath, fullState, type, export_config[type], (error, success) => {
      if (error) {
        log.error(error)
        dialog.showErrorBox(t('Error'), t('There was an error doing that. Try again'))
        return
      }
    })
  }

  const ShowModal = () => {
    if (!showDialog) return null

    return <ExportDialog close={() => setShowDialog(false)} />
  }

  const renderPopover = () => {
    return (
      <Popover id="export-popover">
        <ul className="export-list">
          <li onClick={() => doExport('word')}>{t('MS Word')}</li>
          <li onClick={() => doExport('scrivener')}>{t('Scrivener')}</li>
          <li onClick={openDialog}>{t('Advanced...')}</li>
        </ul>
      </Popover>
    )
  }

  return (
    <NavItem>
      <span className="subnav__container__label">{t('Export')}: </span>
      <OverlayTrigger
        trigger="click"
        rootClose
        placement="bottom"
        overlay={renderPopover()}
        ref={overlayRef}
      >
        <Button bsSize="small">
          <Glyphicon glyph="export" />
        </Button>
      </OverlayTrigger>
      <ShowModal />
    </NavItem>
  )
}

ExportNavItem.propTypes = {
  ui: PropTypes.object,
  seriesName: PropTypes.string,
  books: PropTypes.object,
  fullState: PropTypes.object,
}

export default connect((state) => ({
  ui: state.present.ui,
  seriesName: state.present.series.name,
  books: state.present.books,
  fullState: state.present,
}))(ExportNavItem)
