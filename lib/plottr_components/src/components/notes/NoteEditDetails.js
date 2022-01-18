import React, { useEffect, useState, useRef } from 'react'
import PropTypes from 'react-proptypes'
import cx from 'classnames'
import { ButtonToolbar, Button, FormControl, FormGroup, ControlLabel } from 'react-bootstrap'
import { t as i18n } from 'plottr_locales'
import DeleteConfirmModal from '../dialogs/DeleteConfirmModal'
import UnconnectedCategoryPicker from '../CategoryPicker'
import UnconnectedRichText from '../rce/RichText'
import UnconnectedEditAttribute from '../EditAttribute'
import UnconnectedImagePicker from '../images/ImagePicker'
import UnconnectedImage from '../images/Image'
import { checkDependencies } from '../checkDependencies'

const NoteEditDetailsConnector = (connector) => {
  const CategoryPicker = UnconnectedCategoryPicker(connector)
  const RichText = UnconnectedRichText(connector)
  const EditAttribute = UnconnectedEditAttribute(connector)
  const ImagePicker = UnconnectedImagePicker(connector)
  const Image = UnconnectedImage(connector)

  const {
    pltr: { helpers },
  } = connector
  checkDependencies({ helpers })

  const NoteEditDetails = ({
    note,
    actions,
    finishEditing,
    editorPath,
    ui,
    customAttributes,
    selection,
  }) => {
    const [newImageId, setNewImageId] = useState(null)
    const [deleting, setDeleting] = useState(false)
    const [categoryId, setCategoryId] = useState(note.categoryId || null)

    const titleInputRef = useRef()

    const saveEdit = (close = true) => {
      var title = titleInputRef.current.value || note.title
      var attrs = {}
      if (newImageId) {
        attrs.imageId = newImageId == -1 ? null : newImageId
      }
      actions.editNote(note.id, {
        title,
        categoryId: categoryId == -1 ? null : categoryId,
        ...attrs,
      })
      if (close) finishEditing()
    }

    useEffect(() => {
      return () => {
        saveEdit(false)
      }
    }, [])

    useEffect(() => {
      if (note.categoryId !== categoryId) {
        setCategoryId(note.categoryId)
      }
    }, [note.categoryId])

    const deleteNote = (e) => {
      e.stopPropagation()
      actions.deleteNote(note.id)
    }

    const cancelDelete = (e) => {
      e.stopPropagation()
      setDeleting(false)
    }

    const handleDelete = (e) => {
      e.stopPropagation()
      setDeleting(true)
    }

    const handleEnter = (event) => {
      if (event.which === 13) {
        saveEdit()
      }
    }

    const handleEsc = (event) => {
      if (event.which === 27) {
        saveEdit()
      }
    }

    const handleAttrChange = (attrName) => (desc, selection) => {
      const editorPath = helpers.editors.noteCustomAttributeEditorPath(note.id, attrName)
      actions.editNote(
        note.id,
        helpers.editors.attrIfPresent(attrName, desc),
        editorPath,
        selection
      )
    }

    const handleContentChange = (value, selection) => {
      actions.editNote(
        note.id,
        helpers.editors.attrIfPresent('content', value),
        editorPath,
        selection
      )
    }

    const changeCategory = (val) => {
      setCategoryId(val)
      actions.editNote(note.id, { categoryId: val })
    }

    const renderDelete = () => {
      if (!deleting) return null

      return (
        <DeleteConfirmModal
          name={note.title || i18n('New Note')}
          onDelete={deleteNote}
          onCancel={cancelDelete}
        />
      )
    }

    const renderEditingImage = () => {
      let imgId = newImageId || note.imageId
      return (
        <FormGroup>
          <ControlLabel>{i18n('Note Image')}</ControlLabel>
          <div className="note-list__note__edit-image-wrapper">
            <div className="note-list__note__edit-image">
              <Image size="small" shape="rounded" imageId={imgId} />
            </div>
            <div>
              <ImagePicker
                selectedId={imgId}
                chooseImage={(id) => setNewImageId(id)}
                deleteButton
                darkMode={ui.darkMode}
              />
            </div>
          </div>
        </FormGroup>
      )
    }

    const renderEditingCustomAttributes = () => {
      return customAttributes.map((attr, index) => {
        const editorPath = helpers.editors.cardCustomAttributeEditorPath(note.id, attr.name)
        return (
          <React.Fragment key={attr.name}>
            <EditAttribute
              index={index}
              entity={note}
              entityType="note"
              value={note[attr.name]}
              editorPath={editorPath}
              ui={ui}
              onChange={handleAttrChange(attr.name)}
              onSave={saveEdit}
              name={attr.name}
              type={attr.type}
            />
          </React.Fragment>
        )
      })
    }

    return (
      <div className="note-list__note-wrapper">
        {renderDelete()}
        <div className={cx('note-list__note', 'editing', { darkmode: ui.darkMode })}>
          <div className="note-list__note__edit-form">
            <div className="note-list__inputs__normal">
              <FormGroup>
                <ControlLabel>{i18n('Name')}</ControlLabel>
                <FormControl
                  type="text"
                  inputRef={(ref) => {
                    titleInputRef.current = ref
                  }}
                  autoFocus
                  onKeyDown={handleEsc}
                  onKeyPress={handleEnter}
                  defaultValue={note.title}
                />
              </FormGroup>
            </div>
            <div className="note-list__inputs__custom">
              <FormGroup>
                <ControlLabel>{i18n('Category')}</ControlLabel>
                <CategoryPicker type="notes" selectedId={categoryId} onChange={changeCategory} />
              </FormGroup>
              {renderEditingImage()}
            </div>
          </div>
          <div>
            <FormGroup className="note-list__rce__wrapper">
              <ControlLabel>{i18n('Notes')}</ControlLabel>
              <RichText
                id={editorPath}
                description={note.content}
                onChange={handleContentChange}
                selection={selection}
                editable
                autofocus={false}
                darkMode={ui.darkMode}
              />
            </FormGroup>
            {renderEditingCustomAttributes()}
            {/* {renderEditingTemplates()} */}
          </div>
          <ButtonToolbar className="card-dialog__button-bar">
            <Button bsStyle="success" onClick={saveEdit}>
              {i18n('Save')}
            </Button>
            <Button className="card-dialog__delete" onClick={handleDelete}>
              {i18n('Delete')}
            </Button>
          </ButtonToolbar>
        </div>
      </div>
    )
  }

  NoteEditDetails.propTypes = {
    note: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    customAttributes: PropTypes.array.isRequired,
    ui: PropTypes.object.isRequired,
    finishEditing: PropTypes.func.isRequired,
    editorPath: PropTypes.string.isRequired,
    selection: PropTypes.object.isRequired,
  }

  const {
    redux,
    pltr: { selectors, actions },
  } = connector
  checkDependencies({ redux, selectors, actions })

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(
      (state, ownProps) => {
        const editorPath = helpers.editors.noteContentEditorPath(ownProps.noteId)
        return {
          note: selectors.singleNoteSelector(state.present, ownProps.noteId),
          customAttributes: state.present.customAttributes.notes,
          editorPath,
          selection: selectors.selectionSelector(state.present, editorPath),
          ui: state.present.ui,
        }
      },
      (dispatch) => {
        return {
          actions: bindActionCreators(actions.note, dispatch),
        }
      }
    )(NoteEditDetails)
  }

  throw new Error('Cannot connect NoteEditDetails')
}

export default NoteEditDetailsConnector
