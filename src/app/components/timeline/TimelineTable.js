import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { findDOMNode } from 'react-dom'
import { bindActionCreators } from 'redux'
import cx from 'classnames'
import * as UIActions from 'actions/ui'
import * as SceneActions from 'actions/scenes'
import * as LineActions from 'actions/lines'
import * as BeatActions from 'actions/beats'
import * as SeriesLineActions from 'actions/seriesLines'
import * as CardActions from 'actions/cards'
import { Row } from 'react-sticky-table'
import ScenesCell from './ScenesCell'
import BlankCard from './BlankCard'
import LineTitleCell from './LineTitleCell'
import ChapterInsertCell from './ChapterInsertCell'
import TopRow from './TopRow'
import ChapterTitleCell from './ChapterTitleCell'
import AddLineRow from './AddLineRow'
import { reorderList } from 'helpers/lists'
import { insertChapter } from 'helpers/chapters'
import { card } from '../../../../shared/initialState'
import { nextId } from '../../store/newIds'
import { sortedChaptersByBookSelector } from '../../selectors/chapters'
import { sortedLinesByBookSelector } from '../../selectors/lines'
import { cardMapSelector } from '../../selectors/cards'
import { isSeriesSelector, isLargeSelector, isSmallSelector, isMediumSelector } from '../../selectors/ui'

const LineActions = actions.lineActions

class TimelineTable extends Component {
  state = {
    tableLength: 0,
  }

