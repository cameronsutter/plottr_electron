import React, { useRef, useState } from 'react'
import PropTypes from 'react-proptypes'
import { NavItem, Button, Glyphicon, Popover } from 'react-bootstrap'
import { t } from 'plottr_locales'
import OverlayTrigger from '../OverlayTrigger'
import UnconnectedExportDialog from './ExportDialog'

const ExportNavItemConnector = (connector) => {
  const ExportDialog = UnconnectedExportDialog(connector)

  const {
    platform: {
      export: { askToExport, export_config },
      log,
      dialog,
    },
  } = connector

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
        <OverlayTrigger rootClose placement="bottom" overlay={renderPopover} ref={overlayRef}>
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

  const { redux } = connector

  if (redux) {
    const { connect } = redux

    return connect((state) => ({
      ui: state.present.ui,
      seriesName: state.present.series.name,
      books: state.present.books,
      fullState: state.present,
    }))(ExportNavItem)
  }

  throw new Error('Could not connect ExportNavItem')
}

export default ExportNavItemConnector
