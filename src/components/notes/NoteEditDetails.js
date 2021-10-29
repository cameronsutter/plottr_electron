import React, { Component } from 'react'
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

  class NoteEditDetails extends Component {
    constructor(props) {
      super(props)
      this.state = {
        noteId: props.note.id,
        newImageId: null,
        deleting: false,
        categoryId: props.note.categoryId || null,
      }

      this.titleInputRef = null
    }

    componentWillUnmount() {
      this.saveEdit(false)
    }

    // Fixme: according to the React docs this will only work until 17
    // and in their experience is the cause of many errors.
    // (https://reactjs.org/docs/react-component.html#unsafe_componentwillreceiveprops)
    UNSAFE_componentWillReceiveProps(nextProps) {
      if (nextProps.note.categoryId != this.state.categoryId) {
        this.setState({ categoryId: nextProps.note.categoryId })
      }
    }

    deleteNote = (e) => {
      e.stopPropagation()
      this.props.actions.deleteNote(this.props.note.id)
    }

    cancelDelete = (e) => {
      e.stopPropagation()
      this.setState({ deleting: false })
    }

    handleDelete = (e) => {
      e.stopPropagation()
      this.setState({ deleting: true })
    }

    handleEnter = (event) => {
      if (event.which === 13) {
        this.saveEdit()
      }
    }

    handleEsc = (event) => {
      if (event.which === 27) {
        this.saveEdit()
      }
    }

    handleAttrChange = (attrName) => (desc, selection) => {
      const editorPath = helpers.editors.noteCustomAttributeEditorPath(this.props.note.id, attrName)
      this.props.actions.editNote(
        this.props.note.id,
        helpers.editors.attrIfPresent(attrName, desc),
        editorPath,
        selection
      )
    }

    handleTemplateAttrChange = (id, name) => (desc, selection) => {
      const editorPath = helpers.editors.noteTemplateAttributeEditorPath(
        this.props.note.id,
        id,
        name
      )

      if (!desc) {
        this.props.actions.editNote(this.props.note.id, {}, editorPath, selection)
        return
      }
      this.props.actions.editNoteTemplateAttribute(
        this.props.note.id,
        id,
        name,
        desc,
        editorPath,
        selection
      )
    }

    saveEdit = (close = true) => {
      var title = this.titleInputRef.value || this.props.note.title
      var attrs = {}
      if (this.state.newImageId) {
        attrs.imageId = this.state.newImageId == -1 ? null : this.state.newImageId
      }
      this.props.actions.editNote(this.props.note.id, {
        title,
        categoryId: this.state.categoryId == -1 ? null : this.state.categoryId,
        ...attrs,
      })
      if (close) this.props.finishEditing()
    }

    handleContentChange = (value, selection) => {
      this.props.actions.editNote(
        this.props.note.id,
        helpers.editors.attrIfPresent('content', value),
        this.props.editorPath,
        selection
      )
    }

    changeCategory = (val) => {
      this.setState({ categoryId: val }, () => {
        this.props.actions.editNote(this.props.note.id, { categoryId: val })
      })
    }

    renderDelete() {
      if (!this.state.deleting) return null

      return (
        <DeleteConfirmModal
          name={this.props.note.title || i18n('New Note')}
          onDelete={this.deleteNote}
          onCancel={this.cancelDelete}
        />
      )
    }

    renderEditingImage() {
      const { note, ui } = this.props

      let imgId = this.state.newImageId || note.imageId
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
                chooseImage={(id) => this.setState({ newImageId: id })}
                deleteButton
                darkMode={ui.darkMode}
              />
            </div>
          </div>
        </FormGroup>
      )
    }

    renderEditingCustomAttributes() {
      const { note, ui, customAttributes } = this.props
      return customAttributes.map((attr, index) => {
        const editorPath = helpers.editors.cardCustomAttributeEditorPath(
          this.props.note.id,
          attr.name
        )
        return (
          <React.Fragment key={attr.name}>
            <EditAttribute
              index={index}
              entity={note}
              entityType="note"
              value={note[attr.name]}
              editorPath={editorPath}
              ui={ui}
              onChange={this.handleAttrChange(attr.name)}
              onSave={this.saveEdit}
              name={attr.name}
              type={attr.type}
            />
          </React.Fragment>
        )
      })
    }

    renderEditingTemplates() {
      const { note, ui } = this.props
      return note.templates.flatMap((t) => {
        const templateValues = note.templates.find((template) => template.id === t.id)
        return t.attributes.map((attr, index) => (
          <React.Fragment key={index}>
            <EditAttribute
              templateAttribute
              index={index}
              entity={note}
              entityType="note"
              value={templateValues && templateValues[attr.name]}
              ui={ui}
              inputId={`${t.id}-${attr.name}Input`}
              onChange={this.handleTemplateAttrChange(t.id, attr.name)}
              onSave={this.saveEdit}
              name={attr.name}
              type={attr.type}
            />
          </React.Fragment>
        ))
      })
    }

    render() {
      const { note, ui } = this.props
      return (
        <div className="note-list__note-wrapper">
          {this.renderDelete()}
          <div className={cx('note-list__note', 'editing', { darkmode: ui.darkMode })}>
            <div className="note-list__note__edit-form">
              <div className="note-list__inputs__normal">
                <FormGroup>
                  <ControlLabel>{i18n('Name')}</ControlLabel>
                  <FormControl
                    type="text"
                    inputRef={(ref) => {
                      this.titleInputRef = ref
                    }}
                    autoFocus
                    onKeyDown={this.handleEsc}
                    onKeyPress={this.handleEnter}
                    defaultValue={note.title}
                  />
                </FormGroup>
              </div>
              <div className="note-list__inputs__custom">
                <FormGroup>
                  <ControlLabel>{i18n('Category')}</ControlLabel>
                  <CategoryPicker
                    type="notes"
                    selectedId={this.state.categoryId}
                    onChange={this.changeCategory}
                  />
                </FormGroup>
                {this.renderEditingImage()}
              </div>
            </div>
            <div>
              <FormGroup className="note-list__rce__wrapper">
                <ControlLabel>{i18n('Notes')}</ControlLabel>
                <RichText
                  id={this.props.editorPath}
                  description={note.content}
                  onChange={this.handleContentChange}
                  selection={this.props.selection}
                  editable
                  autofocus={false}
                  darkMode={this.props.ui.darkMode}
                />
              </FormGroup>
              {this.renderEditingCustomAttributes()}
              {/* {this.renderEditingTemplates()} */}
            </div>
            <ButtonToolbar className="card-dialog__button-bar">
              <Button bsStyle="success" onClick={this.saveEdit}>
                {i18n('Save')}
              </Button>
              <Button className="card-dialog__delete" onClick={this.handleDelete}>
                {i18n('Delete')}
              </Button>
            </ButtonToolbar>
          </div>
        </div>
      )
    }

    static propTypes = {
      noteId: PropTypes.number.isRequired,
      note: PropTypes.object.isRequired,
      actions: PropTypes.object.isRequired,
      customAttributes: PropTypes.array.isRequired,
      ui: PropTypes.object.isRequired,
      finishEditing: PropTypes.func.isRequired,
      editorPath: PropTypes.string.isRequired,
      selection: PropTypes.object.isRequired,
    }
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
