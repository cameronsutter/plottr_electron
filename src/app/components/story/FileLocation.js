import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Form, FormGroup, Col, ControlLabel, Button, Glyphicon } from 'react-bootstrap'
import i18n from 'format-message'
import * as UIActions from 'actions/ui'
import { TEMP_FILES_PATH } from '../../../common/utils/config_paths'
import { shell, remote, ipcRenderer } from 'electron'
import { removeFromTempFiles } from '../../../common/utils/temp_files'
import { displayFileName, editKnownFilePath } from '../../../common/utils/known_files'
const { dialog } = remote
const win = remote.getCurrentWindow()

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
    let filePath = file.fileName
    let location = <ControlLabel className='edit-book__location-link'>{filePath}<Button bsStyle='link' bsSize='xs' onClick={() => shell.showItemInFolder(filePath)}><Glyphicon glyph='new-window'/></Button></ControlLabel>
    if (file.fileName.includes(TEMP_FILES_PATH)) {
      location = <div className='edit-book__location'>
        <Button onClick={this.chooseLocation}>{i18n('Choose')}</Button>
        <span>{i18n('(Choose where to save this file on your computer)')}</span>
      </div>
    }
    return <div className='edit-book__container'>
      <h2>{i18n('File')}</h2>
      <Form horizontal>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={1}>
            {i18n('Location')}
          </Col>
          <Col sm={8}>
            { location }
          </Col>
        </FormGroup>
      </Form>
    </div>
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