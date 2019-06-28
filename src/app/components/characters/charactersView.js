import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import CharacterListView from 'components/characters/characterListView'

class CharactersView extends Component {

  render () {
    return (
      <div className='characters-view'>
        <CharacterListView />
      </div>
    )
  }
}

CharactersView.propTypes = {}

function mapStateToProps (state) {
  return {}
}

function mapDispatchToProps (dispatch) {
  return {}
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CharactersView)
