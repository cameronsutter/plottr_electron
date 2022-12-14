import React, { useState, useRef, useEffect, useMemo } from 'react'
import PropTypes from 'react-proptypes'
import cx from 'classnames'
import { isEqual } from 'lodash'

import RichTextConnector from './rce/RichText'
import DeleteConfirmModal from './dialogs/DeleteConfirmModal'
import Glyphicon from './Glyphicon'
import ControlLabel from './ControlLabel'
import FormGroup from './FormGroup'
import FormControl from './FormControl'
import Button from './Button'
import { checkDependencies } from './checkDependencies'

const areEqual = (prevProps, nextProps) => {
  if (prevProps.entity !== nextProps.entity && isEqual(prevProps.entity, nextProps.entity)) {
    return (
      prevProps.index === nextProps.index &&
      prevProps.entityType === nextProps.entityType &&
      prevProps.value === nextProps.value &&
      prevProps.editorPath === nextProps.editorPath &&
      prevProps.name === nextProps.name &&
      prevProps.id === nextProps.id &&
      prevProps.type === nextProps.type
    )
  }

  for (const key of Object.keys(prevProps)) {
    if (prevProps[key] !== nextProps[key]) {
      return false
    }
  }
  return true
}

const EditAttributeConnector = (connector) => {
  const RichText = RichTextConnector(connector)

  const {
    platform: { undo, redo, log, openExternal },
  } = connector

  checkDependencies({ undo, redo, log })

  const EditAttribute = ({
    entityType,
    templateAttribute,
    name,
    id,
    type,
    description,
    link,
    inputId,
    value,
    index,
    darkMode,
    selection,
    onChange,
    onSave,
    onSaveAndClose,
    addAttribute,
    removeAttribute,
    editAttribute,
    reorderAttribute,
    editorPath,
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
      if (!newName) {
        setEditing(false)
        return false
      }
      editAttribute(index, { id, name, type }, { id, name: newName, type })
      setEditing(false)
    }

    const Label = () => (
      <div className="card-dialog__custom-attributes-label">
        <input
          ref={editTitleRef}
          className={cx(
            `card-dialog__custom-attributes-editable-label ${
              editing ? '' : 'custom-attr-item__input--hidden'
            }`,
            { darkmode: darkMode }
          )}
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
        {!templateAttribute ? (
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
        ) : null}
      </div>
    )

    const Description = () => {
      if (editing) return null
      if (!description) return null

      let anchor = null
      if (link) {
        anchor = (
          <a className="template-picker__link dark" title={link} onClick={() => openExternal(link)}>
            <Glyphicon glyph="link" />
          </a>
        )
      }

      return (
        <p className="template-attr__description-label">
          {description}
          {anchor}
        </p>
      )
    }

    const onShortDescriptionKeyPress = useMemo(
      () => (event) => {
        if (event.which === 13) {
          if (onSaveAndClose) {
            onSaveAndClose()
            return
          }
          onSave()
        }
      },
      [onSaveAndClose, onSave]
    )

    const onShortDescriptionKeyDown = useMemo(
      () => (event) => {
        if (event.which === 27) {
          onSave()
          return
        }
        if (event.key === 'z' && (event.ctrlKey || event.metaKey)) {
          event.preventDefault()
          if (event.shiftKey) {
            redo()
          } else {
            undo()
          }
          return
        }
        // On Linux, redo is CTRL+y
        if (event.key === 'y' && event.ctrlKey) {
          event.preventDefault()
          redo()
          return
        }
      },
      [onSave]
    )

    return (
      <>
        {deleting ? (
          <DeleteConfirmModal
            name={name}
            onDelete={() => removeAttribute(name, id)}
            onCancel={() => setDeleting(false)}
          />
        ) : null}
        {type === 'paragraph' ? (
          <div className="card-dialog__custom-attributes__wrapper">
            <Label />
            <Description />
            <RichText
              id={editorPath}
              description={value || []}
              onChange={onChange}
              selection={selection}
              editable
              autofocus={false}
            />
          </div>
        ) : (
          <FormGroup>
            <Label />
            <Description />
            <FormControl
              value={value || ''}
              type="text"
              id={inputId || `${name}Input`}
              onKeyDown={onShortDescriptionKeyDown}
              onKeyPress={onShortDescriptionKeyPress}
              onChange={(event) => onChange(event.target.value)}
            />
          </FormGroup>
        )}
      </>
    )
  }

  EditAttribute.propTypes = {
    templateAttribute: PropTypes.bool,
    name: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    description: PropTypes.string,
    link: PropTypes.string,
    index: PropTypes.number.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    valueSelector: PropTypes.func,
    inputId: PropTypes.string,
    entityType: PropTypes.string.isRequired,
    darkMode: PropTypes.bool.isRequired,
    editorPath: PropTypes.string,
    selection: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    onSaveAndClose: PropTypes.func,
    addAttribute: PropTypes.func.isRequired,
    removeAttribute: PropTypes.func.isRequired,
    editAttribute: PropTypes.func.isRequired,
    reorderAttribute: PropTypes.func.isRequired,
  }

  const {
    redux,
    pltr: { actions, selectors },
  } = connector

  checkDependencies({ redux, actions, selectors })

  if (redux) {
    const { connect, bindActionCreators } = redux
    const mapDispatchToProps = (dispatch, { entityType }) => {
      const customAttributeActions = bindActionCreators(actions.customAttribute, dispatch)
      const attributesActions = bindActionCreators(actions.attributes, dispatch)
      const characterActions = bindActionCreators(actions.character, dispatch)

      switch (entityType) {
        case 'character': {
          return {
            addAttribute: (attribute) =>
              characterActions.createCharacterAttribute(attribute.type, attribute.name),
            // Other attributes are still keyed by name :/
            removeAttribute: (name, id) => {
              attributesActions.deleteCharacterAttribute(id, name)
            },
            // An adaptor because the old interface for editing
            // attributes is super-janky.
            editAttribute: (index, oldAttribute, newAttribute) => {
              attributesActions.editCharacterAttributeMetadata(
                oldAttribute.id,
                newAttribute.name,
                newAttribute.type,
                oldAttribute.name
              )
            },
            reorderAttribute: (attribute, toIndex) =>
              attributesActions.reorderCharacterAttribute(attribute.id, toIndex),
          }
        }

        case 'place':
          return {
            addAttribute: customAttributeActions.addPlaceAttr,
            removeAttribute: customAttributeActions.removePlaceAttr,
            editAttribute: customAttributeActions.editPlaceAttr,
            reorderAttribute: customAttributeActions.reorderPlacesAttribute,
          }

        case 'scene':
          return {
            addAttribute: customAttributeActions.addCardAttr,
            removeAttribute: customAttributeActions.removeCardAttr,
            editAttribute: customAttributeActions.editCardAttr,
            reorderAttribute: customAttributeActions.reorderCardsAttribute,
          }

        case 'note':
          return {
            addAttribute: customAttributeActions.addNoteAttr,
            removeAttribute: customAttributeActions.removeNoteAttr,
            editAttribute: customAttributeActions.editNoteAttr,
            reorderAttribute: customAttributeActions.reorderNotesAttribute,
          }

        default:
          log.warn(`${entityType} actions not implemented`)
          return {
            addAttribute: () => {},
            removeAttribute: () => {},
            editAttribute: () => {},
            reorderAttribute: () => {},
          }
      }
    }

    return connect(
      (state, ownProps) => ({
        ...(ownProps.valueSelector ? { value: ownProps.valueSelector(state.present) } : {}),
        selection: selectors.selectionSelector(state.present, ownProps.editorPath),
        darkMode: selectors.isDarkModeSelector(state.present),
      }),
      mapDispatchToProps
    )(React.memo(EditAttribute, areEqual))
  }

  throw new Error('No connecter found for EditAttribute')
}

export default EditAttributeConnector
