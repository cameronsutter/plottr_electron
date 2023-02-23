import React, { useState, useRef, useEffect } from 'react'
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
import MousePositionContext from './MousePositionContext'
import { isEqual } from 'lodash'

const {
  beats: { nextId, hasChildren },
  orientedClassName: { orientedClassName },
} = helpers

const TopRowConnector = (connector) => {
  const BeatTitleCell = UnconnectedBeatTitleCell(connector)
  const BeatHeadingCell = UnconnectedBeatHeadingCell(connector)
  const LineTitleCell = UnconnectedLineTitleCell(connector)
  const BeatInsertCell = UnconnectedBeatInsertCell(connector)
  const AddLineColumn = UnconnectedAddLineColumn(connector)

  const TopRow = (props) => {
    const {
      orientation,
      isSmall,
      timelineViewIsStacked,
      topTierBeats,
      secondTierBeats,
      hierarchyLevels,
      leavesPerBeat,
      isMedium,
    } = props

    const [mouseXY, setMouseXY] = useState({ x: null, y: null })

    const firstCell = useRef(null)

    useEffect(() => {
      if (firstCell.current) {
        firstCell.current.style.zIndex = 101
      }
      if (timelineViewIsStacked) {
        let lastMoveTimeout = null
        const mouseMoveListener = document.addEventListener('mousemove', (event) => {
          if (lastMoveTimeout) {
            clearTimeout(lastMoveTimeout)
          }
          lastMoveTimeout = setTimeout(() => {
            const newMouseXY = {
              x: event.pageX,
              y: event.pageY,
            }
            if (!isEqual(mouseXY, newMouseXY)) {
              setMouseXY(newMouseXY)
            }
          }, 10)
        })
        return () => {
          document.removeEventListener('mousemove', mouseMoveListener)
          clearTimeout(lastMoveTimeout)
        }
      }
      return () => {}
    }, [timelineViewIsStacked])

    const handleReorderBeats = (droppedPositionId, originalPositionId) => {
      const { currentTimeline, beatActions } = props
      beatActions.reorderBeats(originalPositionId, droppedPositionId, currentTimeline)
    }

    const handleReorderLines = (droppedPosition, originalPosition) => {
      const { lineActions } = props
      lineActions.reorderLines(droppedPosition, originalPosition)
    }

    const handleTogglePinPlotline = (line) => {
      const { lineActions } = props
      lineActions.togglePinPlotline(line)
    }

    const handleInsertNewBeat = (peerBeatId) => {
      const { currentTimeline, beatActions } = props
      beatActions.insertBeat(currentTimeline, peerBeatId)
    }

    const handleInsertChildBeat = (beatToLeftId) => {
      const { currentTimeline, beatActions } = props
      beatActions.expandBeat(beatToLeftId, currentTimeline)
      beatActions.addBeat(currentTimeline, beatToLeftId)
    }

    const handleAppendBeat = () => {
      const { currentTimeline, beatActions, beats, timelineViewIsTabbed, activeTab } = props
      if (timelineViewIsTabbed) {
        if (beats.length === 0) {
          handleInsertChildBeat(activeTab, currentTimeline)
          return
        } else {
          handleInsertNewBeat(beats[beats.length - 1].id)
          return
        }
      }
      beatActions.addBeat(currentTimeline)
    }

    const handleAppendLine = () => {
      const { currentTimeline, lineActions } = props
      lineActions.addLine(currentTimeline)
    }

    const renderSecondLastInsertBeatCell = () => {
      const { timelineViewIsStacked, timelineViewIsTabbed, isLarge, isMedium } = props
      if (!isLarge && !isMedium) return null
      if (timelineViewIsTabbed || timelineViewIsStacked) {
        return <Cell key={`placeholder-beat-second-last-insert`} />
      }

      return timelineViewIsStacked ? null : <Cell key={`placeholder-beat-last-insert`} />
    }

    const renderLastInsertBeatCell = () => {
      if (timelineViewIsStacked) {
        return null
      }

      return (
        <BeatInsertCell
          key="last-insert"
          handleInsert={handleAppendBeat}
          isInBeatList={true}
          isLast={true}
          orientation={orientation}
        />
      )
    }

    const renderBeats = () => {
      const { orientation, booksBeats, beats, isLarge, isMedium, isSmall } = props
      const renderedBeats = beats.flatMap((beat, idx) => {
        const lastBeat = beats[idx - 1]
        const cells = []
        if (beat.isInsertChildCell) {
          cells.push([
            <BeatInsertCell
              key={`beatId-${beat.id}-insert-child`}
              isInBeatList={true}
              isInsertChildCell
              handleInsert={handleInsertChildBeat}
              beatToLeft={beat}
              orientation={orientation}
            />,
            <Cell key={`beatId-${beat.id}-insert-child-peer-dummy-cell`} />,
          ])
        } else {
          cells.push(
            <BeatTitleCell
              isFirst={idx === 0}
              key={`beatId-${beat.id}`}
              beatId={beat.id}
              handleReorder={handleReorderBeats}
              handleInsert={handleInsertNewBeat}
              handleInsertChild={
                lastBeat && hasChildren(booksBeats, lastBeat && lastBeat.id)
                  ? undefined
                  : handleInsertChildBeat
              }
            />
          )
        }
        return cells
      })
      if (isSmall) {
        return [...renderedBeats, renderLastInsertBeatCell()]
      } else if (!beats.length) {
        return [
          <Cell
            key="placeholder"
            ref={(ref) => {
              firstCell.current = ref
            }}
          />,
          renderLastInsertBeatCell(),
        ]
      } else {
        return [
          <Cell
            style={{ zIndex: 101 }}
            key="placeholder"
            ref={(ref) => {
              firstCell.current = ref
            }}
          />,
          isMedium || isLarge ? <Cell style={{ zIndex: 101 }} key="placeholder-2" /> : null,
          ...renderedBeats,
          renderSecondLastInsertBeatCell(),
          renderLastInsertBeatCell(),
        ]
      }
    }

    const renderLines = () => {
      const { lines, currentTimeline, orientation, isSmall, isMedium, isLarge } = props
      const renderedLines = lines.map((line, index) => (
        <LineTitleCell
          key={`line-${line.id}`}
          line={line}
          handleReorder={handleReorderLines}
          togglePinPlotline={handleTogglePinPlotline}
          bookId={currentTimeline}
          zIndex={100 - index}
        />
      ))
      const insertLineDiv = (
        <div
          className={orientedClassName('line-list__append-line--small', orientation)}
          onClick={handleAppendLine}
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

      let finalArray = [<Cell key="placeholder" style={{ zIndex: 101 }} />, ...renderedLines]
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

    const renderPaddingCells = (beatId, count) => {
      const { isLarge } = props
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

    const renderTieredBeats = (beats, leavesPerBeat, hierarchyLevelConfig) => {
      const { isLarge } = props
      return [
        <Cell key="placeholder" style={{ zIndex: 101 }} />,
        ...beats.flatMap((beat, index) => {
          const beatLeaves = leavesPerBeat.get(beat.id)
          return [
            isLarge ? <Cell key={`place-holder${index}`} /> : null,
            <BeatHeadingCell
              key={`beatId-${beat.id || 'idx-' + index}`}
              span={beatLeaves}
              beatId={beat.id}
            />,
            ...renderPaddingCells(beat.id, beatLeaves - 1),
          ]
        }),
      ]
    }

    let body = null
    if (orientation === 'horizontal') body = renderBeats()
    else body = renderLines()

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
        return (
          <MousePositionContext.Provider value={mouseXY}>
            {[
              topTierBeats.length ? (
                <Row key="3rd-level-row">
                  {isMedium ? <Cell style={{ zIndex: 101 }} key="top-placeholder-2" /> : null}
                  {renderTieredBeats(topTierBeats, leavesPerBeat, hierarchyLevels[0])}
                </Row>
              ) : null,
              secondTierBeats.length ? (
                <Row key="2nd-level-row">
                  {isMedium ? (
                    <Cell style={{ zIndex: 101 }} key="second-tier-placeholder-2" />
                  ) : null}
                  {renderTieredBeats(secondTierBeats, leavesPerBeat, hierarchyLevels[0])}
                </Row>
              ) : null,
              <Row id="table-beat-row" key="beats-title-row">
                {body}
              </Row>,
            ]}
          </MousePositionContext.Provider>
        )
      }
      return <Row id="table-beat-row">{body}</Row>
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
    pinnedPlotlines: PropTypes.number,
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
          pinnedPlotlines: selectors.pinnedPlotlinesSelector(state.present),
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
