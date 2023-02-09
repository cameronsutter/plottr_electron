import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'

import { selectors } from 'pltr/v2'

import OutlineTab from 'components/outline/OutlineTab'
import TagsTab from 'components/tag/TagsTab'
import CharactersTab from 'components/characters/CharactersTab'
import PlacesTab from 'components/places/PlacesTab'
import NotesTab from 'components/notes/NotesTab'
import TimelineTab from '../components/timeline/TimelineTab'
import SeriesTab from '../components/project/SeriesTab'

class Body extends Component {
  render() {
    switch (this.props.currentView) {
      case 'project':
        return <SeriesTab />

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

      case 'timeline':
      default:
        return <TimelineTab />
    }
  }
}

Body.propTypes = {
  currentView: PropTypes.string.isRequired,
}

function mapStateToProps(state) {
  return {
    currentView: selectors.currentViewSelector(state.present),
  }
}

function mapDispatchToProps(dispatch) {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(Body)
