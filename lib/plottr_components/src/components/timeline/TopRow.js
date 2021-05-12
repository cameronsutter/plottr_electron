import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { Row, Cell } from 'react-sticky-table'
import { Glyphicon } from 'react-bootstrap'
import UnconnectedBeatTitleCell from './BeatTitleCell'
import UnconnectedLineTitleCell from './LineTitleCell'
import UnconnectedBeatInsertCell from './BeatInsertCell'
import { helpers } from 'pltr/v2'

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
      const { ui, beatActions } = this.props
      beatActions.reorderBeats(originalPositionId, droppedPositionId, ui.currentTimeline)
    }

    handleReorderLines = (originalPosition, droppedPosition) => {
      const { ui, lineActions, lines } = this.props
      const newLines = reorderList(originalPosition, droppedPosition, lines)
      lineActions.reorderLines(newLines, ui.currentTimeline)
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
      const { ui, beatActions } = this.props
      beatActions.insertBeat(ui.currentTimeline, peerBeatId)
    }

    handleInsertChildBeat = (beatToLeftId) => {
      const { ui, beatActions } = this.props
      beatActions.expandBeat(beatToLeftId, ui.currentTimeline)
      beatActions.addBeat(ui.currentTimeline, beatToLeftId)
    }

    handleAppendBeat = () => {
      const { ui, beatActions } = this.props
      beatActions.addBeat(ui.currentTimeline)
    }

    handleAppendLine = () => {
      const { ui, lineActions } = this.props
      lineActions.addLine(ui.currentTimeline)
    }

    renderSecondLastInsertBeatCell() {
      const {
        ui: { currentTimeline, orientation },
        isLarge,
        booksBeats,
        beats,
        beatActions,
      } = this.props
      if (!isLarge) return null

      const lastBeat = !beats || beats.length === 0 ? null : beats[beats.length - 1]
      return (
        // XXXXXX - final interstitial control adding a scene
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
        />
      )
    }

    renderLastInsertBeatCell() {
      const {
        ui: { orientation },
      } = this.props
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
      const { ui, booksBeats, beats, beatActions, isLarge, isMedium, isSmall } = this.props
      const beatToggler = (beat) => () => {
        if (!beat) return
        if (beat.expanded) beatActions.collapseBeat(beat.id, ui.currentTimeline)
        else beatActions.expandBeat(beat.id, ui.currentTimeline)
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
              handleInsertChild={
                lastBeat && hasChildren(booksBeats, lastBeat && lastBeat.id)
                  ? undefined
                  : this.handleInsertChildBeat
              }
              expanded={lastBeat && lastBeat.expanded}
              toggleExpanded={beatToggler(lastBeat)}
              orientation={ui.orientation}
              // this hovering state is the id of the card the user is currently hovering over
              hovering={this.state.hovering}
              onMouseEnter={() => this.startHovering(beat.id)}
              onMouseLeave={this.stopHovering}
              scrollTo={(position) => this.props.scrollTo(position)}
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
            scrollTo={(position) => this.props.scrollTo(position)}
          />
        )
        return cells
      })
      if (isSmall) {
        return [...renderedBeats, this.renderLastInsertBeatCell()]
      } else {
        return [
          <Cell key="placeholder" />,
          ...renderedBeats,
          this.renderSecondLastInsertBeatCell(),
          this.renderLastInsertBeatCell(),
        ]
      }
    }

    renderLines() {
      const { lines, ui, isSmall, isLarge } = this.props
      const renderedLines = lines.map((line) => (
        <LineTitleCell
          key={`line-${line.id}`}
          line={line}
          handleReorder={this.handleReorderLines}
          bookId={ui.currentTimeline}
        />
      ))
      const insertLineDiv = (
        <div
          className={orientedClassName('line-list__append-line', ui.orientation)}
          onClick={this.handleAppendLine}
        >
          <div className={orientedClassName('line-list__append-line-wrapper', ui.orientation)}>
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
      const { ui, isSmall } = this.props
      let body = null
      if (ui.orientation === 'horizontal') body = this.renderBeats()
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
    ui: PropTypes.object.isRequired,
    scrollTo: PropTypes.func.isRequired,
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
  } = selectors

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(
      (state) => {
        const nextBeatId = nextId(state.present.beats)

        return {
          ui: state.present.ui,
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
