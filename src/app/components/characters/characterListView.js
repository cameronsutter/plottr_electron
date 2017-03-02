import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Glyphicon, Nav, Navbar, NavItem, Button, Input, Label } from 'react-bootstrap'
import Modal from 'react-modal'
import * as CharacterActions from 'actions/characters'
import * as CustomAttributeActions from 'actions/customAttributes'
import CharacterView from 'components/characters/characterView'

const modalStyles = {content: {top: '70px'}}

class CharacterListView extends Component {

  constructor (props) {
    super(props)
    this.state = {dialogOpen: false, addAttrText: ''}
  }

  closeDialog () {
    this.setState({dialogOpen: false})
  }

  handleCreateNewCharacter () {
    this.props.actions.addCharacter()
  }

  handleType () {
    const attr = this.refs.attrInput.getValue()
    this.setState({addAttrText: attr})
  }

  handleAddCustomAttr (event) {
    if (event.which === 13) {
      const attr = this.refs.attrInput.getValue()
      this.props.customAttributeActions.addCharacterAttr(attr)
      this.setState({addAttrText: ''})
    }
  }

  removeAttr (attr) {
    this.props.customAttributeActions.removeCharacterAttr(attr)
    this.setState({addAttrText: this.state.addAttrText}) // no op
  }

  renderSubNav () {
    return (
      <Navbar className='subnav__container'>
        <Nav bsStyle='pills' >
          <NavItem>
            <Button bsSize='small' onClick={() => this.setState({dialogOpen: true})}><Glyphicon glyph='list' /> Custom Attributes</Button>
          </NavItem>
        </Nav>
      </Navbar>
    )
  }

  renderCharacters () {
    return this.props.characters.map(ch =>
      <CharacterView key={ch.id} character={ch} />
    )
  }

  renderCustomAttributes () {
    const attrs = this.props.customAttributes.map((attr, idx) =>
      <li className='list-group-item' key={idx}>
        <p className='character-list__attribute-name'>{attr}</p>
        <Button onClick={() => this.removeAttr(attr)}><Glyphicon glyph='remove'/></Button>
      </li>
    )
    return (<Modal isOpen={this.state.dialogOpen} onRequestClose={this.closeDialog.bind(this)} style={modalStyles}>
      <div>
        <h3>Custom Attributes for Characters</h3>
        <p className='lead'>Choose what you want to track about your characters</p>
        <div className='character-list__custom-attributes-add-button'>
          <Input type='text' ref='attrInput' label='Add attributes' value={this.state.addAttrText} onChange={this.handleType.bind(this)} onKeyDown={this.handleAddCustomAttr.bind(this)} />
        </div>
        <div className='character-list__custom-attributes-list-wrapper'>
          {attrs}
        </div>
      </div>
    </Modal>)
  }

  render () {
    return (
      <div className='character-list container-with-sub-nav'>
        {this.renderSubNav()}
        <h3>Characters</h3>
        {this.renderCustomAttributes()}
        {this.renderCharacters()}
        <div className='character-list__new' onClick={this.handleCreateNewCharacter.bind(this)} >
          <Glyphicon glyph='plus' />
        </div>
      </div>
    )
  }
}

CharacterListView.propTypes = {
  characters: PropTypes.array.isRequired,
  customAttributes: PropTypes.array.isRequired,
  actions: PropTypes.object.isRequired,
  customAttributeActions: PropTypes.object.isRequired
}

function mapStateToProps (state) {
  return {
    characters: state.characters,
    customAttributes: state.customAttributes['characters']
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
