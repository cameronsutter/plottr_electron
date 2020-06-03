import { ipcRenderer } from 'electron'
import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import Navigation from 'containers/Navigation'
import Body from 'containers/Body'
import ErrorBoundary from './ErrorBoundary'
import GuidedTour from '../components/GuidedTour'
import TemplateEdit from '../../common/components/templates/TemplateEdit'

export default class App extends Component {
  state = {showTemplateCreate: false}

  componentDidMount () {
    ipcRenderer.on('save-as-template-start', () => {
      this.setState({showTemplateCreate: true})
    })
  }

  renderTemplateCreate () {
    if (!this.state.showTemplateCreate) return null

    return <TemplateEdit close={() => this.setState({showTemplateCreate: false})}/>
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
