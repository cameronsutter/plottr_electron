import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import RichText from './rce/RichText'
import { FormControl, FormGroup, ControlLabel } from 'react-bootstrap'

export class EditAttribute extends Component {
  render () {
    const {
      name,
      type,
      idx,
      entity,
      ui,
      handleLongDescriptionChange,
      onShortDescriptionKeyDown,
      onShortDescriptionKeyPress,
      withRef
    } = this.props

    return type === 'paragraph' ? (
      <div key={idx}>
        <ControlLabel>{name}</ControlLabel>
        <RichText
          description={entity[name]}
          onChange={(desc) => handleLongDescriptionChange(name, desc)}
          editable
          autofocus={false}
          darkMode={ui.darkMode}
        />
      </div>
    ) : (
      <FormGroup key={idx}>
        <ControlLabel>{name}</ControlLabel>
        <FormControl
          type='text'
          id={`${name}Input`}
          ref={withRef}
          defaultValue={entity[name]}
          onKeyDown={onShortDescriptionKeyDown}
          onKeyPress={onShortDescriptionKeyPress} />
      </FormGroup>
    )
  }

  static propTypes = {
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    idx: PropTypes.number.isRequired,
    entity: PropTypes.object.isRequired,
    ui: PropTypes.object.isRequired,
    handleLongDescriptionChange: PropTypes.func.isRequired,
    onShortDescriptionKeyDown: PropTypes.func.isRequired,
    onShortDescriptionKeyPress: PropTypes.func.isRequired,
    withRef: PropTypes.func.isRequired
  }
}
