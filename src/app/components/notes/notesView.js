import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import NoteListView from 'components/notes/noteListView'

class NotesView extends Component {

  render () {
    return (
      <div>
        <NoteListView />
      </div>
    )
  }
}

NotesView.propTypes = {}

export default NotesView