  setLength = () => {
    const { tableRef, ui, isSmall } = this.props
    if (isSmall) return

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

  componentWillReceiveProps (nextProps) {

  }

  handleReorderChapters = (originalPosition, droppedPosition) => {
    const chapters = reorderList(originalPosition, droppedPosition, this.props.chapters)
    if (this.props.isSeries) {
      this.props.beatActions.reorderBeats(chapters)
    } else {
      this.props.sceneActions.reorderScenes(chapters, this.props.ui.currentTimeline)
    }
  }

  handleReorderLines = (originalPosition, droppedPosition) => {
    const lines = reorderList(originalPosition, droppedPosition, this.props.lines)
    const actions = this.props.isSeries ? this.props.seriesLineActions : this.props.lineActions
    actions.reorderLines(lines, this.props.ui.currentTimeline)
  }

  // TODO: this should be a selector
  chapterMapping() {
    return this.props.chapters.reduce((acc, chapter) => {
      acc[chapter.position] = chapter.id
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

  handleInsertNewChapter = (nextPosition, lineId) => {
    const chapters = insertChapter(
      nextPosition,
      this.props.chapters,
      this.props.nextChapterId,
      this.props.ui.currentTimeline
    )
    if (this.props.isSeries) {
      this.props.beatActions.reorderBeats(chapters)
    } else {
      this.props.sceneActions.reorderScenes(chapters, this.props.ui.currentTimeline)
    }

    if (lineId && chapters[nextPosition]) {
      const chapterId = chapters[nextPosition].id
      this.props.cardActions.addCard(this.buildCard(lineId, chapterId))
    }
  }

  buildCard(lineId, chapterId) {
    if (this.props.isSeries) {
      return Object.assign({}, card, { beatId: chapterId, seriesLineId: lineId })
    } else {
      return Object.assign({}, card, { chapterId, lineId })
    }
  }

  handleAppendChapter = () => {
    if (this.props.isSeries) {
      this.props.beatActions.addBeat()
    } else {
      this.props.sceneActions.addScene(this.props.ui.currentTimeline)
    }
  }

  renderLines () {
    const { lines, isSmall, ui } = this.props

    const chapterMap = this.chapterMapping()
    const chapterMapKeys = Object.keys(chapterMap)
    const renderedLines = lines.map(line => {
      const lineTitle = <LineTitleCell line={line} handleReorder={this.handleReorderLines} bookId={ui.currentTimeline}/>
      const cards = this.renderCardsByChapter(line, chapterMap, chapterMapKeys)
      if (isSmall) {
        return <tr key={`lineId-${line.id}`}>
          { lineTitle }
          { cards }
        </tr>
      } else {
        return <Row key={`lineId-${line.id}`}>
          { lineTitle }
          { cards }
        </Row>
      }
    })
    if (isSmall) {
      return renderedLines
    } else {
      return [].concat(renderedLines, <AddLineRow key='insert-line' bookId={ui.currentTimeline}/>)
    }
  }

  renderChapters() {
    const lineMap = this.lineMapping()
    const lineMapKeys = Object.keys(lineMap)
    const { chapters, isSmall, isLarge } = this.props
    const renderedChapters = chapters.map(chapter => {
      let inserts = []
      if (isLarge) {
        inserts = lineMapKeys.flatMap(linePosition => {
          const line = lineMap[linePosition]
          return <ChapterInsertCell key={`${linePosition}-insert`} isInChapterList={false} chapterPosition={chapter.position} handleInsert={this.handleInsertNewChapter} color={line.color} showLine={chapter.position == 0} tableLength={this.state.tableLength}/>
        })
      }

      const chapterTitle = <ChapterTitleCell chapterId={chapter.id} handleReorder={this.handleReorderChapters} />

      if (isSmall) {
        return <tr key={`chapterId-${chapter.id}`}>
          { chapterTitle }
          { this.renderCardsByLine(chapter, lineMap, lineMapKeys) }
        </tr>
      } else {
        return [<Row key={`chapterId-${chapter.id}`}>
            <ChapterInsertCell isInChapterList={true} chapterPosition={chapter.position} handleInsert={this.handleInsertNewChapter}/>
            { inserts }
          </Row>,
          <Row key={`chapterId-${chapter.id}-insert`}>
            { chapterTitle }
            { this.renderCardsByLine(chapter, lineMap, lineMapKeys) }
          </Row>
        ]
      }
    })

    if (isSmall) {
      return renderedChapters
    } else {
      const finalRow = <Row key='last-insert'>
        <ChapterInsertCell isInChapterList={true} handleInsert={this.handleAppendChapter} isLast={true}/>
      </Row>
      return [].concat(renderedChapters, finalRow)
    }
  }

  renderRows() {
    if (this.props.ui.orientation === 'horizontal') {
      return this.renderLines()
    } else {
      return this.renderChapters()
    }
  }

  renderCardsByChapter (line, chapterMap, chapterMapKeys) {
    const { cardMap, isLarge } = this.props
    return chapterMapKeys.flatMap(chapterPosition => {
      const cells = []
      const chapterId = chapterMap[chapterPosition]
      if (isLarge) {
        cells.push(<ChapterInsertCell key={`${chapterPosition}-insert`} isInChapterList={false} chapterPosition={Number(chapterPosition)} lineId={line.id} handleInsert={this.handleInsertNewChapter} showLine={chapterPosition == 0} color={line.color} tableLength={this.state.tableLength}/>)
      }
      const cards = cardMap[`${line.id}-${chapterId}`]
      const key = `${cards ? 'card' : 'blank'}-${chapterPosition}-${line.position}`
      if (cards) {
        cells.push(<ScenesCell
          key={key} cards={cards}
          chapterId={chapterId} lineId={line.id}
          chapterPosition={chapterPosition} linePosition={line.position}
          color={line.color} />)
      } else {
        cells.push(<BlankCard chapterId={chapterId} lineId={line.id}
          key={key}
          color={line.color} />)
      }
      return cells
    })
  }

  renderCardsByLine(chapter, lineMap, lineMapKeys) {
    const { cardMap } = this.props
    return lineMapKeys.flatMap((linePosition) => {
      const cells = []
      const line = lineMap[linePosition]
      const cards = cardMap[`${line.id}-${chapter.id}`]
      const key = `${cards ? 'card' : 'blank'}-${chapter.position}-${linePosition}`
      if (cards) {
        cells.push(
          <ScenesCell
            key={key}
            cards={cards}
            chapterId={chapter.id}
            lineId={line.id}
            chapterPosition={chapter.position}
            linePosition={linePosition}
            color={line.color}
            backgroundColor={line.backgroundColor}
          />
        )
      } else {
        cells.push(
          <BlankCard
            chapterId={chapter.id}
            lineId={line.id}
            key={key}
            color={line.color}
            backgroundColor={line.backgroundColor}
          />
        )
      }
      return cells
    })
  }

  render () {
    const { ui, isSmall } = this.props
    if (isSmall) {
      return <div className={cx('small-timeline__wrapper', {darkmode: ui.darkMode, vertical: ui.orientation == 'vertical'})}>
        <table className='table-header-rotated'>
          <TopRow />
          <tbody>
            { this.renderRows() }
          </tbody>
        </table>
      </div>
    } else {
      const rows = this.renderRows()

      return [<TopRow key="top-row"/>, rows]
    }
  }
}

TimelineTable.propTypes = {
  chapters: PropTypes.array,
  nextChapterId: PropTypes.number,
  beats: PropTypes.array,
  lines: PropTypes.array,
  seriesLines: PropTypes.array,
  cardMap: PropTypes.object.isRequired,
  ui: PropTypes.object.isRequired,
  isSeries: PropTypes.bool,
  isSmall: PropTypes.bool,
  isMedium: PropTypes.bool,
  isLarge: PropTypes.bool,
  tableRef: PropTypes.object,
}

function mapStateToProps(state) {
  let nextChapterId = -1
  const bookId = state.present.ui.currentTimeline
  if (bookId == 'series') {
    nextChapterId = nextId(state.present.beats)
  } else {
    nextChapterId = nextId(state.present.chapters)
  }
  return {
    chapters: sortedChaptersByBookSelector(state.present),
    nextChapterId: nextChapterId,
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
    sceneActions: bindActionCreators(SceneActions, dispatch),
    lineActions: bindActionCreators(LineActions, dispatch),
    cardActions: bindActionCreators(CardActions, dispatch),
    beatActions: bindActionCreators(BeatActions, dispatch),
    seriesLineActions: bindActionCreators(SeriesLineActions, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TimelineTable)
