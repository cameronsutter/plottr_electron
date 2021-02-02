import { ipcRenderer, remote } from 'electron'
import React, { useRef } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import {
  Modal,
  Form,
  FormGroup,
  Col,
  ControlLabel,
  FormControl,
  ButtonToolbar,
  Button,
} from 'react-bootstrap'
import i18n from 'format-message'
import cx from 'classnames'

const win = remote.getCurrentWindow()

function TemplateCreate({ type, close, ui }) {
  const nameRef = useRef()
  const descriptionRef = useRef()
  const linkRef = useRef()

  const saveEdit = () => {
    const data = {
      name: nameRef.current.value,
      description: descriptionRef.current.value,
      link: linkRef.current.value,
    }

    ipcRenderer.sendTo(win.webContents.id, 'save-custom-template', { type: type, data })
    close()
  }

  const titleFor = (type) => {
    switch (type) {
      case 'plotlines':
        return i18n('My Timeline Template')
      case 'characters':
        return i18n('My Character Template')
      case 'scenes':
        return i18n('My Scene Template')
    }
    // This was the old default at the time of refactoring
    return i18n('My Character Template')
  }

  const renderToolBar = () => {
    return (
      <ButtonToolbar>
        <Button bsStyle="success" onClick={saveEdit}>
          {i18n('Save')}
        </Button>
        <Button onClick={close}>{i18n('Cancel')}</Button>
      </ButtonToolbar>
    )
  }

  const renderBody = () => {
    return (
      <Form horizontal>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={3}>
            {i18n('Name')}
          </Col>
          <Col sm={8}>
            <FormControl type="text" inputRef={nameRef} defaultValue={i18n('Custom Template')} />
          </Col>
        </FormGroup>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={3}>
            {i18n('Description')}
          </Col>
          <Col sm={8}>
            <FormControl type="text" inputRef={descriptionRef} defaultValue={''} />
          </Col>
        </FormGroup>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={3}>
            {i18n('Source Link')}
          </Col>
          <Col sm={8}>
            <FormControl
              type="text"
              inputRef={linkRef}
              defaultValue={''}
              placeholder="https://example.com/"
            />
          </Col>
        </FormGroup>
      </Form>
    )
  }

  const title = titleFor(type)

  return (
    <Modal
      show={true}
      onHide={close}
      dialogClassName={cx('book-dialog', { darkmode: ui.darkMode })}
    >
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{renderBody()}</Modal.Body>
      <Modal.Footer>{renderToolBar()}</Modal.Footer>
    </Modal>
  )
}

TemplateCreate.propTypes = {
  close: PropTypes.func.isRequired,
  type: PropTypes.string,
  ui: PropTypes.object.isRequired,
}

function mapStateToProps(state) {
  return {
    ui: state.present.ui,
  }
}

function mapDispatchToProps(dispatch) {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(TemplateCreate)
