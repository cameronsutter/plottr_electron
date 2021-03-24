import React, { useState } from 'react'
import PropTypes from 'react-proptypes'
import { remote } from 'electron'
import { connect } from 'react-redux'
import { t } from 'plottr_locales'
import { PlottrModal } from '../PlottrModal'
import { Button, ButtonToolbar, Glyphicon, Nav, NavItem } from 'react-bootstrap'
import ExportBody from './ExportBody'
import Switch from '../../../common/components/Switch'
import { useExportConfigInfo } from '../../../common/utils/store_hooks'
import log from 'electron-log'
import askToExport from '../../../common/exporter/start_export'

const { dialog } = remote

function ExportDialog(props) {
  const [exportConfig, _, saveExportConfig] = useExportConfigInfo()
  const [type, setType] = useState(exportConfig.savedType || 'word')
  const [saveOptions, setSaveOptions] = useState(exportConfig.saveSettings)
  const [options, setOptions] = useState(exportConfig)

  const updateOptions = (newValues) => {
    const newOptions = { ...options }
    newOptions[type] = newValues
    setOptions(newOptions)
  }

  const doExport = () => {
    const { ui, seriesName, books, fullState } = props
    const bookId = ui.currentTimeline
    const defaultPath =
      bookId == 'series' ? seriesName + ' ' + t('(Series View)') : books[`${bookId}`].title

    askToExport(defaultPath, fullState, type, options[type], (error, success) => {
      if (saveOptions) {
        saveExportConfig('savedType', type)
        saveExportConfig(type, options[type])
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
      <Nav bsStyle="pills" activeKey={type} onSelect={(key) => setType(key)}>
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
    <PlottrModal isOpen={true} onRequestClose={props.close}>
      <div className="export-dialog__wrapper">
        <div className="export-dialog__header">
          <div className="export-dialog__type-chooser">
            <h3>{t('Export Options')}</h3>
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
          <ExportBody type={type} setType={setType} onChange={updateOptions} />
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
}))(ExportDialog)
