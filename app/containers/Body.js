import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import TimeLineView from 'components/timeline/timeLineView'
import OutlineView from 'components/outline/outlineView'
import NotesView from 'components/notes/notesView'

class Body extends Component {
  render () {
    return this.props.file.loaded ? this.renderBody() : this.renderLoading()
  }

  renderBody () {
    switch (this.props.currentView) {
      case 'timeline':
        return <TimeLineView />

      case 'outline':
        return <OutlineView />

      case 'notes':
        return <NotesView />

      default:
        return <TimeLineView />

    }
  }

  renderLoading () {
    return <p>Loading...</p>
  }

}

Body.propTypes = {
  file: PropTypes.object.isRequired,
  currentView: PropTypes.string.isRequired
}

function mapStateToProps (state) {
  return {
    file: state.file,
    currentView: state.ui.currentView
  }
}

function mapDispatchToProps (dispatch) {
  return {}
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Body)
