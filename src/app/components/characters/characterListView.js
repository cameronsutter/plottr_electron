import _ from 'lodash'
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Glyphicon, Nav, Navbar, NavItem, Button, Input, Label, Popover, OverlayTrigger, Alert } from 'react-bootstrap'
import Modal from 'react-modal'
import CustomAttrFilterList from 'components/customAttrFilterList'
import * as CharacterActions from 'actions/characters'
import * as CustomAttributeActions from 'actions/customAttributes'
import CharacterView from 'components/characters/characterView'

const modalStyles = {content: {top: '70px', width: '50%', marginLeft: '25%'}}

class CharacterListView extends Component {

  constructor (props) {
    super(props)
    let id = null
    let visible = []
    if (props.characters.length > 0) {
      visible = this.visibleCharacters(props.characters, null)
      id = this.detailID(visible)
    }
    this.state = {
      dialogOpen: false,
      addAttrText: '',
      characterDetailId: id,
      visibleCharacters: visible,
      filter: null,
    }
  }

  componentWillReceiveProps (nextProps) {
    if (nexProps.characters.length > 0) {
      let visible = this.visibleCharacters(nextProps.characters)
      this.setState({
        visibleCharacters: visible,
        characterDetailId: this.detailID(visible),
      })
    }
  }

  componentDidUpdate () {
    if (this.refs.attrInput) {
      var input = this.refs.attrInput.getInputDOMNode()
      input.focus()
    }
  }

  visibleCharacters (characters, filter) {
    let visible = characters
    if (!this.filterIsEmpty(filter)) {
      visible = []
      characters.forEach(ch => {
        Object.keys(filter).forEach(attr => {
          filter[attr].forEach(val => {
            if (val == '') {
              if (!ch[attr] || ch[attr] == '') visible.push(ch)
            } else {
              if (ch[attr] && ch[attr] == val) visible.push(ch)
            }
          })
        })
      })
    }
    return _.sortBy(visible, ['name', 'id'])
  }

  detailID (characters) {
    let id = characters[0].id
    let character = characters.find(ch => ch.name === '')
    if (character) id = character.id
    return id
  }

  updateFilter = (filter) => {
    if (this.props.characters.length > 0) {
      let visible = this.visibleCharacters(this.props.characters, filter)
      this.setState({
        visibleCharacters: visible,
        characterDetailId: this.detailID(visible),
        filter: filter,
      })
    }
  }

  filterIsEmpty = (filter) => {
    if (filter == null) return true
    let numFiltered = this.props.customAttributes.reduce((num, attrs) => {
      num += filter[attrs].length
      return num
    }, 0)
    return numFiltered == 0
  }

  closeDialog = () => {
    this.setState({dialogOpen: false})
  }

  handleCreateNewCharacter = () => {
    this.props.actions.addCharacter()
  }

  handleType = () => {
    const attr = this.refs.attrInput.getValue()
    this.setState({addAttrText: attr})
  }

  handleAddCustomAttr = (event) => {
    if (event.which === 13) {
      this.saveAttr()
    }
  }

  saveAttr = () => {
    const attr = this.refs.attrInput.getValue()
    this.props.customAttributeActions.addCharacterAttr(attr)
    this.setState({addAttrText: ''})
    var input = this.refs.attrInput.getInputDOMNode()
    input.focus()
  }

  removeAttr (attr) {
    this.props.customAttributeActions.removeCharacterAttr(attr)
    this.setState({addAttrText: this.state.addAttrText}) // no op
  }

