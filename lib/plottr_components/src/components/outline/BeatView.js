import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { Glyphicon } from 'react-bootstrap'
import { Waypoint } from 'react-waypoint'
import { t as i18n } from 'plottr_locales'
import UnconnectedCardView from './CardView'
import cx from 'classnames'
import { helpers } from 'pltr/v2'
import { FaCircle } from 'react-icons/fa'

const {
  card: { sortCardsInBeat },
  beats: { beatTitle },
  lists: { moveToAbove },
} = helpers

const BeatViewConnector = (connector) => {
  const CardView = UnconnectedCardView(connector)

  class BeatView extends Component {
    state = { sortedCards: [], inDropZone: false, dropDepth: 0 }

    static getDerivedStateFromProps(nextProps, nextState) {
      const { beat, cards, lines } = nextProps
      const sortedCards = sortCardsInBeat(beat.autoOutlineSort, cards, lines)
      return { sortedCards }
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
      const { cards, beat } = this.props
      if (cards[0].isEmpty || cards.length === 1) return
      if (beat.autoOutlineSort) return null

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
      if (!this.state.inDropZone) return
      if (!this.props.cards[0].isEmpty) return

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
        ui,
        waypoint,
        cards,
        activeFilter,
        positionOffset,
        hierarchyEnabled,
        isSeries,
        beatIndex,
      } = this.props
      if (activeFilter && !cards.length) return null

      const klasses = cx('outline__scene-title', { darkmode: ui.darkMode })

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
          >
            <h3 id={`beat-${beat.id}`} className={klasses}>
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
    ui: PropTypes.object.isRequired,
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
  const {
    beatIndexSelector,
    beatsByBookSelector,
    positionOffsetSelector,
    sortedLinesByBookSelector,
    sortedHierarchyLevels,
    beatHierarchyIsOn,
    isSeriesSelector,
  } = selectors

  const BeatActions = actions.beat
  const CardActions = actions.card

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(
      (state, ownProps) => {
        return {
          ui: state.present.ui,
          beats: beatsByBookSelector(state.present),
          beatIndex: beatIndexSelector(state.present, ownProps.beat.id),
          hierarchyLevels: sortedHierarchyLevels(state.present),
          lines: sortedLinesByBookSelector(state.present),
          positionOffset: positionOffsetSelector(state.present),
          hierarchyEnabled: beatHierarchyIsOn(state.present),
          isSeries: isSeriesSelector(state.present),
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
