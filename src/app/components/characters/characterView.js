import _ from 'lodash'
import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { ButtonToolbar, Button, FormControl, FormGroup,
  ControlLabel, Glyphicon, Tooltip, OverlayTrigger } from 'react-bootstrap'
import * as CharacterActions from 'actions/characters'
import MDdescription from 'components/mdDescription'
import i18n from 'format-message'

class CharacterView extends Component {
  constructor (props) {
    super(props)
    let description = {}
    props.customAttributes.forEach(attr => {
      const [attrName, attrType] = attr.split(':#:')
      description[attrName] = props.character[attrName]
    })
    this.state = {
      editing: props.character.name === '',
      notes: props.character.notes,
      description: description
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
      ...this.state.description
    }
    description[attrName] = desc
    this.setState({description: description})
  }

  saveEdit = () => {
    var name = ReactDOM.findDOMNode(this.refs.nameInput).value || this.props.character.name
    var description = ReactDOM.findDOMNode(this.refs.descriptionInput).value
    var notes = this.state.notes
    var attrs = {}
    this.props.customAttributes.forEach(attr => {
      const [attrName, attrType] = attr.split(':#:')
      if (attrType == 'paragraph') {
        attrs[attrName] = this.state.description[attrName]
      } else {
        const val = ReactDOM.findDOMNode(this.refs[`${attr}Input`]).value
        attrs[attr] = val
      }
    })
    this.props.actions.editCharacter(this.props.character.id, {name, description, notes, ...attrs})
    this.setState({editing: false})
  }

  deleteCharacter = () => {
    let text = i18n('Do you want to delete this character: { character }?', {character: this.props.character.name})
    if (window.confirm(text)) {
      this.props.actions.deleteCharacter(this.props.character.id)
    }
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
              <ControlLabel>{i18n('Short Description')}</ControlLabel>
              <FormControl type='text' ref='descriptionInput'
                onKeyDown={this.handleEsc}
                onKeyPress={this.handleEnter}
                defaultValue={character.description} />
              <ControlLabel>{i18n('Notes')}</ControlLabel>
              <MDdescription
                description={character.notes}
                onChange={(desc) => this.setState({notes: desc})}
                useRCE={true}
                labels={{}}
                darkMode={false}
              />
            </FormGroup>
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

  renderCharacter () {
    let klasses = 'character-list__character'
    if (this.props.ui.darkMode) klasses += ' darkmode'
    const { character } = this.props
    const details = this.props.customAttributes.map((attr, idx) => {
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
    return (
      <div className={klasses} onClick={() => this.setState({editing: true})}>
        <h4 className='text-center secondary-text'>{character.name}</h4>
        <dl className='dl-horizontal'>
          <dt>{i18n('Description')}</dt>
          <dd>{character.description}</dd>
        </dl>
        {details}
        <dl className='dl-horizontal'>
          <dt>{i18n('Notes')}</dt>
          <dd>{character.notes}</dd>
        </dl>
        <dl className='dl-horizontal'>
          <dt>{i18n('Attached to')}</dt>
          <dd>{this.renderAssociations()}</dd>
        </dl>
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
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(CharacterActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CharacterView)
