import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Glyphicon } from 'react-bootstrap'
import * as CharacterActions from 'actions/characters'
import CharacterView from 'components/characters/characterView'

class CharacterListView extends Component {

  handleCreateNewCharacter () {
    this.props.actions.addCharacter()
  }

  renderCharacters () {
    return this.props.characters.map(ch =>
      <CharacterView key={ch.id} character={ch} />
    )
  }

  render () {
    return (
      <div className='character-list'>
        <h3>Characters</h3>
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
  actions: PropTypes.object.isRequired
}

function mapStateToProps (state) {
  return {
    characters: state.characters
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
)(CharacterListView)
