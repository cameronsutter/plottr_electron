import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { findDOMNode } from 'react-dom'
import cx from 'classnames'
import { ButtonToolbar, Button, FormControl, FormGroup, ControlLabel } from 'react-bootstrap'
import * as CharacterActions from 'actions/characters'
import i18n from 'format-message'
import RichText from '../rce/RichText'
import ImagePicker from '../images/ImagePicker'
import Image from '../images/Image'
import CategoryPicker from '../CategoryPicker'
import { singleCharacterSelector } from '../../selectors/characters'
import DeleteConfirmModal from '../dialogs/DeleteConfirmModal'
import { EditAttribute } from '../EditAttribute'

class CharacterEditDetails extends Component {
  constructor (props) {
    super(props)
    let description = {}
    props.customAttributes.forEach(attr => {
      const { name } = attr
      description[name] = props.character[name]
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
      description: description,
      categoryId: props.character.categoryId,
      templateAttrs: templateAttrs,
      newImageId: null,
      deleting: false,
      inputRefs: [],
    }
  }

  componentWillUnmount () {
    this.saveEdit(false)
  }

  deleteCharacter = e => {
    e.stopPropagation()
    this.props.actions.deleteCharacter(this.props.character.id)
  }

  cancelDelete = e => {
    e.stopPropagation()
    this.setState({deleting: false})
  }

  handleDelete = e => {
    e.stopPropagation()
    this.setState({deleting: true})
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

  handleAttrDescriptionChange = (attrName, desc) => {
    let description = {
      ...this.state.description,
    }
    description[attrName] = desc
    this.setState({description: description})
  }

  handleTemplateAttrDescriptionChange = (id, attr, desc) => {
    let templateAttrs = {
      ...this.state.templateAttrs,
      [id]: {
        ...this.state.templateAttrs[id],
        [attr]: desc,
      }
    }
    this.setState({templateAttrs})
  }

  findChildInput = (id) => {
    const foundInput = this.state.inputRefs.find(ref => {
      return ref && ref.props.id === id
    })
    return foundInput && findDOMNode(foundInput)
  }

  saveEdit = (close = true) => {
    var name = findDOMNode(this.refs.nameInput).value || this.props.character.name
    var description = findDOMNode(this.refs.descriptionInput).value
    var notes = this.state.notes
    var attrs = {
      categoryId: this.state.categoryId == -1 ? null : this.state.categoryId,
    }
    if (this.state.newImageId) {
      attrs.imageId = this.state.newImageId == -1 ? null : this.state.newImageId
    }
    this.props.customAttributes.forEach(attr => {
      const { name, type } = attr
      if (type == 'paragraph') {
        attrs[name] = this.state.description[name]
      } else {
        const val = this.findChildInput(`${name}Input`).value
        attrs[name] = val
      }
    })
    let templates = this.props.character.templates.map(t => {
      t.attributes = t.attributes.map(attr => {
        if (attr.type == 'paragraph') {
          attr.value = this.state.templateAttrs[t.id][attr.name]
        } else {
          attr.value = findDOMNode(this.refs[`${t.id}-${attr.name}Input`]).value
        }
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
    this.setState({categoryId: val})
    this.props.actions.editCharacter(this.props.character.id, {categoryId: val})
  }

  addInputRef = (ref) => {
    // Set state needs to be queued so that React does not overwrite
    // the attribute in a merge
    setTimeout(() => {
      this.setState({
        inputRefs: [...this.state.inputRefs, ref],
      })
    }, 0)
  }

  renderDelete () {
    if (!this.state.deleting) return null

    return <DeleteConfirmModal name={this.props.character.name || i18n('New Character')} onDelete={this.deleteCharacter} onCancel={this.cancelDelete}/>
  }

  renderEditingImage () {
    const { character } = this.props

    let imgId = this.state.newImageId || character.imageId
    return <FormGroup>
      <ControlLabel>{i18n('Character Thumbnail')}</ControlLabel>
      <div className='character-list__character__edit-image-wrapper'>
        <div className='character-list__character__edit-image'>
          <Image size='large' shape='circle' imageId={imgId} />
        </div>
        <div>
          <ImagePicker selectedId={imgId} chooseImage={id => this.setState({newImageId: id})} deleteButton />
        </div>
      </div>
    </FormGroup>
  }

  renderEditingCustomAttributes () {
    const { character, ui, customAttributes } = this.props
    return customAttributes.map((attr, idx) => {
      return (
        <React.Fragment key={idx}>
          <EditAttribute
            entity={character}
            ui={ui}
            handleLongDescriptionChange={this.handleAttrDescriptionChange}
            onShortDescriptionKeyDown={this.handleEsc}
            onShortDescriptionKeyPress={this.handleEnter}
            withRef={this.addInputRef}
            {...attr}
          />
        </React.Fragment>
      )
    })
  }

  renderEditingTemplates () {
    return this.props.character.templates.flatMap(t => {
      return t.attributes.map(attr => {
        if (attr.type == 'paragraph') {
          return <div key={attr.name}>
            <ControlLabel>{attr.name}</ControlLabel>
            <RichText
              description={attr.value}
              onChange={(desc) => this.handleTemplateAttrDescriptionChange(t.id, attr.name, desc)}
              editable
              autofocus={false}
              darkMode={this.props.ui.darkMode}
            />
          </div>
        } else {
          return <FormGroup key={attr.name}>
            <ControlLabel>{attr.name}</ControlLabel>
            <FormControl
              type='text' ref={`${t.id}-${attr.name}Input`}
              defaultValue={attr.value}
              onKeyDown={this.handleEsc}
              onKeyPress={this.handleEnter} />
          </FormGroup>
        }
      })
    })
  }

  render () {
    const { character, ui } = this.props
    return <div className='character-list__character-wrapper'>
      { this.renderDelete() }
      <div className={cx('character-list__character', 'editing', {darkmode: ui.darkMode})}>
        <div className='character-list__character__edit-form'>
          <div className='character-list__inputs__normal'>
            <FormGroup>
              <ControlLabel>{i18n('Name')}</ControlLabel>
              <FormControl
                type='text' ref='nameInput' autoFocus
                onKeyDown={this.handleEsc}
                onKeyPress={this.handleEnter}
                defaultValue={character.name} />
            </FormGroup>
            <FormGroup>
              <ControlLabel>{i18n('Short Description')}</ControlLabel>
              <FormControl type='text' ref='descriptionInput'
                onKeyDown={this.handleEsc}
                onKeyPress={this.handleEnter}
                defaultValue={character.description} />
            </FormGroup>
          </div>
          <div className='character-list__inputs__custom'>
            <FormGroup>
              <ControlLabel>{i18n('Category')}</ControlLabel>
              <CategoryPicker type='characters' selectedId={this.state.categoryId} onChange={this.changeCategory}/>
            </FormGroup>
            { this.renderEditingImage() }
          </div>
        </div>
        <div>
          <FormGroup>
            <ControlLabel>{i18n('Notes')}</ControlLabel>
            <RichText
              description={character.notes}
              onChange={(desc) => this.setState({notes: desc})}
              editable
              autofocus={false}
              darkMode={this.props.ui.darkMode}
            />
          </FormGroup>
          { this.renderEditingCustomAttributes() }
          { this.renderEditingTemplates() }
        </div>
        <ButtonToolbar className='card-dialog__button-bar'>
          <Button bsStyle='success' onClick={this.saveEdit}>
            {i18n('Save')}
          </Button>
          <Button className='card-dialog__delete' onClick={this.handleDelete}>
            {i18n('Delete')}
          </Button>
        </ButtonToolbar>
      </div>
    </div>
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

function mapStateToProps (state, ownProps) {
  return {
    character: singleCharacterSelector(state.present, ownProps.characterId),
    categories: state.present.categories.characters,
    customAttributes: state.present.customAttributes.characters,
    ui: state.present.ui,
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(CharacterActions, dispatch),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CharacterEditDetails)
