import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Row } from 'react-sticky-table'
import ScenesCell from './ScenesCell'
import BlankCard from './BlankCard'
import LineTitleCell from './LineTitleCell'
import ChapterInsertCell from './ChapterInsertCell'
import TopRow from './TopRow'
import ChapterTitleCell from './ChapterTitleCell'
import AddLineRow from './AddLineRow'
import * as UIActions from 'actions/ui'
import * as SceneActions from 'actions/scenes'
import * as LineActions from 'actions/lines'
import * as BeatActions from 'actions/beats'
import * as SeriesLineActions from 'actions/seriesLines'
import * as CardActions from 'actions/cards'
import { reorderList } from 'helpers/lists'
import { insertChapter } from 'helpers/chapters'
import { card } from '../../../../shared/initialState'
import { nextId } from '../../store/newIds'
import { sortedChaptersByBookSelector } from '../../selectors/chapters'
import { sortedLinesByBookSelector } from '../../selectors/lines'
import { cardMapSelector } from '../../selectors/cards'
import { isSeriesSelector } from '../../selectors/ui'

class TimelineTable extends Component {
  state = { tableLength: 0 }

  setLength = () => {
    const table = this.props.tableRef
    let newLength = table.scrollWidth
    if (this.props.ui.orientation != 'horizontal') {
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

  componentWillReceiveProps(nextProps) {
    // not necessary since TimelineWrapper is handling this case in componentWillReceiveProps
    // if (nextProps.ui.orientation != this.props.ui.orientation) {
    //   this.setState({tableLength: 0})
    // }
    // not necessary since TimelineWrapper is handling this case in componentWillReceiveProps
    // if (nextProps.ui.currentTimeline != this.props.ui.currentTimeline) {
    //   this.setState({tableLength: 0})
    // }
    // not necessary since TimelineWrapper is handling this case in componentWillReceiveProps
    // if (nextProps.ui.zoomIndex != this.props.ui.zoomIndex || nextProps.ui.zoomState != this.props.ui.zoomState) {
    //   this.setState({tableLength: 0})
    // }
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

  renderLines() {
    const chapterMap = this.chapterMapping()
    const chapterMapKeys = Object.keys(chapterMap)
    return this.props.lines
      .map((line) => {
        return (
          <Row key={`lineId-${line.id}`}>
            <LineTitleCell
              line={line}
              handleReorder={this.handleReorderLines}
              bookId={this.props.ui.currentTimeline}
            />
            {this.renderCardsByChapter(line, chapterMap, chapterMapKeys)}
          </Row>
        )
      })
      .concat(<AddLineRow key="insert-line" bookId={this.props.ui.currentTimeline} />)
  }

  renderChapters() {
    const lineMap = this.lineMapping()
    const lineMapKeys = Object.keys(lineMap)
    const { chapters } = this.props
    return chapters
      .map((chapter) => {
        const inserts = lineMapKeys.flatMap((linePosition) => {
          const line = lineMap[linePosition]
          return (
            <ChapterInsertCell
              key={`${linePosition}-insert`}
              isInChapterList={false}
              chapterPosition={chapter.position}
              handleInsert={this.handleInsertNewChapter}
              color={line.color}
              showLine={chapter.position == 0}
              tableLength={this.state.tableLength}
            />
          )
        })
        return [
          <Row key={`chapterId-${chapter.id}`}>
            <ChapterInsertCell
              isInChapterList={true}
              chapterPosition={chapter.position}
              handleInsert={this.handleInsertNewChapter}
            />
            {inserts}
          </Row>,
          <Row key={`chapterId-${chapter.id}-insert`}>
            <ChapterTitleCell chapterId={chapter.id} handleReorder={this.handleReorderChapters} />
            {this.renderCardsByLine(chapter, lineMap, lineMapKeys)}
          </Row>,
        ]
      })
      .concat(
        <Row key="last-insert">
          <ChapterInsertCell
            isInChapterList={true}
            handleInsert={this.handleAppendChapter}
            isLast={true}
          />
        </Row>
      )
  }

  renderRows() {
    if (this.props.ui.orientation === 'horizontal') {
      return this.renderLines()
    } else {
      return this.renderChapters()
    }
  }

  renderCardsByChapter(line, chapterMap, chapterMapKeys) {
    const { cardMap } = this.props
    return chapterMapKeys.flatMap((chapterPosition) => {
      const cells = []
      const chapterId = chapterMap[chapterPosition]
      cells.push(
        <ChapterInsertCell
          key={`${chapterPosition}-insert`}
          isInChapterList={false}
          chapterPosition={Number(chapterPosition)}
          lineId={line.id}
          handleInsert={this.handleInsertNewChapter}
          showLine={chapterPosition == 0}
          color={line.color}
          tableLength={this.state.tableLength}
        />
      )
      const cards = cardMap[`${line.id}-${chapterId}`]
      const key = `${cards ? 'card' : 'blank'}-${chapterPosition}-${line.position}`
      if (cards) {
        cells.push(
          <ScenesCell
            key={key}
            cards={cards}
            chapterId={chapterId}
            lineId={line.id}
            chapterPosition={chapterPosition}
            linePosition={line.position}
            color={line.color}
          />
        )
      } else {
        cells.push(
          <BlankCard chapterId={chapterId} lineId={line.id} key={key} color={line.color} />
        )
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
          />
        )
      } else {
        cells.push(
          <BlankCard chapterId={chapter.id} lineId={line.id} key={key} color={line.color} />
        )
      }
      return cells
    })
  }

  render() {
    const rows = this.renderRows()

    return [<TopRow key="top-row" />, rows]
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
  tableRef: PropTypes.object,
  isSeries: PropTypes.bool,
  beatActions: PropTypes.object,
  sceneActions: PropTypes.object,
  seriesLineActions: PropTypes.object,
  cardActions: PropTypes.object,
  lineActions: PropTypes.object,
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
