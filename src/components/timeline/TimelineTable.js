import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import cx from 'classnames'

import { t } from 'plottr_locales'
import { Row, Cell } from 'react-sticky-table'

import UnconnectedCardCell from './CardCell'
import UnconnectedBlankCard from './BlankCard'
import UnconnectedLineTitleCell from './LineTitleCell'
import UnconnectedBeatInsertCell from './BeatInsertCell'
import UnconnectedTopRow from './TopRow'
import UnconnectedBeatTitleCell from './BeatTitleCell'
import UnconnectedAddLineRow from './AddLineRow'
import { helpers, initialState } from 'pltr/v2'
import { checkDependencies } from '../checkDependencies'

const { card } = initialState

const {
  beats: { nextId },
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
    constructor(props) {
      super(props)

      this.state = {
        tableLength: 0,
      }

      this.lastMoveTimeout = null
      this.mouseMoveListener = null
    }

    setLength = () => {
      const { tableRef, orientation, isSmall, isMedium } = this.props
      if (isSmall) return

      if (!tableRef) return
      let newLength = 0
      if (orientation === 'horizontal') {
        const row = document.querySelector('#table-beat-row')
        if (row) {
          newLength = Array.from(row.children)
            .slice(1) // The first table cell is note above the line
            .reduce((acc, nextNode) => {
              return acc + nextNode.clientWidth
            }, 0)
          if (isMedium) newLength -= 8 // give it a little buffer
        }
      } else {
        const column = document.querySelectorAll('.sticky-table-row')
        if (column) {
          newLength = Array.from(column)
            .slice(2, isMedium ? undefined : -1) // The first table cell is note above the line
            .reduce((acc, nextNode) => {
              return acc + nextNode.clientHeight
            }, 0)
        }
      }
      if (this.state.tableLength != newLength) {
        this.setState({ tableLength: newLength })
      }
    }

    componentDidMount() {
      // We need to wait a minute to make sure that the DOM size
      // calculations are done.
      setTimeout(() => {
        this.setLength()
      }, 50)
    }

    componentDidUpdate() {
      // We need to wait a minute to make sure that the DOM size
      // calculations are done.
      setTimeout(() => {
        this.setLength()
      }, 50)

      const { visible } = this.props.toast

      if (visible) {
        setTimeout(() => {
          this.handleCloseToast()
        }, 5000)
      }
    }

    handleReorderBeats = (droppedPositionId, originalPositionId) => {
      this.props.beatActions.reorderBeats(
        originalPositionId,
        droppedPositionId,
        this.props.currentTimeline
      )
    }

    handleReorderLines = (droppedPosition, originalPosition) => {
      this.props.lineActions.reorderLines(droppedPosition, originalPosition)
    }

    handleTogglePinPlotline = (line) => {
      const { lineActions } = this.props
      lineActions.togglePinPlotline(line)
    }

    // TODO: this should be a selector
    lineMapping() {
      return this.props.lines.reduce((acc, line) => {
        acc[line.position] = line
        return acc
      }, {})
    }

    handleInsertNewBeat = (beatToLeftId) => {
      const { currentTimeline, beatActions } = this.props
      beatActions.insertBeat(currentTimeline, beatToLeftId)
    }

    handleInsertChildBeat = (beatToLeftId) => {
      const { currentTimeline, beatActions } = this.props
      beatActions.addBeat(currentTimeline, beatToLeftId)
      beatActions.expandBeat(beatToLeftId, currentTimeline)
    }

    buildCard(lineId, beatId) {
      return Object.assign({}, card, { beatId, lineId })
    }

    handleAppendBeat = () => {
      const { timelineViewIsTabbed, beats } = this.props
      if (timelineViewIsTabbed) {
        this.handleInsertNewBeat(beats[beats.length - 1].id)
        return
      }
      this.props.beatActions.addBeat(this.props.currentTimeline)
    }

    renderHorizontal() {
      const { lines, isSmall, currentTimeline, beatMapping } = this.props

      const beatMapKeys = Object.keys(beatMapping)
      let howManyCells = 0
      const renderedLines = lines.map((line, index) => {
        const lineTitle = (
          <LineTitleCell
            line={line}
            handleReorder={this.handleReorderLines}
            bookId={currentTimeline}
            togglePinPlotline={this.handleTogglePinPlotline}
            // This needs to be here to prevent the move book dialog
            // from overlapping with the plotline beneath this one.
            zIndex={100 - index}
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
          // Note the z-index.  It's needed to stack controls from the
          // top row onto the next row.
          return (
            <Row key={`lineId-${line.id}`} className={cx({ isPinned: line.isPinned })}>
              {lineTitle}
              {cards}
            </Row>
          )
        }
      })
      return [
        ...renderedLines,
        <AddLineRow
          key="insert-line"
          bookId={currentTimeline}
          howManyCells={howManyCells}
          zIndex={100 - renderedLines.length}
        />,
      ]
    }

    renderVertical() {
      const lineMap = this.lineMapping()
      const lineMapKeys = Object.keys(lineMap)
      const { beats, isSmall, isLarge, beatPositions, timelineViewIsTabbed } = this.props

      const renderedBeats = beats.map((beat, idx) => {
        let inserts = []
        // let inserts = [
        //   <Cell key={`controls-placeholder-${beat.id}`}>
        //     <div></div>
        //   </Cell>,
        // ]
        if (isLarge || idx === 0) {
          inserts = lineMapKeys.flatMap((linePosition) => {
            const line = lineMap[linePosition]
            const beatPosition = beatPositions[beat.id]
            return (
              <BeatInsertCell
                key={`${linePosition}-insert`}
                beatToLeft={beats[idx - 1]}
                isInBeatList={false}
                handleInsert={this.handleInsertNewBeat}
                color={line.color}
                showLine={beatPosition == 0}
                tableLength={this.state.tableLength}
                className={cx({ isPinned: line.isPinned })}
                isPinned={line.isPinned}
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
              <Cell key={`beatId-${beat.id}-insert-controls-place-holder`}>
                <div></div>
              </Cell>
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
          if (timelineViewIsTabbed) {
            // Cell has height to accomodate hover controls
            finalRows.push(
              <Row>
                <Cell
                  key={`beatId-second-last-insert-controls-place-holder`}
                  style={{ height: '40px' }}
                >
                  <div>&nbsp;</div>
                </Cell>
              </Row>
            )
          } else {
            finalRows.push(
              <Row key="second-last-insert">
                <BeatInsertCell
                  isInBeatList={true}
                  handleInsert={this.handleInsertNewBeat}
                  beatToLeft={lastBeat}
                  isEmpty={!beats.length}
                />
              </Row>
            )
          }
        }
      }

      return [...renderedBeats, ...finalRows]
    }

    renderRows() {
      if (this.props.orientation === 'horizontal') {
        return this.renderHorizontal()
      } else {
        return this.renderVertical()
      }
    }

    handleCloseToast = () => {
      this.props.notificationActions.showToastNotification(false)
    }

    getToastMessage = (cardAction, newBookId, lineAction) => {
      if ((cardAction === 'move' || lineAction === 'move') && newBookId) {
        const { books, actions } = this.props
        const bookTitle = newBookId === 'series' ? t('Series') : this.bookTitle(books[newBookId])
        const entityType = cardAction ? 'Scene card' : 'Plotline'

        // if card is moved to another book, create the book link
        return (
          <div className="toast-message-with-anchor">
            {t(`Woohoo! ${entityType} moved to`)}
            <a href="#" onClick={() => actions.changeCurrentTimeline(newBookId)}>
              {` ${bookTitle}`}
            </a>
          </div>
        )
      } else {
        return t('Woohoo! Scene card duplicated')
      }
    }

    renderToastMessage = () => {
      const { toast } = this.props
      return (
        <div
          className={cx(
            'update-notifier scene-card-update-toast alert alert-info alert-dismissible'
          )}
          role="alert"
        >
          {this.getToastMessage(toast.cardAction, toast.newBookId, toast.lineAction)}
          <button className="close" onClick={() => this.handleCloseToast()}>
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      )
    }

    renderMessage = () => {
      const { message } = this.props
      return (
        <div
          className={cx('update-notifier scene-card-update-toast alert alert-info')}
          role="alert"
        >
          {message}
        </div>
      )
    }

    bookTitle = (book) => {
      return book.title || t('Untitled')
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
              beatIsExpanded={beat && (beat.expanded || !beatHasChildrenMap.get(beat.id))}
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
      const { cardMap, isSmall, beatHasChildrenMap, beatPositions } = this.props
      const renderedCards = lineMapKeys.flatMap((linePosition) => {
        const cells = []
        const line = lineMap[linePosition]
        const cards = cardMap[`${line.id}-${beat.id}`]
        const beatPosition = beatPositions[beat.id]
        const key = `${cards ? 'card' : 'blank'}-${beatPosition}-${linePosition}`
        if (cards) {
          cells.push(
            <CardCell
              key={key}
              cards={cards}
              beatIsExpanded={beat && (beat.expanded || !beatHasChildrenMap.get(beat.id))}
              beatId={beat.id}
              lineId={line.id}
              beatPosition={beatPosition}
              linePosition={linePosition}
              color={line.color}
              className={cx({ 'card-pinned': line.isPinned })}
              isPinned={line.isPinned}
            />
          )
        } else {
          cells.push(
            <BlankCard
              className={cx({ 'card-pinned': line.isPinned })}
              beatId={beat.id}
              lineId={line.id}
              key={key}
              color={line.color}
              isPinned={line.isPinned}
            />
          )
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
      const { darkMode, orientation, isSmall, toast, message } = this.props

      if (isSmall) {
        return (
          <div
            className={cx('small-timeline__wrapper', {
              darkmode: darkMode,
              vertical: orientation == 'vertical',
            })}
          >
            <table
              className="table-header-rotated"
              ref={(ref) => {
                this.props.setTableRef(ref)
              }}
            >
              <TopRow />
              <tbody>{this.renderRows()}</tbody>
              {toast.visible ? this.renderToastMessage() : null}
            </table>
          </div>
        )
      } else {
        return [
          <TopRow key="top-row" />,
          toast.visible ? this.renderToastMessage() : null,
          message ? this.renderMessage() : null,
          this.renderRows(),
        ]
      }
    }
  }

  TimelineTable.propTypes = {
    nextBeatId: PropTypes.number,
    beats: PropTypes.array,
    beatHasChildrenMap: PropTypes.instanceOf(Map).isRequired,
    beatMapping: PropTypes.object,
    lines: PropTypes.array,
    cardMap: PropTypes.object.isRequired,
    darkMode: PropTypes.bool,
    orientation: PropTypes.string.isRequired,
    currentTimeline: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    isSeries: PropTypes.bool,
    isSmall: PropTypes.bool,
    isMedium: PropTypes.bool,
    isLarge: PropTypes.bool,
    tableRef: PropTypes.object,
    actions: PropTypes.object,
    lineActions: PropTypes.object,
    cardActions: PropTypes.object,
    beatActions: PropTypes.object,
    books: PropTypes.object.isRequired,
    toast: PropTypes.object,
    notificationActions: PropTypes.object,
    beatPositions: PropTypes.object.isRequired,
    setTableRef: PropTypes.func,
    message: PropTypes.string,
    activeTab: PropTypes.number.isRequired,
    timelineViewIsTabbed: PropTypes.bool,
    timelineViewIsStacked: PropTypes.bool,
    pinnedPlotlines: PropTypes.number,
  }

  const {
    redux,
    pltr: { selectors, actions },
  } = connector
  checkDependencies({ redux, selectors, actions })

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(
      (state, { activeTab }) => {
        return {
          beats: selectors.visibleSortedBeatsForTimelineByBookSelector(state.present),
          books: state.present.books,
          beatHasChildrenMap: selectors.beatHasChildrenSelector(state.present),
          beatMapping: selectors.timelineSparceBeatMap(state.present, activeTab),
          nextBeatId: nextId(state.present.beats),
          lines: selectors.sortedLinesByBookSelector(state.present),
          cardMap: selectors.searchedCardMetaDataMapSelector(state.present),
          darkMode: selectors.isDarkModeSelector(state.present),
          orientation: selectors.orientationSelector(state.present),
          currentTimeline: selectors.currentTimelineSelector(state.present),
          isSeries: selectors.isSeriesSelector(state.present),
          isSmall: selectors.isSmallSelector(state.present),
          isMedium: selectors.isMediumSelector(state.present),
          isLarge: selectors.isLargeSelector(state.present),
          toast: selectors.toastNotificationSelector(state.present),
          beatPositions: selectors.visibleBeatPositions(state.present),
          message: selectors.messageSelector(state.present),
          timelineViewIsTabbed: selectors.timelineViewIsTabbedSelector(state.present),
          timelineViewIsStacked: selectors.timelineViewIsStackedSelector(state.present),
          pinnedPlotlines: selectors.pinnedPlotlinesSelector(state.present),
        }
      },
      (dispatch) => {
        return {
          actions: bindActionCreators(actions.ui, dispatch),
          lineActions: bindActionCreators(actions.line, dispatch),
          cardActions: bindActionCreators(actions.card, dispatch),
          beatActions: bindActionCreators(actions.beat, dispatch),
          notificationActions: bindActionCreators(actions.notifications, dispatch),
        }
      }
    )(TimelineTable)
  }

  throw new Error('Could not connect TimelineTable')
}

export default TimelineTableConnector
