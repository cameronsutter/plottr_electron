import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import OutlineTab from 'components/outline/OutlineTab'
import TagsTab from 'components/tag/TagsTab'
import CharactersTab from 'components/characters/CharactersTab'
import PlacesTab from 'components/places/PlacesTab'
import NotesTab from 'components/notes/NotesTab'
import TimelineTab from '../components/timeline/TimelineTab'
import SeriesTab from '../components/story/SeriesTab'
import ExportTab from '../components/export/ExportTab'

class Body extends Component {
  render () {
    switch (this.props.currentView) {
      case 'story':
        return <SeriesTab />

      case 'timeline':
        return <TimelineTab/>

      case 'outline':
        return <OutlineTab />

      case 'notes':
        return <NotesTab />

      case 'tags':
        return <TagsTab />

      case 'characters':
        return <CharactersTab />

      case 'places':
        return <PlacesTab />

      case 'export':
        return <ExportTab />

      default:
        return <TimelineTab/>
    }
  }
}

Body.propTypes = {
  currentView: PropTypes.string.isRequired
}

function mapStateToProps (state) {
  return {
    currentView: state.present.ui.currentView
  }
}

function mapDispatchToProps (dispatch) {
  return {}
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Body)