  renderSubNav () {
    let subNavKlasses = 'subnav__container'
    if (this.props.ui.darkMode) subNavKlasses += ' darkmode'
    let popover = <Popover id='filter'>
      <CustomAttrFilterList type={'characters'} filteredItems={this.state.filter} updateItems={this.updateFilter}/>
    </Popover>
    let filterDeclaration = <Alert bsStyle="warning">Character list is filtered</Alert>
    if (this.filterIsEmpty(this.state.filter)) {
      filterDeclaration = <span></span>
    }
    return (
      <Navbar className={subNavKlasses}>
        <Nav bsStyle='pills' >
          <NavItem>
            <Button bsSize='small' onClick={() => this.setState({dialogOpen: true})}><Glyphicon glyph='list' /> Custom Attributes</Button>
          </NavItem>
          <NavItem>
            <OverlayTrigger containerPadding={20} trigger='click' rootClose placement='bottom' overlay={popover}>
              <Button bsSize='small'><Glyphicon glyph='filter' /> Filter</Button>
            </OverlayTrigger>
            {filterDeclaration}
          </NavItem>
        </Nav>
      </Navbar>
    )
  }

  renderCharacters () {
    let klasses = 'character-list__list list-group'
    if (this.props.ui.darkMode) klasses += ' darkmode'
    const characters = this.state.visibleCharacters.map((ch, idx) =>
      <a href='#' key={idx} className='list-group-item' onClick={() => this.setState({characterDetailId: ch.id})}>
        <h6 className='list-group-item-heading'>{ch.name}</h6>
        <p className='list-group-item-text'>{ch.description}</p>
      </a>
    )
    return (<div className={klasses}>
        {characters}
        <a href='#' key={'new-character'} className='character-list__new list-group-item' onClick={this.handleCreateNewCharacter} >
          <Glyphicon glyph='plus' />
        </a>
      </div>)
  }

  renderCharacterDetails () {
    let character = this.props.characters.find(char =>
      char.id === this.state.characterDetailId
    ) || this.props.characters[0]
    if (character) {
      return <CharacterView key={`character-${character.id}`} character={character} />
    } else {
      return null
    }
  }

  renderCustomAttributes () {
    const attrs = this.props.customAttributes.map((attr, idx) =>
      <li className='list-group-item' key={idx}>
        <p className='character-list__attribute-name'>{attr}</p>
        <Button onClick={() => this.removeAttr(attr)}><Glyphicon glyph='remove'/></Button>
      </li>
    )
    let klasses = 'custom-attributes__wrapper'
    if (this.props.ui.darkMode) {
      klasses += ' darkmode'
      modalStyles.content.backgroundColor = '#888'
    }
    return (<Modal isOpen={this.state.dialogOpen} onRequestClose={this.closeDialog} style={modalStyles}>
      <div className={klasses}>
        <Button className='pull-right card-dialog__close' onClick={this.closeDialog}>
          Close
        </Button>
        <h3>Custom Attributes for Characters</h3>
        <p className='sub-header'>Choose what you want to track about your characters</p>
        <div className='character-list__custom-attributes-add-button'>
          <Input type='text' ref='attrInput'
            label='Add attributes' value={this.state.addAttrText}
            onChange={this.handleType} onKeyDown={this.handleAddCustomAttr} />
          <Button bsStyle='success' onClick={this.saveAttr}>
            Add
          </Button>
        </div>
        <div className='character-list__custom-attributes-list-wrapper'>
          {attrs}
        </div>
      </div>
    </Modal>)
  }

  render () {
    let klasses = 'secondary-text'
    if (this.props.ui.darkMode) klasses += ' darkmode'
    return (
      <div className='character-list container-with-sub-nav'>
        {this.renderSubNav()}
        {this.renderCustomAttributes()}
        <h1 className={klasses}>Characters</h1>
        {this.renderCharacterDetails()}
        {this.renderCharacters()}
      </div>
    )
  }
}

CharacterListView.propTypes = {
  characters: PropTypes.array.isRequired,
  customAttributes: PropTypes.array.isRequired,
  actions: PropTypes.object.isRequired,
  customAttributeActions: PropTypes.object.isRequired,
  ui: PropTypes.object.isRequired,
}

function mapStateToProps (state) {
  return {
    characters: state.characters,
    customAttributes: state.customAttributes['characters'],
    ui: state.ui,
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(CharacterActions, dispatch),
    customAttributeActions: bindActionCreators(CustomAttributeActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CharacterListView)
