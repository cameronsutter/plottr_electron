import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { Row, Cell } from 'react-sticky-table'
import { Glyphicon } from 'react-bootstrap'
import UnconnectedBeatTitleCell from './BeatTitleCell'
import UnconnectedLineTitleCell from './LineTitleCell'
import UnconnectedBeatInsertCell from './BeatInsertCell'
import { helpers } from 'pltr/v2'

import { checkDependencies } from '../checkDependencies'

const {
  beats: { nextId, hasChildren },
  lists: { reorderList },
  orientedClassName: { orientedClassName },
} = helpers

const TopRowConnector = (connector) => {
  const BeatTitleCell = UnconnectedBeatTitleCell(connector)
  const LineTitleCell = UnconnectedLineTitleCell(connector)
  const BeatInsertCell = UnconnectedBeatInsertCell(connector)

  class TopRow extends Component {
    constructor(props) {
      super(props)
      this.state = {
        hovering: null,
      }
    }

    handleReorderBeats = (droppedPositionId, originalPositionId) => {
      const { currentTimeline, beatActions } = this.props
      beatActions.reorderBeats(originalPositionId, droppedPositionId, currentTimeline)
    }

    handleReorderLines = (originalPosition, droppedPosition) => {
      const { currentTimeline, lineActions, lines } = this.props
      const newLines = reorderList(originalPosition, droppedPosition, lines)
      lineActions.reorderLines(newLines, currentTimeline)
    }

    startHovering = (beat) => {
      this.setState({ hovering: beat })
      return beat
    }

    stopHovering = () => {
      this.setState({ hovering: null })
      return null
    }

    handleInsertNewBeat = (peerBeatId) => {
      const { currentTimeline, beatActions } = this.props
      beatActions.insertBeat(currentTimeline, peerBeatId)
    }

    handleInsertChildBeat = (beatToLeftId) => {
      const { currentTimeline, beatActions } = this.props
      beatActions.expandBeat(beatToLeftId, currentTimeline)
      beatActions.addBeat(currentTimeline, beatToLeftId)
    }

    handleAppendBeat = () => {
      const { currentTimeline, beatActions } = this.props
      beatActions.addBeat(currentTimeline)
    }

    handleAppendLine = () => {
      const { currentTimeline, lineActions } = this.props
      lineActions.addLine(currentTimeline)
    }

    renderSecondLastInsertBeatCell() {
      const { currentTimeline, orientation, isLarge, booksBeats, beats, beatActions } = this.props
      if (!isLarge) return null

      const lastBeat = !beats || beats.length === 0 ? null : beats[beats.length - 1]
      return (
        <BeatInsertCell
          key="second-last-insert"
          isInBeatList={true}
          handleInsert={this.handleInsertNewBeat}
          beatToLeft={lastBeat}
          handleInsertChild={
            lastBeat && hasChildren(booksBeats, lastBeat && lastBeat.id)
              ? undefined
              : this.handleInsertChildBeat
          }
          expanded={lastBeat && lastBeat.expanded}
          toggleExpanded={() => {
            if (lastBeat && lastBeat.expanded) {
              beatActions.collapseBeat(lastBeat.id, currentTimeline)
            } else beatActions.expandBeat(lastBeat.id, currentTimeline)
          }}
          orientation={orientation}
          hovering={this.state.hovering}
          onMouseEnter={() => this.startHovering(lastBeat.id)}
          onMouseLeave={this.stopHovering}
        />
      )
    }

    renderLastInsertBeatCell() {
      const { orientation } = this.props
      return (
        <BeatInsertCell
          key="last-insert"
          handleInsert={this.handleAppendBeat}
          isInBeatList={true}
          isLast={true}
          orientation={orientation}
        />
      )
    }

    renderBeats() {
      const {
        currentTimeline,
        orientation,
        booksBeats,
        beats,
        beatActions,
        isLarge,
        isMedium,
        isSmall,
      } = this.props
      const beatToggler = (beat) => () => {
        if (!beat) return
        if (beat.expanded) beatActions.collapseBeat(beat.id, currentTimeline)
        else beatActions.expandBeat(beat.id, currentTimeline)
      }
      const renderedBeats = beats.flatMap((beat, idx) => {
        const lastBeat = beats[idx - 1]
        const cells = []
        if (isLarge || (isMedium && idx === 0)) {
          cells.push(
            <BeatInsertCell
              isFirst={idx === 0}
              key={`beatId-${beat.id}-insert`}
              isInBeatList={true}
              beatToLeft={lastBeat}
              handleInsert={this.handleInsertNewBeat}
              handleInsertChild={this.handleInsertChildBeat}
              expanded={lastBeat && lastBeat.expanded}
              toggleExpanded={beatToggler(lastBeat)}
              orientation={orientation}
              // this hovering state is the id of the card the user is currently hovering over
              hovering={this.state.hovering}
              onMouseEnter={() => this.startHovering(beat.id)}
              onMouseLeave={this.stopHovering}
            />
          )
        }
        cells.push(
          <BeatTitleCell
            isFirst={idx === 0}
            key={`beatId-${beat.id}`}
            beatId={beat.id}
            handleReorder={this.handleReorderBeats}
            handleInsert={this.handleInsertNewBeat}
            handleInsertChild={
              lastBeat && hasChildren(booksBeats, lastBeat && lastBeat.id)
                ? undefined
                : this.handleInsertChildBeat
            }
            hovering={this.state.hovering}
            onMouseEnter={() => this.startHovering(beat.id)}
            onMouseLeave={this.stopHovering}
          />
        )
        return cells
      })
      if (isSmall) {
        return [...renderedBeats, this.renderLastInsertBeatCell()]
      } else if (!beats.length) {
        return [<Cell key="placeholder" />, this.renderLastInsertBeatCell()]
      } else {
        return [<Cell key="placeholder" />, ...renderedBeats, this.renderSecondLastInsertBeatCell()]
      }
    }

    renderLines() {
      const { lines, currentTimeline, orientation, isSmall, isLarge } = this.props
      const renderedLines = lines.map((line) => (
        <LineTitleCell
          key={`line-${line.id}`}
          line={line}
          handleReorder={this.handleReorderLines}
          bookId={currentTimeline}
        />
      ))
      const insertLineDiv = (
        <div
          className={orientedClassName('line-list__append-line', orientation)}
          onClick={this.handleAppendLine}
        >
          <div className={orientedClassName('line-list__append-line-wrapper', orientation)}>
            <Glyphicon glyph="plus" />
          </div>
        </div>
      )

      if (isSmall) {
        const insertLineTH = (
          <th key="insert-line" className="rotate-45">
            {insertLineDiv}
          </th>
        )
        return [...renderedLines, insertLineTH]
      }

      let finalArray = [<Cell key="placeholder" />, ...renderedLines]
      if (isLarge) {
        const insertLineCell = (
          <Row key="insert-line">
            <Cell>{insertLineDiv}</Cell>
          </Row>
        )
        finalArray = [...finalArray, insertLineCell]
      }
      return finalArray
    }

    render() {
      const { orientation, isSmall } = this.props
      let body = null
      if (orientation === 'horizontal') body = this.renderBeats()
      else body = this.renderLines()

      if (isSmall) {
        return (
          <thead>
            <tr>
              <th></th>
              {body}
            </tr>
          </thead>
        )
      } else {
        return <Row>{body}</Row>
      }
    }
  }

  TopRow.propTypes = {
    currentTimeline: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    orientation: PropTypes.string.isRequired,
    isSeries: PropTypes.bool,
    isSmall: PropTypes.bool,
    isMedium: PropTypes.bool,
    isLarge: PropTypes.bool,
    beats: PropTypes.array,
    booksBeats: PropTypes.object,
    nextBeatId: PropTypes.number,
    hovering: PropTypes.number,
    lines: PropTypes.array,
    lineActions: PropTypes.object,
    beatActions: PropTypes.object,
  }

  const {
    redux,
    pltr: { actions, selectors },
  } = connector
  checkDependencies({ redux, actions, selectors })

  const LineActions = actions.line
  const BeatActions = actions.beat

  const {
    visibleSortedBeatsByBookSelector,
    sortedLinesByBookSelector,
    beatsByBookSelector,
    isSeriesSelector,
    isLargeSelector,
    isMediumSelector,
    isSmallSelector,
    currentTimelineSelector,
    orientationSelector,
  } = selectors

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(
      (state) => {
        const nextBeatId = nextId(state.present.beats)

        return {
          currentTimeline: currentTimelineSelector(state.present),
          orientation: orientationSelector(state.present),
          isSeries: isSeriesSelector(state.present),
          isSmall: isSmallSelector(state.present),
          isMedium: isMediumSelector(state.present),
          isLarge: isLargeSelector(state.present),
          beats: visibleSortedBeatsByBookSelector(state.present),
          booksBeats: beatsByBookSelector(state.present),
          nextBeatId: nextBeatId,
          lines: sortedLinesByBookSelector(state.present),
        }
      },
      (dispatch) => {
        return {
          lineActions: bindActionCreators(LineActions, dispatch),
          beatActions: bindActionCreators(BeatActions, dispatch),
        }
      }
    )(TopRow)
  }

  throw new Error('Could not connect TopRow')
}

export default TopRowConnector
