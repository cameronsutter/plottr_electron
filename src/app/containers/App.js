import { ipcRenderer } from 'electron'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'react-proptypes'
import Navigation from 'containers/Navigation'
import Body from 'containers/Body'
import Tour from '../components/intros/Tour'
import { AskToSaveModal, TemplateCreate, ErrorBoundary } from 'connected-components'
import { hasPreviousAction } from '../../common/utils/error_reporter'
import { saveFile } from '../../common/utils/files'
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
    window.addEventListener('beforeunload', this.askToSave)
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners('save-as-template-start')
    ipcRenderer.removeAllListeners('reload')
    ipcRenderer.removeAllListeners('wants-to-close')
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
    saveFile(present.file.fileName, present)
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
    return <Tour />
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
