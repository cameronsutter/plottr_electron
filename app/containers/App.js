import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { getFileNameFromLocalStorage, readJSON, saveToLocalStorage } from 'store/localStorage'
import Navigation from 'containers/Navigation'
import Body from 'containers/Body'
import * as UIActions from 'actions/ui'
import remote from 'remote'
const win = remote.getCurrentWindow()

class App extends Component {
  componentWillMount () {
    if (!this.props.file.loaded) {
      const fileName = getFileNameFromLocalStorage()
      if (fileName) {
        readJSON(fileName, this.props.actions.loadFile, () => {
          saveToLocalStorage('')
        })
      } else {
        const _this = this
        var dialog = remote.require('dialog')

        dialog.showMessageBox(win, {type: 'question', buttons: ['open', 'new'], message: 'Would you like to open an existing file or start a new file?'}, (choice) => {
          if (choice === 0) {
            // open file
            var properties = [ 'openFile', 'openDirectory', 'createDirectory' ]
            dialog.showOpenDialog(win, { properties: properties }, (chosenFileName) => {
              readJSON(chosenFileName[0], _this.props.actions.loadFile)
            })
          } else {
            // start a new file
            dialog.showSaveDialog({title: 'Where would you like to start your new file?'}, function (fileName) {
              if (fileName) {
                _this.props.actions.newFile(fileName + '.plottr')
              }
            })
          }
        })
      }
    }
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
  file: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired
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
