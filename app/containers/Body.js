import React, { Component, PropTypes } from 'react'
import fs from 'fs'
import remote from 'remote'
import TimeLineView from 'components/timeLineView'

const win = remote.getCurrentWindow()

class Body extends Component {
  componentWillMount () {
    if (!this.props.fileIsLoaded) {
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
      _this.props.fileWasLoaded(fileName, json)
    })
  }

  render () {
    return <TimeLineView fileIsLoaded={this.props.fileIsLoaded}/>
  }

}

Body.propTypes = {
  currentView: PropTypes.string.isRequired,
  fileIsLoaded: PropTypes.bool.isRequired,
  fileWasLoaded: PropTypes.func.isRequired
}

export default Body
