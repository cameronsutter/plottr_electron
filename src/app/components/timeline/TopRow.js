import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Row, Cell } from 'react-sticky-table'
import { Glyphicon } from 'react-bootstrap'
import BeatTitleCell from 'components/timeline/BeatTitleCell'
import LineTitleCell from 'components/timeline/LineTitleCell'
import BeatInsertCell from 'components/timeline/BeatInsertCell'
import { actions, helpers, selectors } from 'pltr/v2'

const {
  beats: { nextId, hasChildren },
  lists: { reorderList },
  orientedClassName: { orientedClassName },
} = helpers

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

class TopRow extends Component {
  handleReorderBeats = (droppedPositionId, originalPositionId) => {
    const { ui, beatActions } = this.props
    beatActions.reorderBeats(originalPositionId, droppedPositionId, ui.currentTimeline)
  }

  handleReorderLines = (originalPosition, droppedPosition) => {
    const { ui, lineActions, lines } = this.props
    const newLines = reorderList(originalPosition, droppedPosition, lines)
    lineActions.reorderLines(newLines, ui.currentTimeline)
  }

  handleInsertNewBeat = (beatToRightId) => {
    const { ui, beatActions } = this.props
    beatActions.insertBeat(beatToRightId, ui.currentTimeline)
  }

  handleInsertChildBeat = (beatToRightId) => {
    const { ui, beatActions } = this.props
    beatActions.addBeat(ui.currentTimeline, beatToRightId)
  }

  handleAppendBeat = () => {
    const { ui, beatActions } = this.props
    beatActions.addBeat(ui.currentTimeline)
  }

  handleAppendLine = () => {
    const { ui, lineActions } = this.props
    lineActions.addLine(ui.currentTimeline)
  }

  renderLastInsertBeatCell() {
    const { orientation } = this.props.ui
    return (
      <BeatInsertCell
        key="last-insert"
        isInBeatList={true}
        handleInsert={this.handleAppendBeat}
        isLast={true}
        orientation={orientation}
      />
    )
  }

  renderBeats() {
    const { ui, booksBeats, beats, beatActions, isLarge, isMedium, isSmall } = this.props
    let lastBeat = null
    const beatToggler = (beat) => () => {
      if (!beat) return
      if (beat.expanded) beatActions.collapseBeat(beat.id, ui.currentTimeline)
      else beatActions.expandBeat(beat.id, ui.currentTimeline)
    }
    const renderedBeats = beats.flatMap((beat, idx) => {
      const cells = []
      if (isLarge || (isMedium && idx === 0)) {
        cells.push(
          <BeatInsertCell
            isFirst={idx === 0}
            key={`beatId-${beat.id}-insert`}
            isInBeatList={true}
            beatToRight={beat}
            handleInsert={this.handleInsertNewBeat}
            handleInsertChild={
              hasChildren(booksBeats, lastBeat && lastBeat.id)
                ? undefined
                : this.handleInsertChildBeat
            }
            expanded={lastBeat && lastBeat.expanded}
            toggleExpanded={beatToggler(lastBeat)}
            orientation={ui.orientation}
          />
        )
      }
      cells.push(
        <BeatTitleCell
          isFirst={idx === 0}
          key={`beatId-${beat.id}`}
          beatId={beat.id}
          handleReorder={this.handleReorderBeats}
        />
      )
      lastBeat = beat
      return cells
    })
    if (isSmall) {
      return [...renderedBeats, this.renderLastInsertBeatCell()]
    } else {
      return [<Cell key="placeholder" />, ...renderedBeats, this.renderLastInsertBeatCell()]
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
  isSeries: PropTypes.bool,
  isSmall: PropTypes.bool,
  isMedium: PropTypes.bool,
  isLarge: PropTypes.bool,
  beats: PropTypes.array,
  booksBeats: PropTypes.object,
  nextBeatId: PropTypes.number,
  lines: PropTypes.array,
  lineActions: PropTypes.object,
  beatActions: PropTypes.object,
}

function mapStateToProps(state) {
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
}

function mapDispatchToProps(dispatch) {
  return {
    lineActions: bindActionCreators(LineActions, dispatch),
    beatActions: bindActionCreators(BeatActions, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TopRow)
