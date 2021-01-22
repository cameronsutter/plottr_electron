import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import RichText from './rce/RichText'
import { FormControl, FormGroup, ControlLabel } from 'react-bootstrap'

export class EditAttribute extends Component {
  render () {
    const {
      name,
      value,
      type,
      inputId,
      entity,
      ui,
      handleLongDescriptionChange,
      onShortDescriptionKeyDown,
      onShortDescriptionKeyPress,
      withRef,
    } = this.props

    return type === 'paragraph' ? (
      <div>
        <ControlLabel>{name}</ControlLabel>
        <RichText
          description={value || entity[name]}
          onChange={(desc) => handleLongDescriptionChange(name, desc)}
          editable
          autofocus={false}
          darkMode={ui.darkMode}
        />
      </div>
    ) : (
      <FormGroup>
        <ControlLabel>{name}</ControlLabel>
        <FormControl
          type="text"
          id={inputId || `${name}Input`}
          ref={withRef}
          defaultValue={value || entity[name]}
          onKeyDown={onShortDescriptionKeyDown}
          onKeyPress={onShortDescriptionKeyPress}
        />
      </FormGroup>
    )
  }

  static propTypes = {
    name: PropTypes.string.isRequired,
    // Templates have values.  Non-template attributes are values on
    // the entity object.
    value: PropTypes.string,
    type: PropTypes.string.isRequired,
    entity: PropTypes.object.isRequired,
    ui: PropTypes.object.isRequired,
    inputId: PropTypes.string,
    handleLongDescriptionChange: PropTypes.func.isRequired,
    onShortDescriptionKeyDown: PropTypes.func.isRequired,
    onShortDescriptionKeyPress: PropTypes.func.isRequired,
    withRef: PropTypes.func.isRequired,
  }
}
