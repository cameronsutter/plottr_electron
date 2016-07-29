import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { getFileNameFromLocalStorage, readJSON } from 'store/localStorage'
import Navigation from 'containers/Navigation'
import Body from 'containers/Body'
import * as UIActions from 'actions/ui'
import Migrator from 'migrator/migrator'
import fs from 'fs'
import { remote } from 'electron'
const { app, dialog } = remote
const win = remote.getCurrentWindow()

class App extends Component {
  componentWillMount () {
    if (!this.props.file.loaded) {
      const fileName = getFileNameFromLocalStorage()
      if (fileName) {
        readJSON(fileName, (fileName, json) => {
          this.migrateIfNeeded(json, fileName, this.props.actions.loadFile)
        })
      } else {
        const _this = this
        var dialog = remote.require('dialog')

        dialog.showMessageBox(win, {type: 'question', buttons: ['open', 'new'], message: 'Would you like to open an existing file or start a new file?'}, (choice) => {
          if (choice === 0) {
            // open file
            var properties = [ 'openFile', 'createDirectory' ]
            dialog.showOpenDialog(win, { properties: properties }, (chosenFileName) => {
              readJSON(chosenFileName[0], (fileName, json) => {
                _this.migrateIfNeeded(json, fileName, _this.props.actions.loadFile)
              })
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

  migrateIfNeeded (json, fileName, loadFileAction) {
    var m = new Migrator(json, json.file.version, app.getVersion())
    if (m.areSameVersion()) {
      loadFileAction(fileName, json)
    } else {
      // not the same version, start migration process
      if (m.plottrBehindFile()) {
        dialog.showErrorBox('Update Plottr', 'It looks like your file was saved with a newer version of Plottr than you\'re using now. That could cause problems. Try updating Plottr and starting it again.')
      } else {
        // ask user to try to migrate
        dialog.showMessageBox(win, {type: 'question', buttons: ['yes, update the file', 'no, open the file as-is'], defaultId: 0, message: 'It looks like you have an older file version. This could make things work funky or not at all. May Plottr update it for you?', detail: '(It will save a backup first which will be saved to the same folder as this file)'}, (choice) => {
          if (choice === 0) {
            m.migrate((err, json) => {
              if (err === 'backup') {
                dialog.showErrorBox('Problem saving backup', 'Plottr couldn\'t save a backup. It hasn\'t touched your file yet, so don\'t worry. Try quitting Plottr and starting it again.')
              } else {
                // save the new updated file
                fs.writeFile(fileName, JSON.stringify(json, null, 2), (err) => {
                  if (err) {
                    dialog.showErrorBox('Problem saving updated file', 'Plottr updated your file, but couldn\'t save it for some reason. Your old file is still intact though. Try quitting Plottr and starting it again.')
                  } else {
                    // tell the user that Plottr migrated versions and saved a backup file
                    dialog.showMessageBox(win, {type: 'info', buttons: ['ok'], message: 'Plottr updated your file without a problem'})
                    loadFileAction(fileName, json)
                  }
                })
              }
            })
          } else {
            // open file without migrating
            fs.writeFile(`${fileName}.backup`, JSON.stringify(json, null, 2), (err) => {
              if (err) {
                dialog.showErrorBox('Problem saving backup', 'Plottr tried saving a backup just in case, but it didn\'t work. Try quitting Plottr and starting it again.')
              } else {
                dialog.showMessageBox(win, {type: 'info', buttons: ['ok'], message: 'Plottr saved a backup just in case and now on with the show (To use the backup, remove \'.backup\' from the file name)'})
                loadFileAction(fileName, json)
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
