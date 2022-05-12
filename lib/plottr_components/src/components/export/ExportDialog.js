import React, { useState } from 'react'
import PropTypes from 'react-proptypes'
import { NavItem } from 'react-bootstrap'

import { t } from 'plottr_locales'
import { removeSystemKeys } from 'pltr/v2'

import Nav from '../Nav'
import ButtonToolbar from '../ButtonToolbar'
import Glyphicon from '../Glyphicon'
import Button from '../Button'
import UnconnectedPlottrModal from '../PlottrModal'
import Switch from '../Switch'
import UnconnectedExportBody from './ExportBody'
import { checkDependencies } from '../checkDependencies'

const modalStyles = {
  content: {
    borderRadius: 20,
  },
}

const ExportDialogConnector = (connector) => {
  const PlottrModal = UnconnectedPlottrModal(connector)
  const ExportBody = UnconnectedExportBody(connector)

  const {
    platform: {
      log,
      dialog,
      export: { askToExport, saveExportConfigSettings, notifyUser, exportSaveDialog },
      file: { rmRF },
      isWindows,
      mpq,
    },
  } = connector
  checkDependencies({
    log,
    dialog,
    askToExport,
    saveExportConfigSettings,
    isWindows,
    notifyUser,
    exportSaveDialog,
    mpq,
    rmRF,
  })

  function ExportDialog(props) {
    const { exportConfig } = props

    const [saveOptions, setSaveOptions] = useState(exportConfig.saveSettings)
    const [options, setOptions] = useState(exportConfig)
    const type = exportConfig.savedType
    const setType = (type) => saveExportConfigSettings('savedType', type)

    const updateOptions = (newValues) => {
      const newOptions = { ...options, [type]: newValues }
      setOptions(newOptions)
    }

    const doExport = () => {
      const { bookId, seriesName, books, projectActions } = props
      const defaultPath =
        bookId == 'series' ? seriesName + ' ' + t('(Series View)') : books[`${bookId}`].title

      projectActions.withFullFileState((state) => {
        const withoutSystemKeys = removeSystemKeys(state.present)
        askToExport(
          defaultPath,
          withoutSystemKeys,
          type,
          options[type],
          isWindows(),
          notifyUser,
          log,
          exportSaveDialog,
          mpq,
          rmRF,
          (error, success) => {
            if (saveOptions) {
              saveExportConfigSettings('savedType', type)
              // We don't want to maintain the filter across projects
              // because they have different plot lines and different
              // numbers of plot lines.
              saveExportConfigSettings(type, {
                ...options[type],
                filter: null,
              })
            }

            if (error) {
              log.error(error)
              dialog.showErrorBox(t('Error'), t('There was an error doing that. Try again'))
              return
            }

            if (success) {
              props.close()
            }
          }
        )
      })
    }

    const Chooser = () => {
      return (
        <Nav bsStyle="pills" className="navbar-nav" activeKey={type} onSelect={setType}>
          <NavItem eventKey="word" title={t('.docx')}>
            {t('MS Word')}
          </NavItem>
          <NavItem eventKey="scrivener" title={t('.scriv')}>
            {t('Scrivener')}
          </NavItem>
        </Nav>
      )
    }

    return (
      <PlottrModal isOpen={true} onRequestClose={props.close} style={modalStyles}>
        <div className="export-dialog__wrapper">
          <div className="export-dialog__header">
            <div className="export-dialog__type-chooser">
              <h3>{t('Advanced Export Options')}</h3>
              <div className="right-side">
                <Chooser />
                <Button bsStyle="success" disabled={!type} onClick={doExport}>
                  <Glyphicon glyph="export" />
                </Button>
              </div>
            </div>
            <hr />
          </div>
          <div className="export-dialog__body">
            <ExportBody type={type} onChange={updateOptions} />
            {type == null ? (
              <div className="export-dialog__null-type">
                <h3>{t('Export to:')}</h3>
                <Chooser />
              </div>
            ) : null}
          </div>
          <div className="export-dialog__footer">
            <hr />
            <div>
              <Switch
                isOn={saveOptions}
                handleToggle={() => setSaveOptions(!saveOptions)}
                labelText={t('Save these settings across projects?')}
              />
              <ButtonToolbar>
                <Button onClick={props.close}>{t('Cancel')}</Button>
              </ButtonToolbar>
            </div>
          </div>
        </div>
      </PlottrModal>
    )
  }

  ExportDialog.propTypes = {
    exportConfig: PropTypes.object.isRequired,
    close: PropTypes.func.isRequired,
    bookId: PropTypes.string.isRequired,
    seriesName: PropTypes.string,
    books: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    projectActions: PropTypes.object.isRequired,
  }

  const {
    redux,
    pltr: { actions, selectors },
  } = connector
  checkDependencies({ redux, actions, selectors })

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(
      (state) => {
        return {
          exportConfig: selectors.exportSettingsSelector(state.present),
          bookId: selectors.currentTimelineSelector(state.present),
          seriesName: state.present.series.name,
          books: state.present.books,
        }
      },
      (dispatch) => {
        return {
          actions: bindActionCreators(actions.ui, dispatch),
          projectActions: bindActionCreators(actions.project, dispatch),
        }
      }
    )(ExportDialog)
  }

  throw new Error('Could not connect ExportDialog')
}

export default ExportDialogConnector
