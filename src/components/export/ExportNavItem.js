import React, { useState } from 'react'
import PropTypes from 'react-proptypes'
import { NavItem, Button, Glyphicon, Popover } from 'react-bootstrap'
import { t } from 'plottr_locales'
import UnconnectedOverlayTrigger from '../OverlayTrigger'
import UnconnectedExportDialog from './ExportDialog'
import { checkDependencies } from '../checkDependencies'

const ExportNavItemConnector = (connector) => {
  const ExportDialog = UnconnectedExportDialog(connector)
  const OverlayTrigger = UnconnectedOverlayTrigger(connector)

  const {
    platform: {
      export: { askToExport, export_config },
      log,
      dialog,
      isWindows,
    },
  } = connector
  checkDependencies({ askToExport, export_config, log, dialog, isWindows })

  function ExportNavItem(props) {
    const [showDialog, setShowDialog] = useState(false)
    const [showMenu, setShowMenu] = useState(false)

    const openDialog = () => {
      setShowDialog(true)
    }

    const doExport = (type) => {
      const { ui, seriesName, books, fullState } = props
      const bookId = ui.currentTimeline
      const defaultPath =
        bookId == 'series' ? seriesName + ' ' + t('(Series View)') : books[`${bookId}`].title

      askToExport(
        defaultPath,
        fullState,
        type,
        export_config[type],
        isWindows,
        (error, success) => {
          if (error) {
            log.error(error)
            dialog.showErrorBox(t('Error'), t('There was an error doing that. Try again'))
            return
          }
        }
      )
    }

    const ShowModal = () => {
      if (!showDialog) return null

      return <ExportDialog close={() => setShowDialog(false)} />
    }

    const doWordExport = () => {
      setShowMenu(false)
      doExport('word')
    }

    const doScrivenerExport = () => {
      setShowMenu(false)
      doExport('scrivener')
    }

    const startAdvancedExport = () => {
      setShowMenu(false)
      openDialog()
    }

    const renderPopover = () => {
      return (
        <Popover id="export-popover">
          <ul className="export-list">
            <li onClick={doWordExport}>{t('MS Word')}</li>
            <li onClick={doScrivenerExport}>{t('Scrivener')}</li>
            <li onClick={startAdvancedExport}>{t('Advanced...')}</li>
          </ul>
        </Popover>
      )
    }

    const openMenu = () => {
      setShowMenu(true)
    }

    const hideMenu = () => {
      setShowMenu(false)
    }

    return (
      <NavItem>
        <span className="subnav__container__label">{t('Export')}: </span>
        <OverlayTrigger
          trigger="click"
          rootClose
          placement="bottom"
          overlay={renderPopover}
          open={showMenu}
          onHide={hideMenu}
        >
          <Button bsSize="small" onClick={openMenu}>
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
  checkDependencies({ redux })

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
