import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Row, Cell } from 'react-sticky-table'
import CardCell from 'components/timeline/CardCell'
import CardSVGline from 'components/timeline/CardSVGline'
import BlankCard from 'components/timeline/BlankCard'
import LineTitleCell from 'components/timeline/LineTitleCell'
import ChapterInsertCell from 'components/timeline/ChapterInsertCell'
import TopRow from 'components/timeline/TopRow'
import * as UIActions from 'actions/ui'
import * as SceneActions from 'actions/scenes'
import * as LineActions from 'actions/lines'
import * as BeatActions from 'actions/beats'
import * as SeriesLineActions from 'actions/seriesLines'
import * as CardActions from 'actions/cards'
import { reorderList } from 'helpers/lists'
import { insertChapter } from 'helpers/chapters'
import ChapterTitleCell from 'components/timeline/ChapterTitleCell'
import AddLineRow from './AddLineRow'
import { card } from '../../../../shared/initialState'
import { nextId } from '../../store/newIds'
import { sortedChaptersByBookSelector } from '../../selectors/chapters'
import { sortedLinesByBookSelector } from '../../selectors/lines'
import { findDOMNode } from 'react-dom'

class TimelineTable extends Component {

  state = {tableLength: 0}

  setLength = () => {
    const table = findDOMNode(this.props.tableRef)
    let newLength = table.scrollWidth
    if (this.props.ui.orientation != 'horizontal') {
      newLength = table.scrollHeight
    }
    if (this.state.tableLength != newLength) {
      this.setState({tableLength: newLength})
    }
  }

  componentDidMount () {
    this.setLength()
  }

  componentDidUpdate () {
    this.setLength()
  }

