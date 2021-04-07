import React, { useState } from 'react'
import PropTypes from 'react-proptypes'
import {
  Form,
  FormGroup,
  Col,
  ControlLabel,
  FormControl,
  ButtonToolbar,
  Button,
} from 'react-bootstrap'
import { t as i18n } from 'plottr_locales'
import getTestIds from '../getTestIds'

export const testIds = getTestIds()

export default function TemplateEdit({ template, saveEdit, cancel }) {
  const [name, setName] = useState(template.name)
  const [description, setDescription] = useState(template.description)
  const [link, setLink] = useState(template.link)

  const save = () => {
    const data = {
      id: template.id,
      name,
      description,
      link,
    }

    saveEdit(data)
  }

  const renderToolBar = () => {
    return (
      <ButtonToolbar>
        <Button data-testid={testIds.save} bsStyle="success" onClick={save}>
          {i18n('Save')}
        </Button>
        <Button data-testid={testIds.cancel} onClick={cancel}>
          {i18n('Cancel')}
        </Button>
      </ButtonToolbar>
    )
  }

  return (
    <Form horizontal>
      <FormGroup>
        <Col componentClass={ControlLabel} sm={4}>
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
        <Col componentClass={ControlLabel} sm={4}>
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
        <Col componentClass={ControlLabel} sm={4}>
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
      {renderToolBar()}
    </Form>
  )
}

TemplateEdit.propTypes = {
  template: PropTypes.object.isRequired,
  cancel: PropTypes.func.isRequired,
  saveEdit: PropTypes.func.isRequired,
}
