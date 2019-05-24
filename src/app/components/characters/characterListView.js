import _ from 'lodash'
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Glyphicon, Nav, Navbar, NavItem, Button, Input, Label, Popover, OverlayTrigger, Alert } from 'react-bootstrap'
import Modal from 'react-modal'
import CustomAttrFilterList from 'components/customAttrFilterList'
import SortList from 'components/sortList'
import * as CharacterActions from 'actions/characters'
import * as CustomAttributeActions from 'actions/customAttributes'
import * as UIActions from 'actions/ui'
import CharacterView from 'components/characters/characterView'
import CustomAttrItem from 'components/customAttrItem'
import i18n from 'format-message'

const modalStyles = {content: {top: '70px', width: '50%', marginLeft: '25%'}}

class CharacterListView extends Component {
  constructor (props) {
    super(props)
    let id = null
    let visible = []
    const { characterSort, characterFilter } = props.ui
    if (props.characters.length > 0) {
      visible = this.visibleCharacters(props.characters, characterFilter, characterSort)
      id = this.detailID(visible)
    }
    this.state = {
      dialogOpen: false,
      addAttrText: '',
      characterDetailId: id,
      visibleCharacters: visible,
    }
  }

  componentWillReceiveProps (nextProps) {
    let visible = []
    let detailID = null
    const { characterSort, characterFilter } = nextProps.ui
    if (nextProps.characters.length > 0) {
      visible = this.visibleCharacters(nextProps.characters, characterFilter, characterSort)
      detailID = this.detailID(visible)
    }
    this.setState({
      visibleCharacters: visible,
      characterDetailId: detailID,
    })
  }

  componentDidUpdate () {
    if (this.refs.attrInput) {
      var input = this.refs.attrInput.getInputDOMNode()
      input.focus()
    }
  }

  visibleCharacters (characters, filter, sort) {
    let visible = characters
    if (!this.filterIsEmpty(filter)) {
      visible = []
      characters.forEach(ch => {
        Object.keys(filter).forEach(attr => {
          filter[attr.split(':#:')[0]].forEach(val => {
            if (val == '') {
              if (!ch[attr] || ch[attr] == '') visible.push(ch)
            } else {
              if (ch[attr] && ch[attr] == val) visible.push(ch)
            }
          })
        })
      })
    }

    let sortOperands = sort.split('~')
    let attrName = sortOperands[0]
    let direction = sortOperands[1]
    let sortBy = attrName === 'name' ? [attrName, 'id'] : [attrName, 'name']
    let sorted = _.sortBy(visible, sortBy)
    if (direction == 'desc') sorted.reverse()
    return sorted
  }

  detailID (characters) {
    if (characters.length == 0) return null

    let id = characters[0].id

    // check for the currently active one
    if (this.state && this.state.characterDetailId != null) {
      let activeCharacter = characters.find(ch => ch.id === this.state.characterDetailId)
      if (activeCharacter) id = activeCharacter.id
    }

    // check for a newly created one
    let newCharacter = characters.find(ch => ch.name === '')
    if (newCharacter) id = newCharacter.id

    return id
  }

  filterIsEmpty = (filter) => {
    if (!filter) return true
    let numFiltered = this.props.customAttributes.reduce((num, attr) => {
      let attrName = attr.split(':#:')[0]
      if (filter[attrName]) num += filter[attrName].length
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

  removeAttr = (attr) => {
    this.props.customAttributeActions.removeCharacterAttr(attr)
    this.setState({addAttrText: this.state.addAttrText}) // no op
  }

  updateAttr = (index, attr) => {
    let old = this.props.customAttributes[index]
    this.props.customAttributeActions.editCharacterAttr(index, attr, old)
  }

  renderSubNav () {
    let subNavKlasses = 'subnav__container'
    if (this.props.ui.darkMode) subNavKlasses += ' darkmode'
    let filterPopover = <Popover id='filter'>
      <CustomAttrFilterList type={'characters'}/>
    </Popover>
    let filterDeclaration = <Alert bsStyle="warning">{i18n('Character list is filtered')}</Alert>
    if (this.filterIsEmpty(this.props.ui.characterFilter)) {
      filterDeclaration = <span></span>
    }
    let sortPopover = <Popover id='sort'>
      <SortList type={'characters'} />
    </Popover>
    let sortGlyph = 'sort-by-attributes'
    if (this.props.ui.characterSort.includes('~desc')) sortGlyph = 'sort-by-attributes-alt'
    return (
      <Navbar className={subNavKlasses}>
        <Nav bsStyle='pills' >
          <NavItem>
            <Button bsSize='small' onClick={() => this.setState({dialogOpen: true})}><Glyphicon glyph='list' /> {i18n('Custom Attributes')}</Button>
          </NavItem>
          <NavItem>
            <OverlayTrigger containerPadding={20} trigger='click' rootClose placement='bottom' overlay={filterPopover}>
              <Button bsSize='small'><Glyphicon glyph='filter' /> {i18n('Filter')}</Button>
            </OverlayTrigger>
            {filterDeclaration}
          </NavItem>
          <NavItem>
            <OverlayTrigger containerPadding={20} trigger='click' rootClose placement='bottom' overlay={sortPopover}>
              <Button bsSize='small'><Glyphicon glyph={sortGlyph} /> {i18n('Sort')}</Button>
            </OverlayTrigger>
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
        <p className='list-group-item-text'>{ch.description.substr(0, 100)}</p>
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
    )
    if (character) {
      return <CharacterView key={`character-${character.id}`} character={character} />
    } else {
      return null
    }
  }

  renderCustomAttributes () {
    const attrs = this.props.customAttributes.map((attr, idx) => <CustomAttrItem key={idx} attr={attr} index={idx} update={this.updateAttr} delete={this.removeAttr}/> )
    let klasses = 'custom-attributes__wrapper'
    if (this.props.ui.darkMode) {
      klasses += ' darkmode'
      modalStyles.content.backgroundColor = '#888'
    }
    return (<Modal isOpen={this.state.dialogOpen} onRequestClose={this.closeDialog} style={modalStyles}>
      <div className={klasses}>
        <Button className='pull-right card-dialog__close' onClick={this.closeDialog}>
          {i18n('Close')}
        </Button>
        <h3>{i18n('Custom Attributes for Characters')}</h3>
        <p className='sub-header'>{i18n('Choose what you want to track about your characters')}</p>
        <div className='character-list__custom-attributes-add-button'>
          <Input type='text' ref='attrInput'
            label='Add attributes' value={this.state.addAttrText}
            onChange={this.handleType} onKeyDown={this.handleAddCustomAttr} />
          <Button bsStyle='success' onClick={this.saveAttr}>
            {i18n('Add')}
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
        <h1 className={klasses}>{i18n('Characters')}</h1>
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
    customAttributeActions: bindActionCreators(CustomAttributeActions, dispatch),
    uiActions: bindActionCreators(UIActions, dispatch),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CharacterListView)
