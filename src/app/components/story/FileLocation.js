import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { OverlayTrigger, NavItem, Button, Popover } from 'react-bootstrap'
import i18n from 'format-message'
import { is } from 'electron-util'
import * as UIActions from 'actions/ui'
import { TEMP_FILES_PATH } from '../../../common/utils/config_paths'
import { shell, remote, ipcRenderer } from 'electron'
import { removeFromTempFiles } from '../../../common/utils/temp_files'
import { displayFileName, editKnownFilePath } from '../../../common/utils/known_files'
const { dialog } = remote
const win = remote.getCurrentWindow()

let showInMessage = i18n('Show File in File Explorer')
if (is.macos) {
  showInMessage = i18n('Show File in Finder')
}

class FileLocation extends Component {
  chooseLocation = () => {
    const { file, actions } = this.props
    const filters = [{name: 'Plottr file', extensions: ['pltr']}]
    const newFilePath = dialog.showSaveDialogSync(win, {filters: filters, title: i18n('Where would you like to save this file?')})
    if (newFilePath) {
      // change in redux
      actions.editFileName(newFilePath)
      // remove from tmp store
      removeFromTempFiles(file.fileName)
      // update in known files
      editKnownFilePath(file.fileName, newFilePath)
      // change the window's title
      win.setRepresentedFilename(newFilePath)
      win.setTitle(displayFileName(newFilePath))
      // send event to dashboard
      ipcRenderer.send('pls-tell-dashboard-to-reload-recents')
    }
  }

  render () {
    const { file } = this.props
    let button = <Button bsSize='small' onClick={() => shell.showItemInFolder(file.fileName)}>{showInMessage}</Button>
    if (file.fileName.includes(TEMP_FILES_PATH)) {
      button = <Button bsSize='small' onClick={this.chooseLocation} title={i18n('Choose where to save this file on your computer')}>{i18n('Choose a Location')}</Button>
    }
    return <NavItem>
      { button }
    </NavItem>
  }

  static propTypes = {
    file: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
  }
}

function mapStateToProps (state) {
  return {
    file: state.present.file,
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
)(FileLocation)