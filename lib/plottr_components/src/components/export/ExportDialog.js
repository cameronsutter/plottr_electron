import React, { useState } from 'react'
import PropTypes from 'react-proptypes'
import { t } from 'plottr_locales'
import { Button, ButtonToolbar, Glyphicon, Nav, NavItem } from 'react-bootstrap'
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
      store: { useExportConfigInfo },
      export: { askToExport },
      isWindows,
    },
  } = connector
  checkDependencies({ log, dialog, useExportConfigInfo, askToExport, isWindows })

  function ExportDialog(props) {
    const [exportConfig, _, saveExportConfig] = useExportConfigInfo()
    const [saveOptions, setSaveOptions] = useState(exportConfig.saveSettings)
    const [options, setOptions] = useState(exportConfig)
    const type = exportConfig.savedType
    const setType = (type) => saveExportConfig('savedType', type)

    const updateOptions = (newValues) => {
      const newOptions = { ...options, [type]: newValues }
      setOptions(newOptions)
    }

    const doExport = () => {
      const { bookId, seriesName, books, fullState } = props
      const defaultPath =
        bookId == 'series' ? seriesName + ' ' + t('(Series View)') : books[`${bookId}`].title

      askToExport(defaultPath, fullState, type, options[type], isWindows, (error, success) => {
        if (saveOptions) {
          saveExportConfig('savedType', type)
          // We don't want to maintain the filter across projects
          // because they have different plot lines and different
          // numbers of plot lines.
          saveExportConfig(type, {
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
    close: PropTypes.func,
    bookId: PropTypes.string.isRequired,
    seriesName: PropTypes.string,
    books: PropTypes.object,
    fullState: PropTypes.object,
    actions: PropTypes.object,
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
          bookId: selectors.currentTimelineSelector(state.present),
          seriesName: state.present.series.name,
          books: state.present.books,
          fullState: state.present,
        }
      },
      (dispatch) => {
        return {
          actions: bindActionCreators(actions.ui, dispatch),
        }
      }
    )(ExportDialog)
  }

  throw new Error('Could not connect ExportDialog')
}

export default ExportDialogConnector
