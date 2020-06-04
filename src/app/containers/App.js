import { ipcRenderer } from 'electron'
import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import Navigation from 'containers/Navigation'
import Body from 'containers/Body'
import ErrorBoundary from './ErrorBoundary'
import GuidedTour from '../components/GuidedTour'
import TemplateCreate from '../../common/components/templates/TemplateCreate'

export default class App extends Component {
  state = {showTemplateCreate: false, type: null}

  componentDidMount () {
    ipcRenderer.on('save-as-template-start', (event, type) => {
      this.setState({showTemplateCreate: true, type: type})
    })
  }

  renderTemplateCreate () {
    if (!this.state.showTemplateCreate) return null

    return <TemplateCreate type={this.state.type} close={() => this.setState({showTemplateCreate: false})}/>
  }

  renderGuidedTour () {
    if (!this.props.showTour) return null
    return <GuidedTour />
  }

  render () {
    return <ErrorBoundary>
      <Navigation />
      <Body />
      { this.renderTemplateCreate() }
      { this.renderGuidedTour() }
    </ErrorBoundary>
  }
}
