import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { FaCircle } from 'react-icons/fa'
import cx from 'classnames'

import { helpers } from 'pltr/v2'
import { t as i18n } from 'plottr_locales'

import Glyphicon from '../Glyphicon'
import UnconnectedCardView from './CardView'
import { checkDependencies } from '../checkDependencies'

const {
  card: { sortCardsInBeat },
  beats: { beatTitle },
  lists: { moveToAbove },
} = helpers

const BeatViewConnector = (connector) => {
  const CardView = UnconnectedCardView(connector)

  class BeatView extends Component {
    state = { sortedCards: [], inDropZone: false, dropDepth: 0, cardsToRender: 0 }

    updateCardsToRender() {
      if (this.state.cardsToRender >= this.props.cards.length) return

      window.requestIdleCallback(() => {
        this.setState({ cardsToRender: this.state.cardsToRender + 1 })
        this.updateCardsToRender()
      })
    }

    componentDidUpdate() {
      if (this.props.cards.length >= this.state.cardsToRender) {
        this.updateCardsToRender()
      }
    }

    componentDidMount() {
      this.updateCardsToRender()
    }

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
      return this.state.sortedCards
        .slice(0, this.state.cardsToRender)
        .map((c, idx) => <CardView key={c.id} card={c} index={idx} reorder={this.reorderCards} />)
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

    render() {
      const {
        beat,
        beats,
        hierarchyLevels,
        darkMode,
        cards,
        activeFilter,
        positionOffset,
        beatIndex,
      } = this.props
      if (activeFilter && !cards.length) return null

      const klasses = cx('outline__scene-title', { darkmode: darkMode })

      return (
        <div
          onDragLeave={this.handleDragLeave}
          onDragEnter={this.handleDragEnter}
          onDragOver={this.handleDragOver}
          onDrop={this.handleDrop}
          ref={this.beatRef}
        >
          <h3 id={`beat-${beat.id}`} className={klasses} ref={this.titleRef}>
            {beatTitle(beatIndex, beats, beat, hierarchyLevels, positionOffset)}
            {this.renderDropZone()}
            {this.renderManualSort()}
          </h3>
          {this.renderCards()}
        </div>
      )
    }
  }

  BeatView.propTypes = {
    beat: PropTypes.object.isRequired,
    beats: PropTypes.object.isRequired,
    beatIndex: PropTypes.number.isRequired,
    hierarchyLevels: PropTypes.array.isRequired,
    cards: PropTypes.array.isRequired,
    activeFilter: PropTypes.bool.isRequired,
    currentTimeline: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    darkMode: PropTypes.bool,
    lines: PropTypes.array.isRequired,
    positionOffset: PropTypes.number.isRequired,
    beatActions: PropTypes.object,
    actions: PropTypes.object,
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
