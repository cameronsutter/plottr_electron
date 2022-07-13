import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { Row, Cell } from 'react-sticky-table'

import { helpers } from 'pltr/v2'

import Glyphicon from '../Glyphicon'
import UnconnectedBeatTitleCell from './BeatTitleCell'
import UnconnectedBeatHeadingCell from './BeatHeadingCell'
import UnconnectedLineTitleCell from './LineTitleCell'
import UnconnectedBeatInsertCell from './BeatInsertCell'
import UnconnectedAddLineColumn from './AddLineColumn'
import { checkDependencies } from '../checkDependencies'

const {
  beats: { nextId, hasChildren },
  lists: { reorderList },
  orientedClassName: { orientedClassName },
} = helpers

const TopRowConnector = (connector) => {
  const BeatTitleCell = UnconnectedBeatTitleCell(connector)
  const BeatHeadingCell = UnconnectedBeatHeadingCell(connector)
  const LineTitleCell = UnconnectedLineTitleCell(connector)
  const BeatInsertCell = UnconnectedBeatInsertCell(connector)
  const AddLineColumn = UnconnectedAddLineColumn(connector)

  class TopRow extends Component {
    constructor(props) {
      super(props)
      this.state = {
        hovering: null,
      }

      this.firstCell = null
    }

    componentDidMount() {
      if (this.firstCell) {
        this.firstCell.style.zIndex = 101
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
      const { currentTimeline, beatActions, beats, timelineViewIsTabbed, activeTab } = this.props
      if (timelineViewIsTabbed) {
        if (beats.length === 0) {
          this.handleInsertChildBeat(activeTab, currentTimeline)
          return
        } else {
          this.handleInsertNewBeat(beats[beats.length - 1].id)
          return
        }
      }
      beatActions.addBeat(currentTimeline)
    }

    handleAppendLine = () => {
      const { currentTimeline, lineActions } = this.props
      lineActions.addLine(currentTimeline)
    }

    renderSecondLastInsertBeatCell() {
      const { currentTimeline, orientation, isLarge, isMedium, booksBeats, beats, beatActions } =
        this.props
      if (!isLarge && !isMedium) return null

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
        return [
          <Cell
            key="placeholder"
            ref={(ref) => {
              this.firstCell = ref
            }}
          />,
          this.renderLastInsertBeatCell(),
        ]
      } else {
        return [
          <Cell
            key="placeholder"
            ref={(ref) => {
              this.firstCell = ref
            }}
          />,
          ...renderedBeats,
          this.renderSecondLastInsertBeatCell(),
        ]
      }
    }

    renderLines() {
      const { lines, currentTimeline, orientation, isSmall, isMedium, isLarge } = this.props
      const renderedLines = lines.map((line, index) => (
        <LineTitleCell
          key={`line-${line.id}`}
          line={line}
          handleReorder={this.handleReorderLines}
          bookId={currentTimeline}
          zIndex={100 - index}
        />
      ))
      const insertLineDiv = (
        <div
          className={orientedClassName('line-list__append-line--small', orientation)}
          onClick={this.handleAppendLine}
        >
          <div className={orientedClassName('line-list__append-line-wrapper--small', orientation)}>
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
      if (isLarge || isMedium) {
        const insertLineCell = (
          <Row key="insert-line">
            <AddLineColumn />
          </Row>
        )
        finalArray = [...finalArray, insertLineCell]
      }
      return finalArray
    }

    renderPaddingCells(beatId, count) {
      const { isLarge } = this.props
      const paddingCells = []
      for (let i = 0; i < count; ++i) {
        paddingCells.push(
          <Cell key={`padding-cell-${beatId}-${i}-1`} className="beat__heading-spacer" />
        )
        if (isLarge) {
          paddingCells.push(
            <Cell key={`padding-cell-${beatId}-${i}-2`} className="beat__heading-spacer" />
          )
        }
      }
      return paddingCells
    }

    renderTieredBeats(beats, leavesPerBeat, hierarchyLevelConfig) {
      const { isLarge } = this.props
      return [
        <Cell key="placeholder" />,
        ...beats.flatMap((beat, index) => {
          const beatLeaves = leavesPerBeat.get(beat.id)
          return [
            isLarge ? <Cell key={`place-holder${index}`} /> : null,
            <BeatHeadingCell key={`beatId-${beat.id}`} span={beatLeaves} beatId={beat.id} />,
            ...this.renderPaddingCells(beat.id, beatLeaves - 1),
          ]
        }),
      ]
    }

    render() {
      const {
        orientation,
        isSmall,
        timelineViewIsStacked,
        topTierBeats,
        secondTierBeats,
        hierarchyLevels,
        leavesPerBeat,
      } = this.props
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
        if (timelineViewIsStacked) {
          return [
            topTierBeats.length ? (
              <Row key="3rd-level-row">
                {this.renderTieredBeats(topTierBeats, leavesPerBeat, hierarchyLevels[0])}
              </Row>
            ) : null,
            secondTierBeats.length ? (
              <Row key="2nd-level-row">
                {this.renderTieredBeats(secondTierBeats, leavesPerBeat, hierarchyLevels[0])}
              </Row>
            ) : null,
            <Row id="table-beat-row" key="beats-title-row">
              {body}
            </Row>,
          ]
        }

        return <Row id="table-beat-row">{body}</Row>
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
    timelineViewIsStacked: PropTypes.bool,
    topTierBeats: PropTypes.array,
    secondTierBeats: PropTypes.array,
    hierarchyLevels: PropTypes.array.isRequired,
    leavesPerBeat: PropTypes.object.isRequired,
    timelineViewIsTabbed: PropTypes.bool,
    activeTab: PropTypes.number.isRequired,
  }

  const {
    redux,
    pltr: { actions, selectors },
  } = connector
  checkDependencies({ redux, actions, selectors })

  const LineActions = actions.line
  const BeatActions = actions.beat

  const {
    visibleSortedBeatsForTimelineByBookSelector,
    sortedLinesByBookSelector,
    beatsByBookSelector,
    isSeriesSelector,
    isLargeSelector,
    isMediumSelector,
    isSmallSelector,
    currentTimelineSelector,
    orientationSelector,
    timelineViewIsStackedSelector,
    topTierBeatsInThreeTierArrangementSelector,
    secondTierBeatsInAtLeastTwoTierArrangementSelector,
    sortedHierarchyLevels,
    leavesPerBeatSelector,
    timelineViewIsTabbedSelector,
    timelineActiveTabSelector,
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
          beats: visibleSortedBeatsForTimelineByBookSelector(state.present),
          booksBeats: beatsByBookSelector(state.present),
          nextBeatId: nextBeatId,
          lines: sortedLinesByBookSelector(state.present),
          timelineViewIsStacked: timelineViewIsStackedSelector(state.present),
          topTierBeats: topTierBeatsInThreeTierArrangementSelector(state.present),
          secondTierBeats: secondTierBeatsInAtLeastTwoTierArrangementSelector(state.present),
          hierarchyLevels: sortedHierarchyLevels(state.present),
          leavesPerBeat: leavesPerBeatSelector(state.present),
          timelineViewIsTabbed: timelineViewIsTabbedSelector(state.present),
          activeTab: timelineActiveTabSelector(state.present),
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
