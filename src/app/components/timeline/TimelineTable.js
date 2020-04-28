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

  state = {tableWidth: 0}

  setWidth = () => {
    const newWidth = findDOMNode(this.props.tableRef).scrollWidth
    if (this.state.tableWidth != newWidth) {
      this.setState({tableWidth: newWidth})
    }
  }

  componentDidMount () {
    this.setWidth()
  }

  componentDidUpdate () {
    this.setWidth()
  }

  // not necessary since TimelineWrapper is handling this case in componentWillReceiveProps
  // componentWillReceiveProps (nextProps) {
  //   if (nextProps.ui.currentTimeline != this.props.ui.currentTimeline) {
  //     this.setState({tableWidth: 0})
  //   }
  // }

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

  cards = (lineId) => {
    let cards = []
    if (this.isSeries()) {
      cards = this.props.cards.filter(c => c.seriesLineId == lineId)
    } else {
      cards = this.props.cards.filter(c => c.lineId == lineId)
    }
    return _.sortBy(cards, 'position')
  }

  findCard = (lineId, chapterId) => {
    let findIds = {}
    if (this.isSeries()) {
      findIds = {beatId: chapterId}
    } else {
      findIds = {chapterId: chapterId}
    }
    return _.find(this.cards(lineId), findIds)
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
  chapterMapping () {
    const thing = this.props.chapters.reduce((acc, chapter) => {
      acc[chapter.position] = chapter.id
      return acc
    }, {})
    return thing
  }

  // TODO: this should be a selector
  lineMapping () {
    console.log('mapping lines')
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
    return this.props.lines.map(line => {
      return <Row key={`lineId-${line.id}`}>
        <LineTitleCell line={line} handleReorder={this.handleReorderLines} bookId={this.props.ui.currentTimeline}/>
        { this.renderCardsByChapter(line, chapterMap) }
      </Row>
    }).concat(<AddLineRow key='insert-line' bookId={this.props.ui.currentTimeline}/>)
  }

  renderChapters () {
    const lineMap = this.lineMapping()
    const { ui, chapters } = this.props
    return chapters.map(chapter => {
      const inserts = Object.keys(lineMap).flatMap(linePosition => {
        const line = lineMap[linePosition];
        return <ChapterInsertCell key={`${linePosition}-insert`} isInChapterList={false} chapterPosition={chapter.position} handleInsert={this.handleInsertNewChapter} color={line.color} orientation={ui.orientation} needsSVGline={true}/>
      })
      return [<Row key={`chapterId-${chapter.id}`}>
          <ChapterInsertCell isInChapterList={true} chapterPosition={chapter.position} handleInsert={this.handleInsertNewChapter} orientation={ui.orientation}/>
          { inserts }
        </Row>,
        <Row key={`chapterId-${chapter.id}-insert`}>
          <ChapterTitleCell chapter={chapter} handleReorder={this.handleReorderChapters} />
          { this.renderCardsByLine(chapter, lineMap) }
        </Row>
      ]
    }).concat(
      <Row key='last-insert'>
        <ChapterInsertCell isInChapterList={true} handleInsert={this.handleAppendChapter} isLast={true} orientation={ui.orientation}/>
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

  renderCardsByChapter (line, chapterMap) {
    const { orientation } = this.props.ui
    return Object.keys(chapterMap).flatMap(chapterPosition => {
      let filtered = false
      const cells = []
      let chapterId = chapterMap[chapterPosition]
      let card = this.findCard(line.id, chapterId)
      cells.push(<ChapterInsertCell key={`${chapterPosition}-insert`} isInChapterList={false} chapterPosition={Number(chapterPosition)} lineId={line.id} handleInsert={this.handleInsertNewChapter} needsSVGline={chapterPosition == 0} color={line.color} orientation={orientation} tableWidth={this.state.tableWidth}/>)
      if (card) {
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

  renderCardsByLine (chapter, lineMap) {
    return Object.keys(lineMap).flatMap(linePosition => {
      let filtered = false
      const cells = []
      let line = lineMap[linePosition]
      let card = this.findCard(line.id, chapter.id)
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

  renderSpacer (color) {
    return <Cell key='placeholder'>
      <div>
        <CardSVGline color={color} spacer={true} orientation={this.props.ui.orientation}/>
        <div className='line-list__spacer'></div>
      </div>
    </Cell>
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