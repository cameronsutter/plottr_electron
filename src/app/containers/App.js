import { ipcRenderer } from 'electron'
import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import i18n from 'format-message'
import Navigation from 'containers/Navigation'
import Body from 'containers/Body'
import ErrorBoundary from './ErrorBoundary'
import GuidedTour from '../components/GuidedTour'
import TemplateCreate from '../../common/components/templates/TemplateCreate'
import { focusIsEditable } from '../helpers/undo'
import AskToSaveModal from '../components/dialogs/AskToSaveModal'
import { getLastAction } from '../../common/utils/error_reporter'

export default class App extends Component {
  state = {showTemplateCreate: false, type: null, showAskToSave: false, blockClose: true}

  componentDidMount () {
    ipcRenderer.on('save-as-template-start', (event, type) => {
      this.setState({showTemplateCreate: true, type: type})
    })
    window.addEventListener('beforeunload', this.askToSave)
  }

  componentWillUnmount () {
    window.removeEventListener('beforeunload', this.askToSave)
  }

  askToSave = (event) => {
    // console.log(event.currentTarget.performance.navigation)
    if (!this.state.blockClose) return
    if (process.env.NODE_ENV == 'development') return

    if (focusIsEditable()) {
      // TODO: make this work to save people from closing when they are still editing something

      // event.returnValue = 'nope'
      // alert(i18n('Save the work in the open text editor before closing'))
    }
    if (!getLastAction()) return

    // TODO: need to reliably distinguish reloads from closing (or not allow reloads) (or handle reloads myself)
    // event.returnValue = 'nope'
    // this.setState({showAskToSave: true})
  }

  dontSaveAndClose = () => {
    this.setState({showAskToSave: false, blockClose: false})
    // this.setState({showAskToSave: false})
    this.closeOrRefresh()
  }

  saveAndClose = () => {
    this.setState({showAskToSave: false, blockClose: false})
    // this.setState({showAskToSave: false})
    // TODO: Save
    console.log('SAVING … not really')
    this.closeOrRefresh()
  }

  closeOrRefresh = () => {
    let entries = performance.getEntriesByType('navigation')
    if (entries.some(entry => entry.type == 'reload')) {
      location.reload()
      console.log('reloading', entries.map(e => e.type), performance.navigation.type)
    } else {
      window.close()
      console.log('closing', entries.map(e => e.type), performance.navigation.type)
    }
  }

  renderTemplateCreate () {
    if (!this.state.showTemplateCreate) return null

    return <TemplateCreate type={this.state.type} close={() => this.setState({showTemplateCreate: false})}/>
  }

  renderAskToSave () {
    if (!this.state.showAskToSave) return null

    return <AskToSaveModal dontSave={this.dontSaveAndClose} save={this.saveAndClose} cancel={() => this.setState({showAskToSave: false})}/>
  }

  renderGuidedTour () {
    if (!this.props.showTour) return null
    return <GuidedTour />
  }

  render () {
    return <ErrorBoundary>
      <ErrorBoundary>
        <Navigation />
      </ErrorBoundary>
      <Body />
      { this.renderTemplateCreate() }
      { this.renderAskToSave() }
    </ErrorBoundary>
  }
}
