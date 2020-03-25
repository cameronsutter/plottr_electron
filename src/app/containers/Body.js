import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import OutlineView from 'components/outline/outlineView'
import TagsView from 'components/tag/TagsView'
import CharactersView from 'components/characters/charactersView'
import PlacesView from 'components/places/placesView'
import NotesView from 'components/notes/notesView'
import i18n from 'format-message'
import TimelineWrapper from '../components/timeline/TimelineWrapper'
import SeriesTab from '../components/story/SeriesTab'
import ExportTab from '../components/export/ExportTab'
import SETTINGS from '../../common/utils/settings'

class Body extends Component {
  constructor (props) {
    super(props)
    this.timeline = <TimelineWrapper/>
    this.outline = <OutlineView />
  }

  render () {
    return this.props.file.loaded ? this.renderBody() : this.renderLoading()
  }

  renderBody () {
    switch (this.props.currentView) {
      case 'story':
        if (!SETTINGS.get('premiumFeatures')) return this.timeline
        return <SeriesTab />

      case 'timeline':
        return this.timeline

      case 'outline':
        return this.outline

      case 'notes':
        return <NotesView />

      case 'tags':
        return <TagsView />

      case 'characters':
        return <CharactersView />

      case 'places':
        return <PlacesView />

      case 'export':
        return <ExportTab />

      default:
        return <TimelineWrapper />

    }
  }

  renderLoading () {
    return <p>{i18n('Loading...')}</p>
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