  componentWillReceiveProps (nextProps) {
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

  isSeries = () => {
    return this.props.ui.currentTimeline == 'series'
  }

  cardIsFiltered (card) {
    if (!card) return false
    const filter = this.props.filter
    if (filter == null) return true
    let filtered = true
    if (card.tags) {
      card.tags.forEach((tId) => {
        if (filter['tag'].indexOf(tId) !== -1) filtered = false
      })
    }
    if (card.characters) {
      card.characters.forEach((cId) => {
        if (filter['character'].indexOf(cId) !== -1) filtered = false
      })
    }
    if (card.places) {
      card.places.forEach((pId) => {
        if (filter['place'].indexOf(pId) !== -1) filtered = false
      })
    }
    return filtered
  }

  handleReorderChapters = (originalPosition, droppedPosition) => {
    const chapters = reorderList(originalPosition, droppedPosition, this.props.chapters)
    if (this.isSeries()) {
      this.props.beatActions.reorderBeats(chapters)
    } else {
      this.props.sceneActions.reorderScenes(chapters, this.props.ui.currentTimeline)
    }
  }

  handleReorderLines = (originalPosition, droppedPosition) => {
    const lines = reorderList(originalPosition, droppedPosition, this.props.lines)
    const actions = this.isSeries() ? this.props.seriesLineActions : this.props.lineActions
    actions.reorderLines(lines, this.props.ui.currentTimeline)
  }

  // TODO: this should be a selector
  cardMapping = () => {
    if (this.isSeries()) {
      return this.props.cards.reduce((acc, card) => {
        acc[`${card.seriesLineId}-${card.beatId}`] = card
        return acc
      }, {})
    } else {
      return this.props.cards.reduce((acc, card) => {
        acc[`${card.lineId}-${card.chapterId}`] = card
        return acc
      }, {})
    }
  }

  // TODO: this should be a selector
  chapterMapping () {
    const thing = this.props.chapters.reduce((acc, chapter) => {
      acc[chapter.position] = chapter.id
      return acc
    }, {})
    return thing
  }

  // TODO: this should be a selector
  lineMapping () {
    return this.props.lines.reduce((acc, line) => {
      acc[line.position] = line
      return acc
    }, {})
  }

  handleInsertNewChapter = (nextPosition, lineId) => {
    const chapters = insertChapter(nextPosition, this.props.chapters, this.props.nextChapterId, this.props.ui.currentTimeline)
    if (this.isSeries()) {
      this.props.beatActions.reorderBeats(chapters)
    } else {
      this.props.sceneActions.reorderScenes(chapters, this.props.ui.currentTimeline)
    }

    if (lineId && chapters[nextPosition]) {
      const chapterId = chapters[nextPosition].id
      this.props.cardActions.addCard(this.buildCard(lineId, chapterId))
    }
  }

  buildCard (lineId, chapterId) {
    if (this.isSeries()) {
      return Object.assign({}, card, { beatId: chapterId, seriesLineId: lineId })
    } else {
      return Object.assign({}, card, { chapterId, lineId })
    }
  }

  handleAppendChapter = () => {
    if (this.isSeries()) {
      this.props.beatActions.addBeat()
    } else {
      this.props.sceneActions.addScene(this.props.ui.currentTimeline)
    }
  }

  renderLines () {
    const chapterMap = this.chapterMapping()
    const chapterMapKeys = Object.keys(chapterMap)
    const cardMap = this.cardMapping()
    return this.props.lines.map(line => {
      return <Row key={`lineId-${line.id}`}>
        <LineTitleCell line={line} handleReorder={this.handleReorderLines} bookId={this.props.ui.currentTimeline}/>
        { this.renderCardsByChapter(line, chapterMap, chapterMapKeys, cardMap) }
      </Row>
    }).concat(<AddLineRow key='insert-line' bookId={this.props.ui.currentTimeline}/>)
  }

  renderChapters () {
    const lineMap = this.lineMapping()
    const lineMapKeys = Object.keys(lineMap)
    const cardMap = this.cardMapping()
    const { chapters } = this.props
    return chapters.map(chapter => {
      const inserts = lineMapKeys.flatMap(linePosition => {
        const line = lineMap[linePosition];
        return <ChapterInsertCell key={`${linePosition}-insert`} isInChapterList={false} chapterPosition={chapter.position} handleInsert={this.handleInsertNewChapter} color={line.color} showLine={chapter.position == 0} tableLength={this.state.tableLength}/>
      })
      return [<Row key={`chapterId-${chapter.id}`}>
          <ChapterInsertCell isInChapterList={true} chapterPosition={chapter.position} handleInsert={this.handleInsertNewChapter}/>
          { inserts }
        </Row>,
        <Row key={`chapterId-${chapter.id}-insert`}>
          <ChapterTitleCell chapterId={chapter.id} handleReorder={this.handleReorderChapters} />
          { this.renderCardsByLine(chapter, lineMap, lineMapKeys, cardMap) }
        </Row>
      ]
    }).concat(
      <Row key='last-insert'>
        <ChapterInsertCell isInChapterList={true} handleInsert={this.handleAppendChapter} isLast={true}/>
      </Row>
    )
  }

  renderRows () {
    if (this.props.ui.orientation === 'horizontal') {
      return this.renderLines()
    } else {
      return this.renderChapters()
    }
  }

  renderCardsByChapter (line, chapterMap, chapterMapKeys, cardMap) {
    return chapterMapKeys.flatMap(chapterPosition => {
      let filtered = false
      const cells = []
      let chapterId = chapterMap[chapterPosition]
      cells.push(<ChapterInsertCell key={`${chapterPosition}-insert`} isInChapterList={false} chapterPosition={Number(chapterPosition)} lineId={line.id} handleInsert={this.handleInsertNewChapter} showLine={chapterPosition == 0} color={line.color} tableLength={this.state.tableLength}/>)
      let card = cardMap[`${line.id}-${chapterId}`]
      if (card) {
        // This should be a selector on the card
        if (!this.props.filterIsEmpty && this.cardIsFiltered(card)) {
          filtered = true
        }
        cells.push(<CardCell
          key={`cardId-${card.id}`} card={card}
          chapterId={chapterId} lineId={line.id}
          chapterPosition={chapterPosition} linePosition={line.position}
          color={line.color} filtered={filtered} />)
      } else {
        cells.push(<BlankCard chapterId={chapterId} lineId={line.id}
          key={`blank-${chapterId}-${line.id}`}
          color={line.color} />)
      }
      return cells
    })
  }

  renderCardsByLine (chapter, lineMap, lineMapKeys, cardMap) {
    return lineMapKeys.flatMap(linePosition => {
      let filtered = false
      const cells = []
      let line = lineMap[linePosition]
      let card = cardMap[`${line.id}-${chapter.id}`]
      if (card) {
        if (!this.props.filterIsEmpty && this.cardIsFiltered(card)) {
          filtered = true
        }
        cells.push(<CardCell
          key={`cardId-${card.id}`} card={card}
          chapterId={chapter.id} lineId={line.id}
          chapterPosition={chapter.position} linePosition={linePosition}
          color={line.color} filtered={filtered} />)
      } else {
        cells.push(<BlankCard chapterId={chapter.id} lineId={line.id}
          key={`blank-${chapter.id}-${line.id}`}
          color={line.color} />)
      }
      return cells
    })
  }

  render () {
    const rows = this.renderRows()

    return [<TopRow key='top-row'/>, rows]
  }
}

TimelineTable.propTypes = {
  chapters: PropTypes.array,
  nextChapterId: PropTypes.number,
  beats: PropTypes.array,
  lines: PropTypes.array,
  seriesLines: PropTypes.array,
  cards: PropTypes.array.isRequired,
  ui: PropTypes.object.isRequired,
  filter: PropTypes.object,
  filterIsEmpty: PropTypes.bool,
  tableRef: PropTypes.object,
}

function mapStateToProps (state) {
  let nextChapterId = -1
  const bookId = state.ui.currentTimeline
  if (bookId == 'series') {
    nextChapterId = nextId(state.beats)
  } else {
    nextChapterId = nextId(state.chapters)
  }
  return {
    chapters: sortedChaptersByBookSelector(state),
    nextChapterId: nextChapterId,
    lines: sortedLinesByBookSelector(state),
    cards: state.cards,
    ui: state.ui,
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(UIActions, dispatch),
    sceneActions: bindActionCreators(SceneActions, dispatch),
    lineActions: bindActionCreators(LineActions, dispatch),
    cardActions: bindActionCreators(CardActions, dispatch),
    beatActions: bindActionCreators(BeatActions, dispatch),
    seriesLineActions: bindActionCreators(SeriesLineActions, dispatch),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TimelineTable)