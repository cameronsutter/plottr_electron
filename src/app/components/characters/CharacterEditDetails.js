import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import cx from 'classnames'
import { ButtonToolbar, Button, FormControl, FormGroup, ControlLabel } from 'react-bootstrap'
import { t as i18n } from 'plottr_locales'
import RichText from '../rce/RichText'
import ImagePicker from '../images/ImagePicker'
import Image from '../images/Image'
import CategoryPicker from '../CategoryPicker'
import { DeleteConfirmModal } from 'plottr_components'
import EditAttribute from '../EditAttribute'
import { actions, selectors } from 'pltr/v2'

const CharacterActions = actions.character

const { singleCharacterSelector } = selectors

class CharacterEditDetails extends Component {
  constructor(props) {
    super(props)
    let attributes = {}
    props.customAttributes.forEach((attr) => {
      const { name } = attr
      attributes[name] = props.character[name]
    })
    let templateAttrs = props.character.templates.reduce((acc, t) => {
      acc[t.id] = t.attributes.reduce((obj, attr) => {
        obj[attr.name] = attr.value
        return obj
      }, {})
      return acc
    }, {})
    this.state = {
      notes: props.character.notes,
      attributes: attributes,
      categoryId: props.character.categoryId,
      templateAttrs: templateAttrs,
      newImageId: null,
      deleting: false,
    }

    this.nameInputRef = React.createRef()
    this.descriptionInputRef = React.createRef()
  }

  componentWillUnmount() {
    this.saveEdit(false)
  }

  deleteCharacter = (e) => {
    e.stopPropagation()
    this.props.actions.deleteCharacter(this.props.character.id)
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
    var name = this.nameInputRef.current.value || this.props.character.name
    var description = this.descriptionInputRef.current.value
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
    const templates = this.props.character.templates.map((t) => {
      t.attributes = t.attributes.map((attr) => {
        attr.value = this.state.templateAttrs[t.id][attr.name]
        return attr
      })
      return t
    })
    this.props.actions.editCharacter(this.props.character.id, {
      name,
      description,
      notes,
      templates,
      ...attrs,
    })
    if (close) this.props.finishEditing()
  }

  changeCategory = (val) => {
    this.setState({ categoryId: val })
    this.props.actions.editCharacter(this.props.character.id, { categoryId: val })
  }

  renderDelete() {
    if (!this.state.deleting) return null

    return (
      <DeleteConfirmModal
        name={this.props.character.name || i18n('New Character')}
        onDelete={this.deleteCharacter}
        onCancel={this.cancelDelete}
      />
    )
  }

  renderEditingImage() {
    const { character } = this.props

    let imgId = this.state.newImageId || character.imageId
    return (
      <FormGroup>
        <ControlLabel>{i18n('Character Thumbnail')}</ControlLabel>
        <div className="character-list__character__edit-image-wrapper">
          <div className="character-list__character__edit-image">
            <Image size="large" shape="circle" imageId={imgId} />
          </div>
          <div>
            <ImagePicker
              selectedId={imgId}
              chooseImage={(id) => this.setState({ newImageId: id })}
              deleteButton
            />
          </div>
        </div>
      </FormGroup>
    )
  }

  renderEditingCustomAttributes() {
    const { character, ui, customAttributes } = this.props
    return customAttributes.map((attr, index) => {
      return (
        <React.Fragment key={attr.name}>
          <EditAttribute
            index={index}
            entity={character}
            entityType="character"
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
    const { character, ui } = this.props
    return character.templates.flatMap((t) => {
      return t.attributes.map((attr, index) => (
        <React.Fragment key={index}>
          <EditAttribute
            templateAttribute
            index={index}
            entity={character}
            entityType="character"
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
    const { character, ui } = this.props
    return (
      <div className="character-list__character-wrapper">
        {this.renderDelete()}
        <div className={cx('character-list__character', 'editing', { darkmode: ui.darkMode })}>
          <div className="character-list__character__edit-form">
            <div className="character-list__inputs__normal">
              <FormGroup>
                <ControlLabel>{i18n('Name')}</ControlLabel>
                <FormControl
                  type="text"
                  inputRef={this.nameInputRef}
                  autoFocus
                  onKeyDown={this.handleEsc}
                  onKeyPress={this.handleEnter}
                  defaultValue={character.name}
                />
              </FormGroup>
              <FormGroup>
                <ControlLabel>{i18n('Short Description')}</ControlLabel>
                <FormControl
                  type="text"
                  inputRef={this.descriptionInputRef}
                  onKeyDown={this.handleEsc}
                  onKeyPress={this.handleEnter}
                  defaultValue={character.description}
                />
              </FormGroup>
            </div>
            <div className="character-list__inputs__custom">
              <FormGroup>
                <ControlLabel>{i18n('Category')}</ControlLabel>
                <CategoryPicker
                  type="characters"
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
                description={character.notes}
                onChange={(desc) => this.setState({ notes: desc })}
                editable
                autofocus={false}
                darkMode={this.props.ui.darkMode}
              />
            </FormGroup>
            {this.renderEditingCustomAttributes()}
            {this.renderEditingTemplates()}
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
    characterId: PropTypes.number.isRequired,
    character: PropTypes.object.isRequired,
    categories: PropTypes.array.isRequired,
    actions: PropTypes.object.isRequired,
    customAttributes: PropTypes.array.isRequired,
    ui: PropTypes.object.isRequired,
    finishEditing: PropTypes.func.isRequired,
  }
}

function mapStateToProps(state, ownProps) {
  return {
    character: singleCharacterSelector(state.present, ownProps.characterId),
    categories: state.present.categories.characters,
    customAttributes: state.present.customAttributes.characters,
    ui: state.present.ui,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(CharacterActions, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CharacterEditDetails)
