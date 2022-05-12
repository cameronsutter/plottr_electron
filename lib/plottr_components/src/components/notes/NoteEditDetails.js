import React, { useState } from 'react'
import PropTypes from 'react-proptypes'
import cx from 'classnames'
import { ButtonToolbar, FormGroup, ControlLabel } from 'react-bootstrap'

import { t as i18n } from 'plottr_locales'

import FormControl from '../FormControl'
import Button from '../Button'
import DeleteConfirmModal from '../dialogs/DeleteConfirmModal'
import UnconnectedCategoryPicker from '../CategoryPicker'
import UnconnectedRichText from '../rce/RichText'
import UnconnectedEditAttribute from '../EditAttribute'
import UnconnectedImagePicker from '../images/ImagePicker'
import UnconnectedImage from '../images/Image'
import { checkDependencies } from '../checkDependencies'
import { withEventTargetValue } from '../../../dist/components/withEventTargetValue'

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
    darkMode,
    customAttributes,
    selection,
  }) => {
    const [deleting, setDeleting] = useState(false)

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
        finishEditing()
      }
    }

    const handleEsc = (event) => {
      if (event.which === 27) {
        finishEditing()
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
      actions.editNote(note.id, { categoryId: val })
    }

    const changeImage = (newImageId) => {
      actions.editNote(note.id, { imageId: newImageId })
    }

    const changeTitle = (newTitle) => {
      actions.editNote(note.id, { title: newTitle })
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
      return (
        <FormGroup>
          <ControlLabel>{i18n('Note Image')}</ControlLabel>
          <div className="note-list__note__edit-image-wrapper">
            <div className="note-list__note__edit-image">
              <Image size="small" shape="rounded" imageId={note.imageId} />
            </div>
            <div>
              <ImagePicker selectedId={note.imageId} chooseImage={changeImage} deleteButton />
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
              onChange={handleAttrChange(attr.name)}
              onSave={finishEditing}
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
        <div className={cx('note-list__note', 'editing', { darkmode: darkMode })}>
          <div className="note-list__note__edit-form">
            <div className="note-list__inputs__normal">
              <FormGroup>
                <ControlLabel>{i18n('Name')}</ControlLabel>
                <FormControl
                  type="text"
                  onChange={withEventTargetValue(changeTitle)}
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
                <CategoryPicker
                  type="notes"
                  selectedId={note.categoryId}
                  onChange={changeCategory}
                />
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
              />
            </FormGroup>
            {renderEditingCustomAttributes()}
            {/* {renderEditingTemplates()} */}
          </div>
          <ButtonToolbar className="card-dialog__button-bar">
            <Button bsStyle="success" onClick={finishEditing}>
              {i18n('Close')}
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
    darkMode: PropTypes.object.isRequired,
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
          darkMode: selectors.isDarkModeSelector(state.present),
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
