import { ipcRenderer } from 'electron'
import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import Navigation from 'containers/Navigation'
import Body from 'containers/Body'
import ErrorBoundary from './ErrorBoundary'
import Tour from '../components/intros/Tour'
import TemplateCreate from '../../common/components/templates/TemplateCreate'
import AskToSaveModal from '../components/dialogs/AskToSaveModal'
import { hasPreviousAction } from '../../common/utils/error_reporter'
import { saveFile } from '../../common/utils/files'
import { store } from '../store/configureStore'
import { focusIsEditable } from '../../common/utils/undo'

let isTryingToReload = false
let isTryingToClose = false

export default class App extends Component {
  state = { showTemplateCreate: false, type: null, showAskToSave: false, blockClosing: true, showTour: true }

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
    this.setState({showTour:true})// XXXXXX 
    window.addEventListener('beforeunload', this.askToSave)
    console.log(store.getState())
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
    let feature = store.getState().present.tour.feature.name
    // XXXXXX so the tour system could be set up so that the tour only runs when a feature is loaded into the tour.feature redux state
    if(!feature) return null
    // XXXXXX does this mean that part of the the set-beat-hierarchy ipc action needs to set feature to {name: acts, id: 1}? ALSO the menu tourStart function
    console.log('FEATURE====================',feature)
    // THE BELOW LINES ARE ONLY NECESSARY IF THE IPC IN SETTINGS AND HELP MENU CAN'T LOAD A FEATURE INTO THE REDUX FOR TOUR.FEATURE
    // let toursTaken = Object.keys(store.getState().present.tour.toursTaken)
    // let tourAutoStart = toursTaken.includes(`${feature.name}`) ? false : true
    // let tourMenuStart = store.getState().present.tour.menuStart
    // XXXXXX ^this shouldn't be a redux state, probably an event sent from ipcRenderer
    if(
      store.getState().present.featureFlags.BEAT_HIERARCHY && //in the future can include a switch(feature) which if case('acts') this would set tourConditions = true --- if tourConditions true then the tour will run
      feature
    ) return <Tour />
    return null
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
        {this.state.showTour && this.renderGuidedTour()}
      </ErrorBoundary>
    )
  }
}

App.propTypes = {
  showTour: PropTypes.bool,
}