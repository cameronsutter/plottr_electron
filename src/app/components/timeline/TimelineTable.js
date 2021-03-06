import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { findDOMNode } from 'react-dom'
import { bindActionCreators } from 'redux'
import cx from 'classnames'
import { Row } from 'react-sticky-table'
import CardCell from './CardCell'
import BlankCard from './BlankCard'
import LineTitleCell from './LineTitleCell'
import BeatInsertCell from './BeatInsertCell'
import TopRow from './TopRow'
import BeatTitleCell from './BeatTitleCell'
import AddLineRow from './AddLineRow'
import { newIds, actions, helpers, selectors, initialState } from 'pltr/v2'

const { card } = initialState

const { nextId } = newIds

const {
  beats: { insertBeat },
  lists: { reorderList },
} = helpers

const {
  cardMapSelector,
  sortedBeatsByBookSelector,
  sortedLinesByBookSelector,
  isSeriesSelector,
  isLargeSelector,
  isSmallSelector,
  isMediumSelector,
} = selectors

const LineActions = actions.line
const BeatActions = actions.beat
const CardActions = actions.card
const UIActions = actions.ui

class TimelineTable extends Component {
  state = {
    tableLength: 0,
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

  handleReorderBeats = (originalPosition, droppedPosition) => {
    const beats = reorderList(originalPosition, droppedPosition, this.props.beats)
    this.props.beatActions.reorderBeats(beats, this.props.ui.currentTimeline)
  }

  handleReorderLines = (originalPosition, droppedPosition) => {
    const lines = reorderList(originalPosition, droppedPosition, this.props.lines)
    this.props.lineActions.reorderLines(lines, this.props.ui.currentTimeline)
  }

  // TODO: this should be a selector
  beatMapping() {
    return this.props.beats.reduce((acc, beat) => {
      acc[beat.position] = beat.id
      return acc
    }, {})
  }

  // TODO: this should be a selector
  lineMapping() {
    return this.props.lines.reduce((acc, line) => {
      acc[line.position] = line
      return acc
    }, {})
  }

  handleInsertNewBeat = (nextPosition, lineId) => {
    const beats = insertBeat(
      nextPosition,
      this.props.beats,
      this.props.nextBeatId,
      this.props.ui.currentTimeline
    )
    this.props.beatActions.reorderBeats(beats, this.props.ui.currentTimeline)

    if (lineId && beats[nextPosition]) {
      const beatId = beats[nextPosition].id
      this.props.cardActions.addCard(this.buildCard(lineId, beatId))
    }
  }

  buildCard(lineId, beatId) {
    return Object.assign({}, card, { beatId, lineId })
  }

  handleAppendBeat = () => {
    this.props.beatActions.addBeat(this.props.ui.currentTimeline)
  }

  renderHorizontal() {
    const { lines, isSmall, ui } = this.props

    const beatMap = this.beatMapping()
    const beatMapKeys = Object.keys(beatMap)
    let howManyCells = 0
    const renderedLines = lines.map((line) => {
      const lineTitle = (
        <LineTitleCell
          line={line}
          handleReorder={this.handleReorderLines}
          bookId={ui.currentTimeline}
        />
      )
      const cards = this.renderHorizontalCards(line, beatMap, beatMapKeys)
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
    const { beats, isSmall, isLarge } = this.props
    const renderedBeats = beats.map((beat, idx) => {
      let inserts = []
      if (isLarge || idx === 0) {
        inserts = lineMapKeys.flatMap((linePosition, idx) => {
          const line = lineMap[linePosition]
          return (
            <BeatInsertCell
              key={`${linePosition}-insert`}
              isInBeatList={false}
              beatPosition={beat.position}
              handleInsert={this.handleInsertNewBeat}
              color={line.color}
              showLine={beat.position == 0}
              tableLength={this.state.tableLength}
            />
          )
        })
      }

      const beatTitle = <BeatTitleCell beatId={beat.id} handleReorder={this.handleReorderBeats} />

      if (isSmall) {
        return (
          <tr key={`beatId-${beat.id}`}>
            {beatTitle}
            {this.renderVerticalCards(beat, lineMap, lineMapKeys)}
          </tr>
        )
      } else {
        return [
          <Row key={`beatId-${beat.id}`}>
            {isLarge || idx === 0 ? (
              <BeatInsertCell
                isInBeatList={true}
                beatPosition={beat.position}
                handleInsert={this.handleInsertNewBeat}
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

    let finalRow

    if (isSmall) {
      const tds = lineMapKeys.map((linePosition) => <td key={linePosition} />)
      finalRow = (
        <tr key="last-insert">
          <BeatInsertCell isInBeatList={true} handleInsert={this.handleAppendBeat} isLast={true} />
          {[...tds, <td key="empty-cell" />]}
        </tr>
      )
    } else {
      finalRow = (
        <Row key="last-insert">
          <BeatInsertCell isInBeatList={true} handleInsert={this.handleAppendBeat} isLast={true} />
        </Row>
      )
    }

    return [...renderedBeats, finalRow]
  }

  renderRows() {
    if (this.props.ui.orientation === 'horizontal') {
      return this.renderHorizontal()
    } else {
      return this.renderVertical()
    }
  }

  renderHorizontalCards(line, beatMap, beatMapKeys) {
    const { cardMap, isLarge, isMedium } = this.props
    return beatMapKeys.flatMap((beatPosition) => {
      const cells = []
      const beatId = beatMap[beatPosition]
      if (isLarge || (isMedium && beatPosition == 0)) {
        cells.push(
          <BeatInsertCell
            key={`${beatPosition}-insert`}
            isInBeatList={false}
            beatPosition={Number(beatPosition)}
            lineId={line.id}
            handleInsert={this.handleInsertNewBeat}
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
    const { cardMap, isSmall } = this.props
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

function mapStateToProps(state) {
  const nextBeatId = nextId(state.present.beats)
  return {
    beats: sortedBeatsByBookSelector(state.present),
    nextBeatId: nextBeatId,
    lines: sortedLinesByBookSelector(state.present),
    cardMap: cardMapSelector(state.present),
    ui: state.present.ui,
    isSeries: isSeriesSelector(state.present),
    isSmall: isSmallSelector(state.present),
    isMedium: isMediumSelector(state.present),
    isLarge: isLargeSelector(state.present),
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(UIActions, dispatch),
    lineActions: bindActionCreators(LineActions, dispatch),
    cardActions: bindActionCreators(CardActions, dispatch),
    beatActions: bindActionCreators(BeatActions, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TimelineTable)
