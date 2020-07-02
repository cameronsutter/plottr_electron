import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { Waypoint } from 'react-waypoint'
import CardView from 'components/outline/cardView'
import cx from 'classnames'
import { chapterTitle } from '../../helpers/chapters'

class ChapterView extends Component {
  renderCards () {
    return this.props.cards.map(c => <CardView key={c.id} card={c} />)
  }

  render () {
    const { chapter, ui, waypoint, cards, activeFilter } = this.props
    if (activeFilter && !cards.length) return null

    const klasses = cx('outline__scene-title', {darkmode: ui.darkMode})
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
  ui: PropTypes.object.isRequired,
  chapter: PropTypes.object.isRequired,
  cards: PropTypes.array.isRequired,
  waypoint: PropTypes.func.isRequired,
  activeFilter: PropTypes.bool.isRequired,
}

function mapStateToProps (state) {
  return {
    ui: state.present.ui,
  }
}

function mapDispatchToProps (dispatch) {
  return {}
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ChapterView)
