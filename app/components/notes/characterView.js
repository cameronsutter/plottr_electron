import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { ButtonToolbar, Button, Input } from 'react-bootstrap'
import * as CharacterActions from 'actions/characters'

class CharacterView extends Component {
  constructor (props) {
    super(props)
    this.state = {editing: false}
  }

  saveEdit () {
    var newName = this.refs.nameInput.getValue() || this.props.character.name
    var newDescription = this.refs.descriptionInput.getValue() || this.props.character.description
    this.props.actions.editCharacter(this.props.character.id, newName, newDescription)
    this.setState({editing: false})
  }

  renderEditing () {
    return (
      <div>
        <Input type='text' ref='nameInput' label='character name' placeholder={this.props.character.name} />
        <Input type='text' ref='descriptionInput' label='character description' placeholder={this.props.character.description} />
        <ButtonToolbar>
          <Button bsStyle='danger'
            onClick={() => this.setState({editing: false})} >
            Cancel
          </Button>
          <Button bsStyle='success'
            onClick={this.saveEdit.bind(this)} >
            Save
          </Button>
        </ButtonToolbar>
      </div>
    )
  }

  renderCharacter () {
    return (
      <div>
        <h4>{this.props.character.name}</h4>
        <p>{this.props.character.description}</p>
      </div>
    )
  }

  render () {
    var body = this.state.editing ? this.renderEditing() : this.renderCharacter()
    return (
      <div className='character' onClick={() => this.setState({editing: true})} >
        {body}
      </div>
    )
  }
}

CharacterView.propTypes = {
  character: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired
}

function mapStateToProps (state) {
  return {}
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
