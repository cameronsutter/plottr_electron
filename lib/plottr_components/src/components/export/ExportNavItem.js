import React, { useState } from 'react'
import PropTypes from 'react-proptypes'

import { t } from 'plottr_locales'
import { removeSystemKeys } from 'pltr/v2'

import NavItem from '../NavItem'
import Popover from '../PlottrPopover'
import Glyphicon from '../Glyphicon'
import Button from '../Button'
import UnconnectedPlottrFloater from '../PlottrFloater'
import UnconnectedExportDialog from './ExportDialog'
import { checkDependencies } from '../checkDependencies'

const ExportNavItemConnector = (connector) => {
  const ExportDialog = UnconnectedExportDialog(connector)
  const Floater = UnconnectedPlottrFloater(connector)

  const {
    platform: {
      export: { askToExport, export_config, notifyUser, exportSaveDialog },
      file: { rmRF, writeFile, joinPath, stat, mkdir },
      mpq,
      log,
      showErrorBox,
      isWindows,
      storage: { downloadStorageImage },
    },
  } = connector
  checkDependencies({
    askToExport,
    export_config,
    log,
    showErrorBox,
    isWindows,
    notifyUser,
    mpq,
    exportSaveDialog,
    rmRF,
    writeFile,
    downloadStorageImage,
    joinPath,
    stat,
    mkdir,
  })

  function ExportNavItem(props) {
    const [showDialog, setShowDialog] = useState(false)
    const [showMenu, setShowMenu] = useState(false)

    const openDialog = () => {
      setShowDialog(true)
    }

    const doExport = (type) => {
      const { userId, currentTimeline, seriesName, books, withFullFileState } = props
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
          userId,
          downloadStorageImage,
          writeFile,
          joinPath,
          stat,
          mkdir,
          (error, success) => {
            if (error) {
              log.error(error)
              showErrorBox(t('Error'), t('There was an error doing that. Try again'))
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
        {props.noLabel ? null : <span className="subnav__container__label">{t('Export')}: </span>}
        <Floater
          rootClose
          placement="bottom"
          component={renderPopover}
          open={showMenu}
          onClose={hideMenu}
        >
          <Button bsSize="small" onClick={openMenu}>
            <Glyphicon glyph="export" />
          </Button>
        </Floater>
        <ShowModal />
      </NavItem>
    )
  }

  ExportNavItem.propTypes = {
    currentTimeline: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    seriesName: PropTypes.string,
    books: PropTypes.object,
    withFullFileState: PropTypes.func.isRequired,
    noLabel: PropTypes.bool,
    userId: PropTypes.string,
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
        userId: selectors.userIdSelector(state.present),
      }),
      {
        withFullFileState: actions.project.withFullFileState,
      }
    )(ExportNavItem)
  }

  throw new Error('Could not connect ExportNavItem')
}

export default ExportNavItemConnector
