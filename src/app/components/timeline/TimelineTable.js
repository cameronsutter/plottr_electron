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
import * as CardActions from 'actions/cards'
import { reorderList } from 'helpers/lists'
import { insertChapter } from 'helpers/chapters'
import ChapterTitleCell from 'components/timeline/ChapterTitleCell'
import AddLineRow from './AddLineRow'
import { card } from '../../../../shared/initialState'
import { nextId } from '../../store/newIds'

class TimelineTable extends Component {

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

  labelMap () {
    var mapping = {}
    this.props.tags.forEach((t) => {
      mapping[t.title.toLowerCase()] = {color: t.color, id: t.id, type: 'Tag'}
    })
    this.props.characters.forEach((c) => {
      mapping[c.name.toLowerCase()] = {color: c.color, id: c.id, type: 'Character'}
    })
    this.props.places.forEach((p) => {
      mapping[p.name.toLowerCase()] = {color: p.color, id: p.id, type: 'Place'}
    })
    return mapping
  }

  cards (lineId) {
    let cards = []
    if (this.props.bookId == 'series') {
      cards = this.props.cards.filter(c => c.seriesLineId == lineId)
    } else {
      cards = this.props.cards.filter(c => c.lineId == lineId)
    }
    return _.sortBy(cards, 'position')
  }

  handleReorderChapters = (originalPosition, droppedPosition) => {
    const chapters = reorderList(originalPosition, droppedPosition, this.props.chapters)
    this.props.sceneActions.reorderScenes(chapters, this.props.ui.currentTimeline)
  }

  handleReorderLines = (originalPosition, droppedPosition) => {
    const lines = reorderList(originalPosition, droppedPosition, this.props.lines)
    this.props.lineActions.reorderLines(lines, this.props.ui.currentTimeline)
  }

  chapterMapping () {
    return this.props.chapters.reduce((acc, chapter) => {
      acc[chapter.position] = chapter.id
      return acc
    }, {})
  }

  lineMapping () {
    return this.props.lines.reduce((acc, line) => {
      acc[line.position] = line
      return acc
    }, {})
  }

  handleInsertNewChapter = (nextPosition, lineId) => {
    const chapters = insertChapter(nextPosition, this.props.chapters, this.props.nextChapterId)
    this.props.sceneActions.reorderScenes(chapters, this.props.ui.currentTimeline)

    if (lineId && chapters[nextPosition]) {
      const chapterId = chapters[nextPosition].id
      this.props.cardActions.addCard(this.buildCard(lineId, chapterId))
    }
  }

  buildCard (lineId, chapterId) {
    return Object.assign(card, { chapterId, lineId })
  }

  renderLines () {
    const chapterMap = this.chapterMapping()
    const labelMap = this.labelMap()
    const lines = _.sortBy(this.props.lines, 'position')
    return lines.map(line => {
      return <Row key={`lineId-${line.id}`}>
        <LineTitleCell line={line} handleReorder={this.handleReorderLines}/>
        { this.renderCardsByChapter(line, chapterMap, labelMap) }
      </Row>
    }).concat(<AddLineRow key='insert-line' bookId={this.props.bookId}/>)
  }

  renderChapters () {
    const lineMap = this.lineMapping()
    const labelMap = this.labelMap()
    const chapters = _.sortBy(this.props.chapters, 'position')
    const { orientation, currentTimeline } = this.props.ui
    return chapters.map(chapter => {
      const inserts = Object.keys(lineMap).flatMap(linePosition => {
        const line = lineMap[linePosition];
        return <ChapterInsertCell key={`${linePosition}-insert`} isInChapterList={false} chapterPosition={chapter.position} handleInsert={this.handleInsertNewChapter} color={line.color} orientation={orientation} needsSVGline={true}/>
      })
      return [<Row key={`chapterId-${chapter.id}`}>
          <ChapterInsertCell isInChapterList={true} chapterPosition={chapter.position} handleInsert={this.handleInsertNewChapter} orientation={orientation}/>
          { inserts }
        </Row>,
        <Row key={`chapterId-${chapter.id}-insert`}>
          <ChapterTitleCell chapter={chapter} handleReorder={this.handleReorderChapters} />
          { this.renderCardsByLine(chapter, lineMap, labelMap) }
        </Row>
      ]
    }).concat(
      <Row key='last-insert'>
        <ChapterInsertCell isInChapterList={true} handleInsert={() => this.props.sceneActions.addScene(currentTimeline)} isLast={true} orientation={orientation}/>
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

  renderCardsByChapter (line, chapterMap, labelMap) {
    const { orientation } = this.props.ui
    return Object.keys(chapterMap).flatMap(chapterPosition => {
      let filtered = false
      const cells = []
      let chapterId = chapterMap[chapterPosition]
      let card = _.find(this.cards(line.id), {chapterId: chapterId})
      cells.push(<ChapterInsertCell key={`${chapterPosition}-insert`} isInChapterList={false} chapterPosition={Number(chapterPosition)} lineId={line.id} handleInsert={this.handleInsertNewChapter} needsSVGline={chapterPosition == 0} color={line.color} orientation={orientation}/>)
      if (card) {
        if (!this.props.filterIsEmpty && this.cardIsFiltered(card)) {
          filtered = true
        }
        cells.push(<CardCell
          key={`cardId-${card.id}`} card={card}
          chapterId={chapterId} lineId={line.id}
          labelMap={labelMap}
          color={line.color} filtered={filtered} />)
      } else {
        cells.push(<BlankCard chapterId={chapterId} lineId={line.id}
          key={`blank-${chapterId}-${line.id}`}
          color={line.color} />)
      }
      return cells
    })
  }

  renderCardsByLine (chapter, lineMap, labelMap) {
    return Object.keys(lineMap).flatMap(linePosition => {
      let filtered = false
      const cells = []
      let line = lineMap[linePosition]
      let card = _.find(this.cards(line.id), {chapterId: chapter.id})
      if (card) {
        if (!this.props.filterIsEmpty && this.cardIsFiltered(card)) {
          filtered = true
        }
        cells.push(<CardCell
          key={`cardId-${card.id}`} card={card}
          chapterId={chapter.id} lineId={line.id}
          labelMap={labelMap}
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
  tags: PropTypes.array.isRequired,
  characters: PropTypes.array.isRequired,
  places: PropTypes.array.isRequired,
  ui: PropTypes.object.isRequired,
  filter: PropTypes.object,
  filterIsEmpty: PropTypes.bool,
}

function mapStateToProps (state) {
  let chapters = []
  let lines = []
  let nextChapterId = -1
  const bookId = state.ui.currentTimeline
  if (bookId == 'series') {
    // get all beats / seriesLines
    chapters = state.beats
    lines = state.seriesLines
    nextChapterId = nextId(state.beats)
  } else {
    // get all the chapters / lines for state.ui.currentTimeline (bookId)
    chapters = state.chapters.filter(ch => ch.bookId == bookId)
    lines = state.lines.filter(l => l.bookId == bookId)
    nextChapterId = nextId(state.chapters)
  }
  return {
    chapters: chapters,
    nextChapterId: nextChapterId,
    lines: lines,
    cards: state.cards,
    tags: state.tags,
    characters: state.characters,
    places: state.places,
    ui: state.ui,
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(UIActions, dispatch),
    sceneActions: bindActionCreators(SceneActions, dispatch),
    lineActions: bindActionCreators(LineActions, dispatch),
    cardActions: bindActionCreators(CardActions, dispatch),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TimelineTable)