import React, { useState } from 'react'
import PropTypes from 'react-proptypes'
import { Modal, Form, Col, ButtonToolbar } from 'react-bootstrap'
import cx from 'classnames'

import { t as i18n } from 'plottr_locales'

import ControlLabel from '../ControlLabel'
import FormGroup from '../FormGroup'
import FormControl from '../FormControl'
import getTestIds from '../getTestIds'
import Button from '../Button'
import { checkDependencies } from '../checkDependencies'

export const testIds = getTestIds()

const TemplateCreateConnector = (connector) => {
  const TemplateCreate = ({ type, close, darkMode, saveTemplate }) => {
    const [name, setName] = useState(i18n('Custom Template'))
    const [description, setDescription] = useState('')
    const [link, setLink] = useState('')

    const saveEdit = () => {
      const data = {
        name,
        description,
        link,
      }

      saveTemplate({ type, data })
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
      <Modal show={true} onHide={close} dialogClassName={cx('book-dialog', { darkmode: darkMode })}>
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
    saveTemplate: PropTypes.func.isRequired,
    type: PropTypes.string,
    darkMode: PropTypes.bool,
  }

  const {
    redux,
    pltr: { selectors },
  } = connector
  checkDependencies({ redux, selectors })

  if (redux) {
    const { connect } = redux

    return connect((state) => {
      return {
        darkMode: selectors.isDarkModeSelector(state.present),
        saveTemplate: connector.platform.template.saveTemplate,
      }
    })(TemplateCreate)
  }

  throw new Error('Cannot connect TemplateCreate.js')
}

export default TemplateCreateConnector
