import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Navigation from '../containers/Navigation'
import Body from '../containers/Body'
import * as UIActions from '../actions/ui'

class App extends Component {
  render () {
    const { storyName, file, ui, actions } = this.props
    return (
      <div>
        <Navigation storyName={storyName} currentView={ui.currentView} changeView={actions.changeCurrentView} />
        <Body currentView={ui.currentView} fileIsLoaded={file.loaded} fileWasLoaded={actions.loadFile} />
      </div>
    )
  }
}

App.propTypes = {
  storyName: PropTypes.string.isRequired,
  file: PropTypes.object.isRequired,
  ui: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired
}

function mapStateToProps (state) {
  return {
    storyName: state.storyName,
    file: state.file,
    ui: state.ui
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(UIActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App)
