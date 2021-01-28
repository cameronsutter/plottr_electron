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
  value,
  index,
  entityType,
  entity,
  ui,
  handleLongDescriptionChange,
  handleShortDescriptionChange,
  onShortDescriptionKeyDown,
  onShortDescriptionKeyPress,
  addAttribute,
  removeAttribute,
  editAttribute,
  reorderAttribute,
}) => {
  const [deleting, setDeleting] = useState(false)
  const [editing, setEditing] = useState(false)

  const editTitleRef = useRef()

  useEffect(() => {
    if (editTitleRef.current) {
      if (editing) {
        editTitleRef.current.focus()
        editTitleRef.current.classList.add(
          'card-dialog__custom-attributes-editable-label--with-underline'
        )
      } else {
        editTitleRef.current.classList.remove(
          'card-dialog__custom-attributes-editable-label--with-underline'
        )
      }
    }
  }, [editing])

  const saveEdits = (newName) => {
    editAttribute(index, { name, type }, { name: newName, type })
    setEditing(false)
  }

  const Label = () => (
    <div className="card-dialog__custom-attributes-label">
      <input
        ref={editTitleRef}
        className={`card-dialog__custom-attributes-editable-label ${
          editing ? '' : 'custom-attr-item__input--hidden'
        }`}
        defaultValue={name}
        onBlur={(event) => {
          saveEdits(event.target.value)
        }}
        onKeyDown={(event) => {
          if (event.which === 13) {
            saveEdits(event.target.value)
          }
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
            value={value}
            type="text"
            id={`${name}Input`}
            defaultValue={entity[name]}
            onKeyDown={onShortDescriptionKeyDown}
            onKeyPress={onShortDescriptionKeyPress}
            onChange={(event) => handleShortDescriptionChange(name, event.target.value)}
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
  value: PropTypes.string.isRequired,
  entityType: PropTypes.string.isRequired,
  entity: PropTypes.object.isRequired,
  ui: PropTypes.object.isRequired,
  handleLongDescriptionChange: PropTypes.func.isRequired,
  handleShortDescriptionChange: PropTypes.func.isRequired,
  onShortDescriptionKeyDown: PropTypes.func.isRequired,
  onShortDescriptionKeyPress: PropTypes.func.isRequired,
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
        reorderAttribute: actions.reorderScenesAttribute,
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
