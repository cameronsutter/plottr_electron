import React, { Component, createRef } from 'react'
import PropTypes from 'react-proptypes'
import { Glyphicon } from 'react-bootstrap'
import { Waypoint } from 'react-waypoint'
import { t as i18n } from 'plottr_locales'
import UnconnectedCardView from './CardView'
import cx from 'classnames'
import { helpers } from 'pltr/v2'
import { FaCircle } from 'react-icons/fa'

import { checkDependencies } from '../checkDependencies'

const {
  card: { sortCardsInBeat },
  beats: { beatTitle },
  lists: { moveToAbove },
} = helpers

const BeatViewConnector = (connector) => {
  const CardView = UnconnectedCardView(connector)

  class BeatView extends Component {
    state = { sortedCards: [], inDropZone: false, dropDepth: 0, clickedOutside: false }
    beatRef = createRef()
    titleRef = createRef()

    static getDerivedStateFromProps(nextProps, nextState) {
      const { beat, cards, lines } = nextProps
      const sortedCards = sortCardsInBeat(beat.autoOutlineSort, cards, lines)
      return { sortedCards }
    }

    autoSortBeat = () => {
      const { beatActions, beat, currentTimeline } = this.props
      beatActions.autoSortBeat(beat.id, currentTimeline)
    }

    reorderCards = ({ current, currentIndex, dropped }) => {
      const { sortedCards } = this.state
      const { beat, actions, currentTimeline } = this.props
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
          const cardIdsInLine = sortedCards
            .filter((c) => c.lineId == currentLineId)
            .map((c) => c.id)
          const currentPosition = sortedCards.find((c) => c.id == dropped.cardId).positionWithinLine
          newOrderWithinLine = moveToAbove(
            currentPosition,
            current.positionWithinLine,
            cardIdsInLine
          )
        }
        actions.reorderCardsInBeat(
          beat.id,
          currentLineId,
          newOrderInBeat,
          newOrderWithinLine,
          undefined,
          currentTimeline
        )
      } else {
        // dropped in from a different beat
        if (dropped.lineId == currentLineId) {
          // if same line, can just update positionWithinLine
          let cardIdsWithinLine = sortedCards
            .filter((c) => c.lineId == currentLineId)
            .map((c) => c.id)

          if (cardIdsWithinLine.length === 1) {
            cardIdsWithinLine = [dropped.cardId]
          } else {
            cardIdsWithinLine.splice(current.positionWithinLine, 0, dropped.cardId)
          }
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
            currentTimeline
          )
        }
      }
    }

    renderManualSort() {
      const { cards, beat } = this.props
      if (cards.length === 0 || cards[0].isEmpty || cards.length === 1) return null
      if (beat.autoOutlineSort) return null

      return (
        <small className="outline__beat-manual-sort" onClick={this.autoSortBeat}>
          {i18n('Manually Sorted')} <Glyphicon glyph="remove-sign" />
        </small>
      )
    }

    renderCards() {
      return this.state.sortedCards.map((c, idx) => (
        <CardView
          key={c.id}
          card={c}
          index={idx}
          reorder={this.reorderCards}
          isClickedOutside={this.state.clickedOutside}
        />
      ))
    }

    handleDragEnter = () => {
      this.setState({ dropDepth: this.state.dropDepth + 1 })
    }

    handleDragOver = (e) => {
      e.preventDefault()
      this.setState({ inDropZone: true })
    }

    handleDragLeave = () => {
      let { dropDepth } = this.state
      --dropDepth
      this.setState({ dropDepth: dropDepth })

      if (dropDepth > 0) return
      this.setState({ inDropZone: false })
    }

    handleDrop = (e) => {
      e.stopPropagation()
      e.preventDefault()
      this.setState({ inDropZone: false, dropDepth: 0 })

      const json = e.dataTransfer.getData('text/json')
      const droppedData = JSON.parse(json)
      if (!droppedData.cardId) return

      this.reorderCards({
        current: droppedData,
        currentIndex: droppedData.index,
        dropped: droppedData,
      })
    }

    renderDropZone = () => {
      if (!this.state.inDropZone) return null
      if (this.props.cards.length === 0 || !this.props.cards[0].isEmpty) return null

      return (
        <div className="outline__card-drop">
          <FaCircle />
        </div>
      )
    }

    componentDidMount() {
      document.addEventListener('click', this.handleClickOutside, true)
    }

    componentWillUnmount() {
      document.removeEventListener('click', this.handleClickOutside, true)
    }

    handleClickOutside = (e) => {
      // FIXME: this event causes a cascade of events that's *very*
      // expensive.  The purpose is to save the card that we're
      // editing.  It might be better to have that component
      // communicate that it's being edited to the redux store and
      // then, when we hit this point we can decide whether or not to
      // save the card on its behalf.
      if (this.titleRef.current && this.titleRef.current.contains(e.target)) {
        this.setState({ clickedOutside: true }, () => {
          this.setState({ clickedOutside: false })
        })
      } else if (this.beatRef.current && !this.beatRef.current.contains(e.target)) {
        this.setState({ clickedOutside: true }, () => {
          this.setState({ clickedOutside: false })
        })
      }
    }

    render() {
      const {
        beat,
        beats,
        hierarchyLevels,
        darkMode,
        waypoint,
        cards,
        activeFilter,
        positionOffset,
        hierarchyEnabled,
        isSeries,
        beatIndex,
      } = this.props
      if (activeFilter && !cards.length) return null

      const klasses = cx('outline__scene-title', { darkmode: darkMode })

      return (
        <Waypoint
          onEnter={() => waypoint(beat.id)}
          scrollableAncestor={window}
          topOffset={'60%'}
          bottomOffset={'60%'}
        >
          <div
            onDragLeave={this.handleDragLeave}
            onDragEnter={this.handleDragEnter}
            onDragOver={this.handleDragOver}
            onDrop={this.handleDrop}
            ref={this.beatRef}
          >
            <h3 id={`beat-${beat.id}`} className={klasses} ref={this.titleRef}>
              {beatTitle(
                beatIndex,
                beats,
                beat,
                hierarchyLevels,
                positionOffset,
                hierarchyEnabled,
                isSeries
              )}
              {this.renderDropZone()}
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
    beatIndex: PropTypes.number.isRequired,
    hierarchyLevels: PropTypes.array.isRequired,
    cards: PropTypes.array.isRequired,
    waypoint: PropTypes.func.isRequired,
    activeFilter: PropTypes.bool.isRequired,
    currentTimeline: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    darkMode: PropTypes.bool,
    lines: PropTypes.array.isRequired,
    positionOffset: PropTypes.number.isRequired,
    beatActions: PropTypes.object,
    actions: PropTypes.object,
    hierarchyEnabled: PropTypes.bool,
    isSeries: PropTypes.bool,
  }

  const {
    redux,
    pltr: { selectors, actions },
  } = connector

  const BeatActions = actions.beat
  const CardActions = actions.card

  checkDependencies({
    redux,
    selectors,
    actions,
    BeatActions,
    CardActions,
  })

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(
      (state, ownProps) => {
        return {
          darkMode: selectors.isDarkModeSelector(state.present),
          beats: selectors.beatsByBookSelector(state.present),
          beatIndex: selectors.beatIndexSelector(state.present, ownProps.beat.id),
          hierarchyLevels: selectors.sortedHierarchyLevels(state.present),
          lines: selectors.sortedLinesByBookSelector(state.present),
          positionOffset: selectors.positionOffsetSelector(state.present),
          hierarchyEnabled: selectors.beatHierarchyIsOn(state.present),
          isSeries: selectors.isSeriesSelector(state.present),
          currentTimeline: selectors.currentTimelineSelector(state.present),
        }
      },
      (dispatch) => {
        return {
          actions: bindActionCreators(CardActions, dispatch),
          beatActions: bindActionCreators(BeatActions, dispatch),
        }
      }
    )(BeatView)
  }

  throw new Error('Could not connect BeatView')
}

export default BeatViewConnector
