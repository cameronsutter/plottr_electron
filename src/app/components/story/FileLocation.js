import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { NavItem, Button } from 'react-bootstrap'
import i18n from 'format-message'
import { is } from 'electron-util'
import { TEMP_FILES_PATH } from '../../../common/utils/config_paths'
import { shell, remote, ipcRenderer } from 'electron'
const win = remote.getCurrentWindow()

let showInMessage = i18n('Show in File Explorer')
if (is.macos) {
  showInMessage = i18n('Show in Finder')
}

class FileLocation extends Component {
  chooseLocation = () => {
    ipcRenderer.sendTo(win.webContents.id, 'move-from-temp')
  }

  render () {
    const { file } = this.props
    let button = <Button bsSize='small' onClick={() => shell.showItemInFolder(file.fileName)}>{showInMessage}</Button>
    if (file.fileName.includes(TEMP_FILES_PATH)) {
      button = <Button bsSize='small' onClick={this.chooseLocation} title={i18n('Choose where to save this file on your computer')}>{i18n('Save File')}</Button>
    }
    return <NavItem>
      { button }
    </NavItem>
  }

  static propTypes = {
    file: PropTypes.object.isRequired,
  }
}

function mapStateToProps (state) {
  return {
    file: state.present.file,
  }
}

function mapDispatchToProps (dispatch) {
  return {}
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FileLocation)