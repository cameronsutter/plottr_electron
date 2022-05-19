import React, { useState } from 'react'
import PropTypes from 'react-proptypes'

import { t } from 'plottr_locales'
import { removeSystemKeys } from 'pltr/v2'

import NavItem from '../NavItem'
import PlottrPopover from '../PlottrPopover'
import Glyphicon from '../Glyphicon'
import Button from '../Button'
import UnconnectedPlottrFloater from '../PlottrFloater'
import UnconnectedExportDialog from './ExportDialog'
import { checkDependencies } from '../checkDependencies'

const ExportNavItemConnector = (connector) => {
  const ExportDialog = UnconnectedExportDialog(connector)
  const PlottrFloater = UnconnectedPlottrFloater(connector)

  const {
    platform: {
      export: { askToExport, export_config, notifyUser, exportSaveDialog },
      file: { rmRF },
      mpq,
      log,
      dialog,
      isWindows,
    },
  } = connector
  checkDependencies({
    askToExport,
    export_config,
    log,
    dialog,
    isWindows,
    notifyUser,
    mpq,
    exportSaveDialog,
    rmRF,
  })

  function ExportNavItem(props) {
    const [showDialog, setShowDialog] = useState(false)
    const [showMenu, setShowMenu] = useState(false)

    const openDialog = () => {
      setShowDialog(true)
    }

    const doExport = (type) => {
      const { currentTimeline, seriesName, books, withFullFileState } = props
      const bookId = currentTimeline
      const defaultPath =
        bookId == 'series' ? seriesName + ' ' + t('(Series View)') : books[`${bookId}`].title

      withFullFileState((state) => {
        const withoutSystemKeys = removeSystemKeys(state.present)
        askToExport(
          defaultPath,
          withoutSystemKeys,
          type,
          export_config[type],
          isWindows(),
          notifyUser,
          log,
          exportSaveDialog,
          mpq,
          rmRF,
          (error, success) => {
            if (error) {
              log.error(error)
              dialog.showErrorBox(t('Error'), t('There was an error doing that. Try again'))
              return
            }
          }
        )
      })
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
        <PlottrPopover id="export-popover">
          <ul className="export-list">
            <li onClick={doWordExport}>{t('MS Word')}</li>
            <li onClick={doScrivenerExport}>{t('Scrivener')}</li>
            <li onClick={startAdvancedExport}>{t('Advanced...')}</li>
          </ul>
        </PlottrPopover>
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
        <PlottrFloater
          rootClose
          placement="bottom"
          component={renderPopover}
          open={showMenu}
          onClose={hideMenu}
        >
          <Button bsSize="small" onClick={openMenu}>
            <Glyphicon glyph="export" />
          </Button>
        </PlottrFloater>
        <ShowModal />
      </NavItem>
    )
  }

  ExportNavItem.propTypes = {
    currentTimeline: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    seriesName: PropTypes.string,
    books: PropTypes.object,
    withFullFileState: PropTypes.func.isRequired,
  }

  const {
    redux,
    pltr: { selectors, actions },
  } = connector
  checkDependencies({ redux })

  if (redux) {
    const { connect } = redux

    return connect(
      (state) => ({
        currentTimeline: selectors.currentTimelineSelector(state.present),
        seriesName: state.present.series.name,
        books: state.present.books,
      }),
      {
        withFullFileState: actions.project.withFullFileState,
      }
    )(ExportNavItem)
  }

  throw new Error('Could not connect ExportNavItem')
}

export default ExportNavItemConnector
