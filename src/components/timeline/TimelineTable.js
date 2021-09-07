import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { findDOMNode } from 'react-dom'
import cx from 'classnames'
import { Row } from 'react-sticky-table'
import UnconnectedCardCell from './CardCell'
import UnconnectedBlankCard from './BlankCard'
import UnconnectedLineTitleCell from './LineTitleCell'
import UnconnectedBeatInsertCell from './BeatInsertCell'
import UnconnectedTopRow from './TopRow'
import UnconnectedBeatTitleCell from './BeatTitleCell'
import UnconnectedAddLineRow from './AddLineRow'
import { helpers, initialState } from 'pltr/v2'

const { card } = initialState

const {
  beats: { nextId },
  lists: { reorderList },
} = helpers

const TimelineTableConnector = (connector) => {
  const CardCell = UnconnectedCardCell(connector)
  const BlankCard = UnconnectedBlankCard(connector)
  const LineTitleCell = UnconnectedLineTitleCell(connector)
  const BeatInsertCell = UnconnectedBeatInsertCell(connector)
  const TopRow = UnconnectedTopRow(connector)
  const BeatTitleCell = UnconnectedBeatTitleCell(connector)
  const AddLineRow = UnconnectedAddLineRow(connector)

  class TimelineTable extends Component {
    state = {
      tableLength: 0,
      hovering: null,
    }

    setLength = () => {
      const { tableRef, ui, isSmall } = this.props
      if (isSmall) return

      /* eslint-disable-next-line react/no-find-dom-node */
      const table = findDOMNode(tableRef)
      if (!table) return
      let newLength = table.scrollWidth
      if (ui.orientation != 'horizontal') {
        newLength = table.scrollHeight
      }
      if (this.state.tableLength != newLength) {
        this.setState({ tableLength: newLength })
      }
    }

    componentDidMount() {
      this.setLength()
    }

    componentDidUpdate() {
      this.setLength()
    }

    handleReorderBeats = (droppedPositionId, originalPositionId) => {
      this.props.beatActions.reorderBeats(
        originalPositionId,
        droppedPositionId,
        this.props.ui.currentTimeline
      )
    }

    handleReorderLines = (originalPosition, droppedPosition) => {
      const lines = reorderList(originalPosition, droppedPosition, this.props.lines)
      this.props.lineActions.reorderLines(lines, this.props.ui.currentTimeline)
    }

    startHovering = (beat) => {
      this.setState({ hovering: beat })
      return beat
    }

    stopHovering = () => {
      this.setState({ hovering: null })
      return null
    }

    // TODO: this should be a selector
    lineMapping() {
      return this.props.lines.reduce((acc, line) => {
        acc[line.position] = line
        return acc
      }, {})
    }

    handleInsertNewBeat = (beatToLeftId) => {
      const { ui, beatActions } = this.props
      beatActions.insertBeat(ui.currentTimeline, beatToLeftId)
    }

    handleInsertChildBeat = (beatToLeftId) => {
      const { ui, beatActions } = this.props
      beatActions.addBeat(ui.currentTimeline, beatToLeftId)
      beatActions.expandBeat(beatToLeftId, ui.currentTimeline)
    }

    buildCard(lineId, beatId) {
      return Object.assign({}, card, { beatId, lineId })
    }

    handleAppendBeat = () => {
      this.props.beatActions.addBeat(this.props.ui.currentTimeline)
    }

    renderHorizontal() {
      const { lines, isSmall, ui, beatMapping } = this.props

      const beatMapKeys = Object.keys(beatMapping)
      let howManyCells = 0
      const renderedLines = lines.map((line) => {
        const lineTitle = (
          <LineTitleCell
            line={line}
            handleReorder={this.handleReorderLines}
            bookId={ui.currentTimeline}
          />
        )
        const cards = this.renderHorizontalCards(line, beatMapping, beatMapKeys)
        howManyCells = cards.length
        if (isSmall) {
          return (
            <tr key={`lineId-${line.id}`}>
              {lineTitle}
              {cards}
              <td />
            </tr>
          )
        } else {
          return (
            <Row key={`lineId-${line.id}`}>
              {lineTitle}
              {cards}
            </Row>
          )
        }
      })
      return [
        ...renderedLines,
        <AddLineRow key="insert-line" bookId={ui.currentTimeline} howManyCells={howManyCells} />,
      ]
    }

    renderVertical() {
      const lineMap = this.lineMapping()
      const lineMapKeys = Object.keys(lineMap)
      const { beats, beatActions, ui, isSmall, isLarge } = this.props

      const beatToggler = (beat) => () => {
        if (!beat) return
        if (beat.expanded) beatActions.collapseBeat(beat.id, ui.currentTimeline)
        else beatActions.expandBeat(beat.id, ui.currentTimeline)
      }

      const renderedBeats = beats.map((beat, idx) => {
        let inserts = []
        if (isLarge || idx === 0) {
          inserts = lineMapKeys.flatMap((linePosition) => {
            const line = lineMap[linePosition]
            return (
              <BeatInsertCell
                key={`${linePosition}-insert`}
                beatToLeft={beats[idx - 1]}
                isInBeatList={false}
                handleInsert={this.handleInsertNewBeat}
                color={line.color}
                showLine={beat.position == 0}
                tableLength={this.state.tableLength}
                hovering={this.state.hovering}
                onMouseEnter={() => this.startHovering(beat.id)}
                onMouseLeave={this.stopHovering}
              />
            )
          })
        }

        const beatTitle = (
          <BeatTitleCell
            beatId={beat.id}
            handleReorder={this.handleReorderBeats}
            hovering={this.state.hovering}
            onMouseEnter={() => this.startHovering(beat.id)}
            onMouseLeave={this.stopHovering}
          />
        )

        if (isSmall) {
          return (
            <tr key={`beatId-${beat.id}`}>
              {beatTitle}
              {this.renderVerticalCards(beat, lineMap, lineMapKeys)}
            </tr>
          )
        } else {
          const lastBeat = beats[idx - 1]
          return [
            <Row key={`beatId-${beat.id}`}>
              {isLarge || idx === 0 ? (
                <BeatInsertCell
                  isFirst={idx === 0}
                  isInBeatList={true}
                  beatToLeft={beats[idx - 1]}
                  handleInsertChild={() => this.handleInsertChildBeat(beats[idx - 1].id)}
                  expanded={lastBeat && lastBeat.expanded}
                  toggleExpanded={beatToggler(lastBeat)}
                  handleInsert={this.handleInsertNewBeat}
                  hovering={this.state.hovering}
                  onMouseEnter={() => this.startHovering(beat.id)}
                  onMouseLeave={this.stopHovering}
                />
              ) : null}
              {inserts}
            </Row>,
            <Row key={`beatId-${beat.id}-insert`}>
              {beatTitle}
              {this.renderVerticalCards(beat, lineMap, lineMapKeys)}
            </Row>,
          ]
        }
      })

      let finalRows

      if (isSmall) {
        const tds = lineMapKeys.map((linePosition) => <td key={linePosition} />)
        finalRows = [
          <tr key="last-insert">
            <BeatInsertCell
              isInBeatList={true}
              handleInsert={this.handleAppendBeat}
              isLast={true}
            />
            {[...tds, <td key="empty-cell" />]}
          </tr>,
        ]
      } else {
        const lastBeat = beats[beats.length - 1]
        finalRows = []
        if (isLarge) {
          finalRows.push(
            <Row key="second-last-insert">
              <BeatInsertCell
                isInBeatList={true}
                handleInsert={this.handleInsertNewBeat}
                beatToLeft={lastBeat}
                handleInsertChild={() => this.handleInsertChildBeat(lastBeat.id)}
                expanded={lastBeat && lastBeat.expanded}
                toggleExpanded={beatToggler(lastBeat)}
              />
            </Row>
          )
        }
      }

      return [...renderedBeats, ...finalRows]
    }

    renderRows() {
      if (this.props.ui.orientation === 'horizontal') {
        return this.renderHorizontal()
      } else {
        return this.renderVertical()
      }
    }

    renderHorizontalCards(line, beatMap, beatMapKeys) {
      const { beats, cardMap, isLarge, isMedium, beatHasChildrenMap } = this.props
      return beatMapKeys.flatMap((beatPosition) => {
        const cells = []
        const beatId = beatMap[beatPosition]
        const beat = beats[beatPosition]
        if (isLarge || (isMedium && beatPosition == 0)) {
          cells.push(
            <BeatInsertCell
              key={`${beatPosition}-insert`}
              isInBeatList={false}
              lineId={line.id}
              handleInsert={this.handleInsertNewBeat}
              beatToLeft={beats[beatPosition - 1]}
              showLine={beatPosition == 0}
              color={line.color}
              tableLength={this.state.tableLength}
            />
          )
        }
        const cards = cardMap[`${line.id}-${beatId}`]
        const key = `${cards ? 'card' : 'blank'}-${beatPosition}-${line.position}`
        if (cards) {
          cells.push(
            <CardCell
              key={key}
              cards={cards}
              beatIsExpanded={(beat && beat.expanded) || !beatHasChildrenMap.get(beat.id)}
              beatId={beatId}
              lineId={line.id}
              beatPosition={beatPosition}
              linePosition={line.position}
              color={line.color}
            />
          )
        } else {
          cells.push(<BlankCard beatId={beatId} lineId={line.id} key={key} color={line.color} />)
        }
        return cells
      })
    }

    renderVerticalCards(beat, lineMap, lineMapKeys) {
      const { cardMap, isSmall, beatHasChildrenMap } = this.props
      const renderedCards = lineMapKeys.flatMap((linePosition) => {
        const cells = []
        const line = lineMap[linePosition]
        const cards = cardMap[`${line.id}-${beat.id}`]
        const key = `${cards ? 'card' : 'blank'}-${beat.position}-${linePosition}`
        if (cards) {
          cells.push(
            <CardCell
              key={key}
              cards={cards}
              beatIsExpanded={(beat && beat.expanded) || !beatHasChildrenMap.get(beat.id)}
              beatId={beat.id}
              lineId={line.id}
              beatPosition={beat.position}
              linePosition={linePosition}
              color={line.color}
            />
          )
        } else {
          cells.push(<BlankCard beatId={beat.id} lineId={line.id} key={key} color={line.color} />)
        }
        return cells
      })
      if (isSmall) {
        return [...renderedCards, <td key="empty-cell" />]
      } else {
        return renderedCards
      }
    }

    render() {
      const { ui, isSmall } = this.props
      if (isSmall) {
        return (
          <div
            className={cx('small-timeline__wrapper', {
              darkmode: ui.darkMode,
              vertical: ui.orientation == 'vertical',
            })}
          >
            <table className="table-header-rotated">
              <TopRow />
              <tbody>{this.renderRows()}</tbody>
            </table>
          </div>
        )
      } else {
        return [<TopRow key="top-row" />, this.renderRows()]
      }
    }
  }

  TimelineTable.propTypes = {
    nextBeatId: PropTypes.number,
    beats: PropTypes.array,
    beatHasChildrenMap: PropTypes.instanceOf(Map).isRequired,
    booksBeats: PropTypes.object,
    beatMapping: PropTypes.object,
    lines: PropTypes.array,
    cardMap: PropTypes.object.isRequired,
    ui: PropTypes.object.isRequired,
    isSeries: PropTypes.bool,
    isSmall: PropTypes.bool,
    isMedium: PropTypes.bool,
    isLarge: PropTypes.bool,
    tableRef: PropTypes.object,
    actions: PropTypes.object,
    lineActions: PropTypes.object,
    cardActions: PropTypes.object,
    beatActions: PropTypes.object,
  }

  const {
    redux,
    pltr: { selectors, actions },
  } = connector

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(
      (state) => {
        return {
          beats: selectors.visibleSortedBeatsByBookSelector(state.present),
          booksBeats: selectors.beatsByBookSelector(state.present),
          beatHasChildrenMap: selectors.beatHasChildrenSelector(state.present),
          beatMapping: selectors.sparceBeatMap(state.present),
          nextBeatId: nextId(state.present.beats),
          lines: selectors.sortedLinesByBookSelector(state.present),
          cardMap: selectors.cardMetaDataMapSelector(state.present),
          ui: state.present.ui,
          isSeries: selectors.isSeriesSelector(state.present),
          isSmall: selectors.isSmallSelector(state.present),
          isMedium: selectors.isMediumSelector(state.present),
          isLarge: selectors.isLargeSelector(state.present),
        }
      },
      (dispatch) => {
        return {
          actions: bindActionCreators(actions.ui, dispatch),
          lineActions: bindActionCreators(actions.line, dispatch),
          cardActions: bindActionCreators(actions.card, dispatch),
          beatActions: bindActionCreators(actions.beat, dispatch),
        }
      }
    )(TimelineTable)
  }

  throw new Error('Could not connect TimelineTable')
}

export default TimelineTableConnector
