import React, { useState, useRef, useEffect } from 'react'
import PropTypes from 'react-proptypes'
import RichText from './rce/RichText'
import DeleteConfirmModal from './dialogs/DeleteConfirmModal'
import { FormControl, FormGroup, ControlLabel, Glyphicon, Button } from 'react-bootstrap'
import { actions } from 'pltr/v2'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

const CustomAttributeActions = actions.customAttributeActions

const EditAttribute = ({
  name,
  type,
  index,
  entityType,
  entity,
  ui,
  handleLongDescriptionChange,
  onShortDescriptionKeyDown,
  onShortDescriptionKeyPress,
  withRef,
  addAttribute,
  removeAttribute,
  editAttribute,
  reorderAttribute,
}) => {
  const [deleting, setDeleting] = useState(false)
  const [editing, setEditing] = useState(false)

  const editTitleRef = useRef()

  useEffect(() => {
    if (editing && editTitleRef.current) {
      editTitleRef.current.focus()
    }
  }, [editing])

  const Label = () => (
    <div className="card-dialog__custom-attributes-label">
      <input
        ref={editTitleRef}
        onChange={(event) => {
          editAttribute(index, { name, type }, { name: event.target.value, type })
        }}
        className={`custom-attr-item__input ${editing ? '' : 'custom-attr-item__input--hidden'}`}
        defaultValue={name}
        onBlur={() => {
          setEditing(false)
        }}
      />
      {!editing ? <ControlLabel>{name}</ControlLabel> : null}
      <div className="card-dialog__custom-attributes-edit-controls">
        <Button
          bsSize="small"
          onClick={() => {
            setEditing(!editing)
          }}
        >
          <Glyphicon glyph="edit" />
        </Button>
        <Button
          bsSize="small"
          onClick={() => {
            setDeleting(true)
          }}
        >
          <Glyphicon glyph="trash" />
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {deleting ? (
        <DeleteConfirmModal
          name={name}
          onDelete={() => removeAttribute(name)}
          onCancel={() => setDeleting(false)}
        />
      ) : null}
      {type === 'paragraph' ? (
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
      )}
    </>
  )
}

EditAttribute.propTypes = {
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  entityType: PropTypes.string.isRequired,
  entity: PropTypes.object.isRequired,
  ui: PropTypes.object.isRequired,
  handleLongDescriptionChange: PropTypes.func.isRequired,
  onShortDescriptionKeyDown: PropTypes.func.isRequired,
  onShortDescriptionKeyPress: PropTypes.func.isRequired,
  withRef: PropTypes.func.isRequired,
  addAttribute: PropTypes.func.isRequired,
  removeAttribute: PropTypes.func.isRequired,
  editAttribute: PropTypes.func.isRequired,
  reorderAttribute: PropTypes.func.isRequired,
}

function mapDispatchToProps(dispatch, { entityType }) {
  const actions = bindActionCreators(CustomAttributeActions, dispatch)

  switch (entityType) {
    case 'character':
      return {
        addAttribute: actions.addCharacterAttr,
        removeAttribute: actions.removeCharacterAttr,
        editAttribute: actions.editCharacterAttr,
        reorderAttribute: actions.reorderCharacterAttribute,
      }

    case 'place':
      return {
        addAttribute: actions.addPlaceAttr,
        removeAttribute: actions.removePlaceAttr,
        editAttribute: actions.editPlaceAttr,
        reorderAttribute: actions.reorderPlacesAttribute,
      }

    case 'scene':
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
