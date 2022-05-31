import React, { useState, useRef, useEffect, useMemo } from 'react'
import PropTypes from 'react-proptypes'
import RichTextConnector from './rce/RichText'
import DeleteConfirmModal from './dialogs/DeleteConfirmModal'
import cx from 'classnames'

import Glyphicon from './Glyphicon'
import ControlLabel from './ControlLabel'
import FormGroup from './FormGroup'
import FormControl from './FormControl'
import Button from './Button'
import { checkDependencies } from './checkDependencies'

const areEqual = (prevProps, nextProps) => {
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
    platform: { undo, redo, log },
  } = connector

  checkDependencies({ undo, redo, log })

  const EditAttribute = ({
    entityType,
    templateAttribute,
    name,
    type,
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
      editAttribute(index, { name, type }, { name: newName, type })
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
            onDelete={() => removeAttribute(name)}
            onCancel={() => setDeleting(false)}
          />
        ) : null}
        {type === 'paragraph' ? (
          <div className="card-dialog__custom-attributes__wrapper">
            <Label />
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
    type: PropTypes.string.isRequired,
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

      switch (entityType) {
        case 'character':
          return {
            addAttribute: customAttributeActions.addCharacterAttr,
            removeAttribute: customAttributeActions.removeCharacterAttr,
            editAttribute: customAttributeActions.editCharacterAttr,
            reorderAttribute: customAttributeActions.reorderCharacterAttribute,
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
