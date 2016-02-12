import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import CharacterListView from 'components/notes/characterListView'
import PlaceListView from 'components/notes/placeListView'
import TagListView from 'components/notes/tagListView'

class NotesView extends Component {

  render () {
    return (
      <div className='notes-view'>
        <CharacterListView />
        <PlaceListView />
        <TagListView />
      </div>
    )
  }
}

NotesView.propTypes = {}

function mapStateToProps (state) {
  return {}
}

function mapDispatchToProps (dispatch) {
  return {}
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NotesView)
