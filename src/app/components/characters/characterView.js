import _ from 'lodash'
import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import cx from 'classnames'
import { ButtonToolbar, Button, FormControl, FormGroup,
  ControlLabel, Tooltip, OverlayTrigger, Image } from 'react-bootstrap'
import * as CharacterActions from 'actions/characters'
import MDdescription from 'components/mdDescription'
import i18n from 'format-message'
import SETTINGS from '../../../common/utils/settings'
import ImagePicker from '../ImagePicker'

class CharacterView extends Component {
  constructor (props) {
    super(props)
    let description = {}
    props.customAttributes.forEach(attr => {
      const [attrName, attrType] = attr.split(':#:')
      description[attrName] = props.character[attrName]
    })
    let templateAttrs = props.character.templates.reduce((acc, t) =>{
      acc[t.id] = t.attributes.reduce((obj, attr) => {
        obj[attr.name] = attr.value
        return obj
      }, {})
      return acc
    }, {})
    this.state = {
      editing: props.character.name === '',
      notes: props.character.notes,
      description: description,
      templateAttrs: templateAttrs,
      newImageId: null,
    }
  }

  componentWillUnmount () {
    if (this.state.editing) this.saveEdit()
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

  saveEdit = () => {
    var name = ReactDOM.findDOMNode(this.refs.nameInput).value || this.props.character.name
    var description = ReactDOM.findDOMNode(this.refs.descriptionInput).value
    var notes = this.state.notes
    var attrs = {}
    if (this.state.newImageId) {
      attrs.imageId = this.state.newImageId
    }
    this.props.customAttributes.forEach(attr => {
      const [attrName, attrType] = attr.split(':#:')
      if (attrType == 'paragraph') {
        attrs[attrName] = this.state.description[attrName]
      } else {
        const val = ReactDOM.findDOMNode(this.refs[`${attr}Input`]).value
        attrs[attr] = val
      }
    })
    let templates = this.props.character.templates.map(t => {
      t.attributes = t.attributes.map(attr => {
        if (attr.type == 'paragraph') {
          attr.value = this.state.templateAttrs[t.id][attr.name]
        } else {
          attr.value = ReactDOM.findDOMNode(this.refs[`${t.id}-${attr.name}Input`]).value
        }
        return attr
      })
      return t
    })
    this.props.actions.editCharacter(this.props.character.id, {name, description, notes, templates, ...attrs})
    this.setState({editing: false})
  }

  deleteCharacter = () => {
    let text = i18n('Do you want to delete this character: { character }?', {character: this.props.character.name})
    if (window.confirm(text)) {
      this.props.actions.deleteCharacter(this.props.character.id)
    }
  }

  renderEditingImage () {
    const { character, images } = this.props

    let img = null
    if (character.imageId && images[character.imageId]) {
      img = <Image src={images[character.imageId].data} responsive circle />
    }
    if (this.state.newImageId) {
      img = <Image src={images[this.state.newImageId].data} responsive circle />
    }
    return <FormGroup>
      <ControlLabel>{i18n('Character Image')}</ControlLabel>
      <div className='character-list__character__edit-image-wrapper'>
        <div className='character-list__character__edit-image'>
          {img ? img : null}
        </div>
        <div>
          {SETTINGS.get('premiumFeatures') ?
            <ImagePicker current={character.imageId} chooseImage={id => this.setState({newImageId: id})} />
          : null}
        </div>
      </div>
    </FormGroup>
  }

  renderEditingCustomAttributes () {
    return this.props.customAttributes.map((attr, idx) => {
      const [attrName, attrType] = attr.split(':#:')
      if (attrType == 'paragraph') {
        return <div key={idx}>
          <label>{attrName}</label>
          <MDdescription
            description={this.props.character[attrName]}
            onChange={(desc) => this.handleAttrDescriptionChange(attrName, desc)}
            useRCE={true}
            labels={{}}
            darkMode={false}
          />
        </div>
      } else {
        return <FormGroup key={idx}>
          <ControlLabel>{attrName}</ControlLabel>
          <FormControl
            type='text' ref={`${attrName}Input`}
            defaultValue={this.props.character[attrName]}
            onKeyDown={this.handleEsc}
            onKeyPress={this.handleEnter} />
        </FormGroup>
      }
    })
  }

  renderEditingTemplates () {
    return this.props.character.templates.flatMap(t => {
      return t.attributes.map(attr => {
        if (attr.type == 'paragraph') {
          return <div key={attr.name}>
            <label>{attr.name}</label>
            <MDdescription
              description={attr.value}
              onChange={(desc) => handleTemplateAttrDescriptionChange(t.id, attr.name, desc)}
              useRCE={true}
              labels={{}}
              darkMode={false}
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

  renderEditing () {
    const { character } = this.props
    return (
      <div className='character-list__character editing'>
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
            { this.renderEditingImage() }
            <FormGroup>
              <ControlLabel>{i18n('Notes')}</ControlLabel>
              <MDdescription
                description={character.notes}
                onChange={(desc) => this.setState({notes: desc})}
                useRCE={true}
                labels={{}}
                darkMode={false}
              />
            </FormGroup>
            { this.renderEditingTemplates() }
          </div>
          <div className='character-list__inputs__custom'>
            {this.renderEditingCustomAttributes()}
          </div>
        </div>
        <ButtonToolbar className='card-dialog__button-bar'>
          <Button
            onClick={() => this.setState({editing: false})} >
            {i18n('Cancel')}
          </Button>
          <Button bsStyle='success'
            onClick={this.saveEdit} >
            {i18n('Save')}
          </Button>
          <Button className='card-dialog__delete'
            onClick={this.deleteCharacter} >
            {i18n('Delete')}
          </Button>
        </ButtonToolbar>
      </div>
    )
  }

  renderAssociations () {
    let cards = null
    let notes = null
    if (this.props.character.cards.length > 0) {
      cards = this.renderCardAssociations()
    }
    if (this.props.character.noteIds.length > 0) {
      notes = this.renderNoteAssociations()
    }
    if (cards && notes) {
      return [cards, <span key='ampersand'> & </span>, notes]
    } else {
      return cards || notes
    }
  }

  renderCardAssociations () {
    let label = i18n(`{
      count, plural,
        one {1 card}
        other {# cards}
    }`, { count: this.props.character.cards.length })
    let cardsAssoc = this.props.character.cards.reduce((arr, cId) => {
      let card = _.find(this.props.cards, {id: cId})
      if (card) return arr.concat(card.title)
      return arr
    }, []).join(', ')
    let tooltip = <Tooltip id='card-association-tooltip'>{cardsAssoc}</Tooltip>
    return <OverlayTrigger placement='top' overlay={tooltip} key='card-association'>
      <span>{label}</span>
    </OverlayTrigger>
  }

  renderNoteAssociations () {
    let label = i18n(`{
      count, plural,
        one {1 note}
        other {# notes}
    }`, { count: this.props.character.noteIds.length })
    let noteAssoc = this.props.character.noteIds.reduce((arr, nId) => {
      let note = _.find(this.props.notes, {id: nId})
      if (note) return arr.concat(note.title)
      return arr
    }, []).join(', ')
    let tooltip = <Tooltip id='notes-association-tooltip'>{noteAssoc}</Tooltip>
    return <OverlayTrigger placement='top' overlay={tooltip} key='note-association'>
      <span>{label}</span>
    </OverlayTrigger>
  }

  renderLeftSide (shouldRender) {
    if (!shouldRender) return null

    const { character, images } = this.props
    const customAttrNotes = this.props.customAttributes.map((attr, idx) => {
      const [attrName, attrType] = attr.split(':#:')
      let desc = <dd>{character[attrName]}</dd>
      if (attrType == 'paragraph') {
        desc = <dd>
          <MDdescription
            description={character[attrName] || ''}
            labels={{}}
            darkMode={false}
          />
        </dd>
      }
      return <dl key={idx} className='dl-horizontal'>
        <dt>{attrName}</dt>
        {desc}
      </dl>
    })

    const hasImage = character.imageId && images[character.imageId]
    let imageData = null
    if (hasImage) imageData = images[character.imageId].data

    return <div>
      {hasImage ? <div className='image-circle-large' style={{backgroundImage: `url(${imageData})`}} /> : null}
      {customAttrNotes}
    </div>
  }

  renderCharacter () {
    const klasses = cx('character-list__character', {
      darkmode: this.props.ui.darkMode,
    })
    const { character, images } = this.props
    const templateNotes = character.templates.flatMap(t => {
      return t.attributes.map(attr => {
        let val = <dd>{attr.value}</dd>
        if (attr.type == 'paragraph') {
          val = <dd>
            <MDdescription
              description={attr.value || ''}
              labels={{}}
              darkMode={false}
            />
          </dd>
        }
        return <dl key={attr.name} className='dl-horizontal'>
          <dt>{attr.name}</dt>
          {val}
        </dl>
      })
    })
    const hasImage = character.imageId && images[character.imageId]
    return (
      <div className={klasses} onClick={() => this.setState({editing: true})}>
        <h4 className='secondary-text'>{character.name}</h4>
        <div className='character-list__character-notes'>
          { this.renderLeftSide(hasImage) }
          <div>
            <dl className='dl-horizontal'>
              <dt>{i18n('Description')}</dt>
              <dd>{character.description}</dd>
            </dl>
            <dl className='dl-horizontal'>
              <dt>{i18n('Notes')}</dt>
              <dd>
                <MDdescription
                  description={character.notes || ''}
                  labels={{}}
                  darkMode={false}
                  numOfRows={'15'}
                />
              </dd>
            </dl>
            {templateNotes}
            <dl className='dl-horizontal'>
              <dt>{i18n('Attached to')}</dt>
              <dd>{this.renderAssociations()}</dd>
            </dl>
          </div>
          { this.renderLeftSide(!hasImage) }
        </div>
      </div>
    )
  }

  render () {
    if (this.state.editing) {
      window.SCROLLWITHKEYS = false
      return this.renderEditing()
    } else {
      window.SCROLLWITHKEYS = true
      return this.renderCharacter()
    }
  }
}

CharacterView.propTypes = {
  character: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  customAttributes: PropTypes.array.isRequired,
  cards: PropTypes.array.isRequired,
  notes: PropTypes.array.isRequired,
  ui: PropTypes.object.isRequired,
}

function mapStateToProps (state) {
  return {
    customAttributes: state.customAttributes['characters'],
    cards: state.cards,
    notes: state.notes,
    ui: state.ui,
    images: state.images,
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
)(CharacterView)
