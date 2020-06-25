import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as CardActions from 'actions/cards'
import * as SceneActions from 'actions/scenes'
import * as BeatActions from 'actions/beats'
import { sortBy } from 'lodash'
import { Glyphicon } from 'react-bootstrap'
import { Waypoint } from 'react-waypoint'
import i18n from 'format-message'
import CardView from 'components/outline/cardView'
import cx from 'classnames'
import { chapterTitle } from '../../helpers/chapters'
import { reorderList } from '../../helpers/lists'
import { isSeriesSelector } from '../../selectors/ui'
import { sortCardsInChapter } from '../../helpers/cards'
import { sortedLinesByBookSelector } from '../../selectors/lines'
import { positionOffsetSelector } from '../../selectors/chapters'

class ChapterView extends Component {

  state = {sortedCards: []}

  static getDerivedStateFromProps (nextProps, nextState) {
    const { chapter, cards, lines, isSeries } = nextProps
    const sortedCards = sortCardsInChapter(chapter.autoOutlineSort, cards, lines, isSeries)
    return {sortedCards}
  }

  autoSortChapter = () => {
    const { chapterActions, beatActions, chapter, isSeries } = this.props
    if (isSeries) {
      beatActions.autoSortBeat(chapter.id)
    } else {
      chapterActions.autoSortChapter(chapter.id)
    }
  }

  reorderCards = ({current, currentIndex, dropped}) => {
    const { sortedCards } = this.state
    const { isSeries, chapter, actions } = this.props
    const currentIds = sortedCards.map(c => c.id)
    const currentLineId = isSeries ? current.seriesLineId : current.lineId
    let newOrderInChapter = []
    let newOrderWithinLine = null

    // already in chapter
    if (currentIds.includes(dropped.cardId)) {
      // flip it to manual sort
      newOrderInChapter = reorderList(currentIndex, dropped.index, currentIds)
      if (dropped.lineId == currentLineId) {
        // if same line, also update positionWithinLine
        const cardIdsInLine = sortedCards.filter(c => isSeries ? c.seriesLineId == currentLineId : c.lineId == currentLineId).map(c => c.id)
        const currentPosition = sortedCards.find(c => c.id == dropped.cardId).positionWithinLine
        newOrderWithinLine = reorderList(current.positionWithinLine, currentPosition, cardIdsInLine)
      }
      actions.reorderCardsInChapter(chapter.id, currentLineId, isSeries, newOrderInChapter, newOrderWithinLine)
    } else {
      // dropped in from a different chapter
      if (dropped.lineId == currentLineId) {
        // if same line, can just update positionWithinLine
        let cardIdsWithinLine = sortedCards.filter(c => isSeries ? c.seriesLineId == currentLineId : c.lineId == currentLineId).map(c => c.id)
        cardIdsWithinLine.splice(current.positionWithinLine, 0, dropped.cardId)
        actions.reorderCardsWithinLine(chapter.id, currentLineId, isSeries, cardIdsWithinLine)
      } else {
        // flip to manual sort
        newOrderInChapter = currentIds
        newOrderInChapter.splice(currentIndex, 0, dropped.cardId)
        actions.reorderCardsInChapter(chapter.id, currentLineId, isSeries, newOrderInChapter, null, dropped.cardId)
      }
    }
  }

  renderManualSort () {
    if (this.props.chapter.autoOutlineSort) return null

    return <small className='outline__chapter-manual-sort' onClick={this.autoSortChapter}>{i18n('Manually Sorted')}{' '}<Glyphicon glyph='remove-sign' /></small>
  }

  renderCards () {
    return this.state.sortedCards.map((c, idx) => <CardView key={c.id} card={c} index={idx} reorder={this.reorderCards} />)
  }

  render () {
    const { chapter, ui, waypoint, cards, activeFilter, positionOffset, isSeries } = this.props
    if (activeFilter && !cards.length) return null

    const klasses = cx('outline__scene-title', {darkmode: ui.darkMode})
    return (
      <Waypoint onEnter={() => waypoint(chapter.id)} scrollableAncestor={window} topOffset={"60%"} bottomOffset={"60%"}>
        <div>
          <h3 id={`chapter-${chapter.id}`} className={klasses}>{chapterTitle(chapter, positionOffset, isSeries)}{this.renderManualSort()}</h3>
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
  activeFilter: PropTypes.bool.isRequired,
  ui: PropTypes.object.isRequired,
  lines: PropTypes.array.isRequired,
  isSeries: PropTypes.bool.isRequired,
  positionOffset: PropTypes.number.isRequired,
}

function mapStateToProps (state) {
  return {
    ui: state.present.ui,
    lines: sortedLinesByBookSelector(state.present),
    isSeries: isSeriesSelector(state.present),
    positionOffset: positionOffsetSelector(state.present),
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(CardActions, dispatch),
    chapterActions: bindActionCreators(SceneActions, dispatch),
    beatActions: bindActionCreators(BeatActions, dispatch),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ChapterView)
