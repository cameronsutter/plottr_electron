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
import AnalyzerTab from '../components/analyzer/AnalyzerTab'

class Body extends Component {
  render() {
    if (!this.props.fileIsLoaded) {
      return null
    }

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

      case 'analyzer':
        return <AnalyzerTab />

      case 'timeline':
      default:
        return <TimelineTab />
    }
  }
}

Body.propTypes = {
  currentView: PropTypes.string.isRequired,
  fileIsLoaded: PropTypes.bool,
}

function mapStateToProps(state) {
  return {
    currentView: selectors.currentViewSelector(state.present),
    fileIsLoaded: selectors.fileIsLoadedSelector(state.present),
  }
}

function mapDispatchToProps(dispatch) {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(Body)
