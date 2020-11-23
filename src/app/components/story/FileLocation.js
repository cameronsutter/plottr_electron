import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Form, FormGroup, Col, ControlLabel, Button, Glyphicon } from 'react-bootstrap'
import i18n from 'format-message'
import * as UIActions from 'actions/ui'
import { TEMP_FILES_PATH } from '../../../common/utils/config_paths'
import { shell } from 'electron'

class FileLocation extends Component {
  chooseLocation = () => {
    console.log(this.props.actions)
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