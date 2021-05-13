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

const NoteEditDetailsConnector = (connector) => {
  const CategoryPicker = UnconnectedCategoryPicker(connector)
  const RichText = UnconnectedRichText(connector)
  const EditAttribute = UnconnectedEditAttribute(connector)
  const ImagePicker = UnconnectedImagePicker(connector)
  const Image = UnconnectedImage(connector)

  class NoteEditDetails extends Component {
    constructor(props) {
      super(props)
      let attributes = {}
      props.customAttributes.forEach((attr) => {
        const { name } = attr
        attributes[name] = props.note[name]
      })
      let templateAttrs = props.note.templates.reduce((acc, t) => {
        acc[t.id] = t.attributes.reduce((obj, attr) => {
          obj[attr.name] = attr.value
          return obj
        }, {})
        return acc
      }, {})
      this.state = {
        attributes: attributes,
        noteId: props.note.noteId,
        templateAttrs: templateAttrs,
        newImageId: null,
        deleting: false,
        categoryId: props.note.categoryId,
      }

      this.nameInputRef = null
    }

    componentWillUnmount() {
      this.saveEdit(false)
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

    handleAttrChange = (attrName) => (desc) => {
      const attributes = {
        ...this.state.attributes,
      }
      attributes[attrName] = desc
      this.setState({ attributes })
    }

    handleTemplateAttrChange = (id, name) => (desc) => {
      let templateAttrs = {
        ...this.state.templateAttrs,
        [id]: {
          ...this.state.templateAttrs[id],
          [name]: desc,
        },
      }
      this.setState({ templateAttrs })
    }

    saveEdit = (close = true) => {
      var name = this.nameInputRef.value || this.props.note.name
      var notes = this.state.notes
      var attrs = {
        categoryId: this.state.categoryId == -1 ? null : this.state.categoryId,
      }
      if (this.state.newImageId) {
        attrs.imageId = this.state.newImageId == -1 ? null : this.state.newImageId
      }
      this.props.customAttributes.forEach((attr) => {
        const { name } = attr
        attrs[name] = this.state.attributes[name]
      })
      const templates = this.props.note.templates.map((t) => {
        t.attributes = t.attributes.map((attr) => {
          attr.value = this.state.templateAttrs[t.id][attr.name]
          return attr
        })
        return t
      })
      this.props.actions.editNote(this.props.note.id, {
        name,
        notes,
        templates,
        ...attrs,
      })
      if (close) this.props.finishEditing()
    }

    changeCategory = (val) => {
      this.setState({ categoryId: val })
      this.props.actions.editNote(this.props.note.id, { categoryId: val })
    }

    renderDelete() {
      if (!this.state.deleting) return null

      return (
        <DeleteConfirmModal
          name={this.props.note.name || i18n('New Note')}
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
        return (
          <React.Fragment key={attr.name}>
            <EditAttribute
              index={index}
              entity={note}
              entityType="note"
              value={this.state.attributes[attr.name]}
              ui={ui}
              onChange={this.handleAttrChange(attr.name)}
              onShortDescriptionKeyDown={this.handleEsc}
              onShortDescriptionKeyPress={this.handleEnter}
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
        return t.attributes.map((attr, index) => (
          <React.Fragment key={index}>
            <EditAttribute
              templateAttribute
              index={index}
              entity={note}
              entityType="note"
              value={this.state.templateAttrs[t.id][attr.name]}
              ui={ui}
              inputId={`${t.id}-${attr.name}Input`}
              onChange={this.handleTemplateAttrChange(t.id, attr.name)}
              onShortDescriptionKeyDown={this.handleEsc}
              onShortDescriptionKeyPress={this.handleEnter}
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
                      this.nameInputRef = ref
                    }}
                    autoFocus
                    onKeyDown={this.handleEsc}
                    onKeyPress={this.handleEnter}
                    defaultValue={note.name}
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
              <FormGroup>
                <ControlLabel>{i18n('Notes')}</ControlLabel>
                <RichText
                  description={note.notes}
                  onChange={(desc) => this.setState({ notes: desc })}
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
    }
  }

  const {
    redux,
    pltr: {
      selectors: { singleNoteSelector },
      actions,
    },
  } = connector

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(
      (state, ownProps) => {
        return {
          note: singleNoteSelector(state.present, ownProps.noteId),
          customAttributes: state.present.customAttributes.notes,
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
