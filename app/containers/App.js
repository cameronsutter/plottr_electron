import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Navigation from '../containers/Navigation'
import Body from '../containers/Body'
import * as UIActions from '../actions/ui'
import fs from 'fs'
import remote from 'remote'
const win = remote.getCurrentWindow()

class App extends Component {
  componentWillMount () {
    if (!this.props.file.loaded) {
      const fileName = this.getFileNameFromLocalStorage()
      if (fileName) {
        this.readJSON(fileName)
      } else {
        const _this = this
        var dialog = remote.require('dialog')
        dialog.showOpenDialog(win, { properties: [ 'openFile', 'openDirectory', 'createDirectory' ] }, (chosenFileName) => {
          _this.readJSON(chosenFileName[0])
        })
      }
    }
  }

  getFileNameFromLocalStorage () {
    return window.localStorage.getItem('recentFileName') || null
  }

  readJSON (fileName) {
    var json = ''
    const _this = this
    fs.readFile(fileName, 'utf-8', (err, data) => {
      if (err) throw err
      json = JSON.parse(data)
      _this.props.actions.loadFile(fileName, json)
    })
  }

  render () {
    return (
      <div>
        <Navigation />
        <Body />
      </div>
    )
  }
}

App.propTypes = {
  file: PropTypes.object.isRequired
}

function mapStateToProps (state) {
  return {
    file: state.file
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
