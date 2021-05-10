import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Glyphicon } from 'react-bootstrap'
import { Waypoint } from 'react-waypoint'
import { t as i18n } from 'plottr_locales'
import CardView from 'components/outline/CardView'
import cx from 'classnames'
import { actions, helpers, selectors } from 'pltr/v2'

const {
  beatsByBookSelector,
  positionOffsetSelector,
  sortedLinesByBookSelector,
  sortedHierarchyLevels,
  beatHierarchyIsOn,
  isSeriesSelector,
} = selectors

const BeatActions = actions.beat
const CardActions = actions.card

const {
  card: { sortCardsInBeat },
  beats: { beatTitle, resetIndices },
  lists: { moveToAbove },
} = helpers

let idx

class BeatView extends Component {
  state = { sortedCards: [] }

  static getDerivedStateFromProps(nextProps, nextState) {
    const { beat, cards, lines } = nextProps
    const sortedCards = sortCardsInBeat(beat.autoOutlineSort, cards, lines)
    return { sortedCards }
  }

  componentDidMount() {
    idx = 0
  }

  autoSortBeat = () => {
    const { beatActions, beat, ui } = this.props
    beatActions.autoSortBeat(beat.id, ui.currentTimeline)
  }

  reorderCards = ({ current, currentIndex, dropped }) => {
    const { sortedCards } = this.state
    const { beat, actions, ui } = this.props
    const currentIds = sortedCards.map((c) => c.id)
    const currentLineId = current.lineId
    let newOrderInBeat = []
    let newOrderWithinLine = null

    // already in beat
    if (currentIds.includes(dropped.cardId)) {
      // flip it to manual sort
      newOrderInBeat = moveToAbove(dropped.index, currentIndex, currentIds)
      if (dropped.lineId == currentLineId) {
        // if same line, also update positionWithinLine
        const cardIdsInLine = sortedCards.filter((c) => c.lineId == currentLineId).map((c) => c.id)
        const currentPosition = sortedCards.find((c) => c.id == dropped.cardId).positionWithinLine
        newOrderWithinLine = moveToAbove(currentPosition, current.positionWithinLine, cardIdsInLine)
      }
      actions.reorderCardsInBeat(
        beat.id,
        currentLineId,
        newOrderInBeat,
        newOrderWithinLine,
        undefined,
        ui.currentTimeline
      )
    } else {
      // dropped in from a different beat
      if (dropped.lineId == currentLineId) {
        // if same line, can just update positionWithinLine
        let cardIdsWithinLine = sortedCards
          .filter((c) => c.lineId == currentLineId)
          .map((c) => c.id)
        cardIdsWithinLine.splice(current.positionWithinLine, 0, dropped.cardId)
        actions.reorderCardsWithinLine(beat.id, currentLineId, cardIdsWithinLine)
      } else {
        // flip to manual sort
        newOrderInBeat = currentIds
        newOrderInBeat.splice(currentIndex, 0, dropped.cardId)
        actions.reorderCardsInBeat(
          beat.id,
          currentLineId,
          newOrderInBeat,
          null,
          dropped.cardId,
          ui.currentTimeline
        )
      }
    }
  }

  renderManualSort() {
    if (this.props.beat.autoOutlineSort) return null

    return (
      <small className="outline__beat-manual-sort" onClick={this.autoSortBeat}>
        {i18n('Manually Sorted')} <Glyphicon glyph="remove-sign" />
      </small>
    )
  }

  renderCards() {
    return this.state.sortedCards.map((c, idx) => (
      <CardView key={c.id} card={c} index={idx} reorder={this.reorderCards} />
    ))
  }

  render() {
    const {
      beat,
      beats,
      hierarchyLevels,
      ui,
      waypoint,
      cards,
      activeFilter,
      positionOffset,
      hierarchyEnabled,
      isSeries,
    } = this.props
    if (activeFilter && !cards.length) return null

    const klasses = cx('outline__scene-title', { darkmode: ui.darkMode })
    if (idx === 0) resetIndices()
    idx++
    return (
      <Waypoint
        onEnter={() => waypoint(beat.id)}
        scrollableAncestor={window}
        topOffset={'60%'}
        bottomOffset={'60%'}
      >
        <div>
          <h3 id={`beat-${beat.id}`} className={klasses}>
            {beatTitle(beats, beat, hierarchyLevels, positionOffset, hierarchyEnabled, isSeries)}
            {this.renderManualSort()}
          </h3>
          {this.renderCards()}
        </div>
      </Waypoint>
    )
  }
}

BeatView.propTypes = {
  beat: PropTypes.object.isRequired,
  beats: PropTypes.object.isRequired,
  hierarchyLevels: PropTypes.array.isRequired,
  cards: PropTypes.array.isRequired,
  waypoint: PropTypes.func.isRequired,
  activeFilter: PropTypes.bool.isRequired,
  ui: PropTypes.object.isRequired,
  lines: PropTypes.array.isRequired,
  positionOffset: PropTypes.number.isRequired,
  beatActions: PropTypes.object,
  actions: PropTypes.object,
  hierarchyEnabled: PropTypes.bool,
  isSeries: PropTypes.bool,
}

function mapStateToProps(state) {
  return {
    ui: state.present.ui,
    beats: beatsByBookSelector(state.present),
    hierarchyLevels: sortedHierarchyLevels(state.present),
    lines: sortedLinesByBookSelector(state.present),
    positionOffset: positionOffsetSelector(state.present),
    hierarchyEnabled: beatHierarchyIsOn(state.present),
    isSeries: isSeriesSelector(state.present),
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(CardActions, dispatch),
    beatActions: bindActionCreators(BeatActions, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(BeatView)
