import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { Waypoint } from 'react-waypoint'
import CardView from 'components/outline/cardView'
import cx from 'classnames'
import { chapterTitle } from '../../helpers/chapters'

class ChapterView extends Component {
  renderCards () {
    return this.props.cards.map(c =>
      <CardView key={c.id} card={c} />
    )
  }

  render () {
    const { chapter, ui, waypoint } = this.props
    const klasses = cx('outline__scene_title', {darkmode: ui.darkMode})
    return (
      <Waypoint onEnter={() => waypoint(chapter.id)} scrollableAncestor={window} topOffset={"60%"} bottomOffset={"60%"}>
        <div>
          <h3 id={`chapter-${chapter.id}`} className={klasses}>{chapterTitle(chapter)}</h3>
          {this.renderCards()}
        </div>
      </Waypoint>
    )
  }
}

ChapterView.propTypes = {
  chapter: PropTypes.object.isRequired,
  cards: PropTypes.array.isRequired,
  waypoint: PropTypes.func.isRequired,
  ui: PropTypes.object.isRequired,
}

function mapStateToProps (state) {
  return {
    ui: state.ui,
  }
}

function mapDispatchToProps (dispatch) {
  return {}
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ChapterView)
