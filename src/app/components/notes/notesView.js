import React, { Component, PropTypes } from 'react'
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
