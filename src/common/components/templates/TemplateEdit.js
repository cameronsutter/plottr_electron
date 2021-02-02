import React, { useRef } from 'react'
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
import i18n from 'format-message'

export default function TemplateEdit({ template, saveEdit, cancel }) {
  const nameRef = useRef()
  const linkRef = useRef()
  const descriptionRef = useRef()

  const save = () => {
    const data = {
      id: template.id,
      name: nameRef.current.value,
      description: descriptionRef.current.value,
      link: linkRef.current.value,
    }

    saveEdit(data)
  }

  const renderToolBar = () => {
    return (
      <ButtonToolbar>
        <Button bsStyle="success" onClick={save}>
          {i18n('Save')}
        </Button>
        <Button onClick={cancel}>{i18n('Cancel')}</Button>
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
          <FormControl type="text" inputRef={nameRef} defaultValue={template.name} />
        </Col>
      </FormGroup>
      <FormGroup>
        <Col componentClass={ControlLabel} sm={4}>
          {i18n('Description')}
        </Col>
        <Col sm={8}>
          <FormControl type="text" inputRef={descriptionRef} defaultValue={template.description} />
        </Col>
      </FormGroup>
      <FormGroup>
        <Col componentClass={ControlLabel} sm={4}>
          {i18n('Source Link')}
        </Col>
        <Col sm={8}>
          <FormControl
            type="text"
            inputRef={linkRef}
            defaultValue={template.link}
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
  darkMode: PropTypes.bool,
}
