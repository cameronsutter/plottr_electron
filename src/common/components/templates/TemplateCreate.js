import { ipcRenderer, remote } from 'electron'
import React, { useState } from 'react'
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
import getTestIds from 'test-utils/getTestIds'

export const testIds = getTestIds()

const win = remote.getCurrentWindow()

export function TemplateCreate({ type, close, ui }) {
  const [name, setName] = useState(i18n('Custom Template'))
  const [description, setDescription] = useState('')
  const [link, setLink] = useState('')

  const saveEdit = () => {
    const data = {
      name,
      description,
      link,
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
        <Button data-testid={testIds.save} bsStyle="success" onClick={saveEdit}>
          {i18n('Save')}
        </Button>
        <Button data-testid={testIds.cancel} onClick={close}>
          {i18n('Cancel')}
        </Button>
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
            <FormControl
              data-testid={testIds.name}
              type="text"
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
            />
          </Col>
        </FormGroup>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={3}>
            {i18n('Description')}
          </Col>
          <Col sm={8}>
            <FormControl
              data-testid={testIds.description}
              type="text"
              value={description}
              onChange={(e) => setDescription(e.currentTarget.value)}
            />
          </Col>
        </FormGroup>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={3}>
            {i18n('Source Link')}
          </Col>
          <Col sm={8}>
            <FormControl
              data-testid={testIds.link}
              type="text"
              value={link}
              onChange={(e) => setLink(e.currentTarget.value)}
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
        <Modal.Title data-testid={testIds.title}>{title}</Modal.Title>
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
