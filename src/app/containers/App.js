import { ipcRenderer } from 'electron'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'react-proptypes'
import Navigation from 'containers/Navigation'
import Body from 'containers/Body'
import ActsTour from '../components/intros/Tour'
import { AskToSaveModal, TemplateCreate, ErrorBoundary, ExportDialog } from 'connected-components'
import { hasPreviousAction } from '../../common/utils/error_reporter'
import { store } from '../store/configureStore'
import { focusIsEditable } from '../../common/utils/undo'
import { showTourSelector } from 'pltr/v2/selectors/tours'

let isTryingToReload = false
let isTryingToClose = false

class App extends Component {
  state = {
    showTemplateCreate: false,
    type: null,
    showAskToSave: false,
    blockClosing: true,
    showExportDialog: false,
  }

  componentDidMount() {
    ipcRenderer.on('save-as-template-start', (event, type) => {
      this.setState({ showTemplateCreate: true, type: type })
    })
    ipcRenderer.on('reload', () => {
      isTryingToReload = true
      this.askToSave({})
    })
    ipcRenderer.on('wants-to-close', () => {
      isTryingToClose = true
      this.askToSave({})
    })
    ipcRenderer.on('reload', () => {
      isTryingToReload = true
      this.askToSave({})
    })
    ipcRenderer.on('advanced-export-file-from-menu', (event) => {
      this.setState({ showExportDialog: true })
    })
    ipcRenderer.send('initial-mount-complete')
    window.addEventListener('beforeunload', this.askToSave)
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners('save-as-template-start')
    ipcRenderer.removeAllListeners('reload')
    ipcRenderer.removeAllListeners('wants-to-close')
    ipcRenderer.removeAllListeners('advanced-export-file-from-menu')
    window.removeEventListener('beforeunload', this.askToSave)
  }

  askToSave = (event) => {
    if (!this.state.blockClosing) return
    if (process.env.NODE_ENV == 'development') {
      return this.closeOrRefresh(isTryingToClose)
    }

    if (focusIsEditable()) {
      // TODO: make this work to save people from closing when they are still editing something
      // event.returnValue = 'nope'
      // alert(i18n('Save the work in the open text editor before closing'))
    }
    // no actions yet? doesn't need to save
    if (!hasPreviousAction()) {
      this.setState({ blockClosing: false })
      return this.closeOrRefresh(isTryingToClose)
    }

    event.returnValue = 'nope'
    this.setState({ showAskToSave: true })
  }

  dontSaveAndClose = () => {
    this.setState({ showAskToSave: false, blockClosing: false })
    this.closeOrRefresh(true)
  }

  saveAndClose = () => {
    this.setState({ showAskToSave: false, blockClosing: false })
    const { present } = store.getState()
    ipcRenderer.send('save-file', present.file.fileName, present)
    this.closeOrRefresh(true)
  }

  closeOrRefresh = (shouldClose) => {
    if (isTryingToReload) {
      location.reload()
    } else {
      if (shouldClose) window.close()
    }
  }

  renderTemplateCreate() {
    if (!this.state.showTemplateCreate) return null

    return (
      <TemplateCreate
        type={this.state.type}
        close={() => this.setState({ showTemplateCreate: false })}
      />
    )
  }

  renderAskToSave() {
    if (!this.state.showAskToSave) return null

    return (
      <AskToSaveModal
        dontSave={this.dontSaveAndClose}
        save={this.saveAndClose}
        cancel={() => this.setState({ showAskToSave: false })}
      />
    )
  }

  renderGuidedTour() {
    let feature = store.getState().present.tour.feature.name
    if (!feature) return null
    if (
      store.getState().present.featureFlags.BEAT_HIERARCHY && //in the future can include a switch(feature) which if case('acts') -> tourConditions = true --- if tourConditions true then the tour will run
      feature
    )
      return <ActsTour />
    return null
  }

  renderAdvanceExportModal() {
    if (!this.state.showExportDialog) return null
    return <ExportDialog close={() => this.setState({ showExportDialog: false })} />
  }

  render() {
    return (
      <ErrorBoundary>
        <ErrorBoundary>
          <Navigation />
        </ErrorBoundary>
        <main className="project-main tour-end">
          <Body />
        </main>
        {this.renderTemplateCreate()}
        {this.renderAskToSave()}
        {this.props.showTour && this.renderGuidedTour()}
        {this.renderAdvanceExportModal()}
      </ErrorBoundary>
    )
  }
}

App.propTypes = {
  showTour: PropTypes.bool,
}

function mapStateToProps(state) {
  return { showTour: showTourSelector(state.present) }
}

export default connect(mapStateToProps, null)(App)
