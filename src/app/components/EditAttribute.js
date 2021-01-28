import React, { useState } from 'react'
import PropTypes from 'react-proptypes'
import RichText from './rce/RichText'
import { FormControl, FormGroup, ControlLabel, Glyphicon, Button } from 'react-bootstrap'
import { actions } from 'pltr/v2'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

const CustomAttributeActions = actions.customAttributeActions

const EditAttribute = ({
  name,
  type,
  entityType,
  entity,
  ui,
  handleLongDescriptionChange,
  onShortDescriptionKeyDown,
  onShortDescriptionKeyPress,
  withRef,
}) => {
  const Label = () => (
    <div className="card-dialog__custom-attributes-label">
      <ControlLabel>{name}</ControlLabel>
      <div className="card-dialog__custom-attributes-edit-controls">
        <Button bsSize="small" onClick={() => {}}>
          <Glyphicon glyph="edit" />
        </Button>
        <Button bsSize="small" onClick={() => {}}>
          <Glyphicon glyph="trash" />
        </Button>
      </div>
    </div>
  )

  return type === 'paragraph' ? (
    <div>
      <Label />
      <RichText
        description={entity[name]}
        onChange={(desc) => handleLongDescriptionChange(name, desc)}
        editable
        autofocus={false}
        darkMode={ui.darkMode}
      />
    </div>
  ) : (
    <FormGroup>
      <Label />
      <FormControl
        type="text"
        id={`${name}Input`}
        ref={withRef}
        defaultValue={entity[name]}
        onKeyDown={onShortDescriptionKeyDown}
        onKeyPress={onShortDescriptionKeyPress}
      />
    </FormGroup>
  )
}

EditAttribute.propTypes = {
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  entityType: PropTypes.string.isRequired,
  entity: PropTypes.object.isRequired,
  ui: PropTypes.object.isRequired,
  handleLongDescriptionChange: PropTypes.func.isRequired,
  onShortDescriptionKeyDown: PropTypes.func.isRequired,
  onShortDescriptionKeyPress: PropTypes.func.isRequired,
  withRef: PropTypes.func.isRequired,
}

function mapDispatchToProps(dispatch, { entityType }) {
  const actions = bindActionCreators(CustomAttributeActions, dispatch)

  switch (entityType) {
    case 'characters':
      return {
        addAttribute: actions.addCharacterAttr,
        removeAttribute: actions.removeCharacterAttr,
        editAttribute: actions.editCharacterAttr,
        reorderAttribute: actions.reorderCharacterAttribute,
      }

    case 'places':
      return {
        addAttribute: actions.addPlaceAttr,
        removeAttribute: actions.removePlaceAttr,
        editAttribute: actions.editPlaceAttr,
        reorderAttribute: actions.reorderPlacesAttribute,
      }

    case 'scenes':
      return {
        addAttribute: actions.addSceneAttr,
        removeAttribute: actions.removeSceneAttr,
        editAttribute: actions.editSceneAttr,
        reorderAttribute: actions.reorderSceneAttribute,
      }

    default:
      console.warn(`${entityType} actions not implemented`)
      return {
        addAttribute: () => {},
        removeAttribute: () => {},
        editAttribute: () => {},
        reorderAttribute: () => {},
      }
  }
  return {
    ...bindActionCreators(CustomAttributeActions, dispatch),
  }
}

export default connect(null, mapDispatchToProps)(EditAttribute)
