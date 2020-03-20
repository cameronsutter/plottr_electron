import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Row, Cell } from 'react-sticky-table'
import { Glyphicon } from 'react-bootstrap'
import * as SceneActions from 'actions/scenes'
import * as LineActions from 'actions/lines'
import ChapterTitleCell from 'components/timeline/ChapterTitleCell'
import LineTitleCell from 'components/timeline/LineTitleCell'
import ChapterInsertCell from 'components/timeline/ChapterInsertCell'
import { reorderList } from 'helpers/lists'
import { insertChapter } from 'helpers/chapters'
import orientedClassName from 'helpers/orientedClassName'
import { nextId } from '../../store/newIds'

class TopRow extends Component {
  handleReorderChapters = (originalPosition, droppedPosition) => {
    const chapters = reorderList(originalPosition, droppedPosition, this.props.chapters)
    this.props.sceneActions.reorderScenes(chapters, this.props.ui.currentTimeline)
  }

  handleReorderLines = (originalPosition, droppedPosition) => {
    const lines = reorderList(originalPosition, droppedPosition, this.props.lines)
    this.props.lineActions.reorderLines(lines, this.props.ui.currentTimeline)
  }

  handleInsertNewChapter = (nextPosition) => {
    const chapters = insertChapter(nextPosition, this.props.chapters, this.props.nextChapterId)
    this.props.sceneActions.reorderScenes(chapters, this.props.ui.currentTimeline)
  }

  renderLastInsertSceneCell () {
    const { orientation, currentTimeline } = this.props.ui
    return <ChapterInsertCell key='last-insert' isInChapterList={true} handleInsert={() => this.props.sceneActions.addScene(currentTimeline)} isLast={true} orientation={orientation}/>
  }

  renderChapters () {
    const { orientation } = this.props.ui
    const chapters = _.sortBy(this.props.chapters, 'position')
    const renderedChapters = chapters.flatMap(ch => {
      const cells = []
      cells.push(<ChapterInsertCell key={`chapterId-${ch.id}-insert`} isInChapterList={true} chapterPosition={ch.position} handleInsert={this.handleInsertNewChapter} orientation={orientation}/>)
      cells.push(<ChapterTitleCell key={`chapterId-${ch.id}`} chapter={ch} handleReorder={this.handleReorderChapters} />)
      return cells
    })
    return [<Cell key='placeholder'/>].concat(renderedChapters).concat([this.renderLastInsertSceneCell()])
  }

  renderLines () {
    const { ui, lineActions } = this.props
    const lines = _.sortBy(this.props.lines, 'position')
    const renderedLines = lines.map(line => <LineTitleCell key={`line-${line.id}`} line={line} handleReorder={this.handleReorderLines}/>)
    return [<Cell key='placeholder'/>].concat(renderedLines).concat(
      <Row key='insert-line'>
        <Cell>
          <div
            className={orientedClassName('line-list__append-line', this.props.ui.orientation)}
            onClick={() => lineActions.addLine(ui.currentTimeline)}
          >
            <div className={orientedClassName('line-list__append-line-wrapper', this.props.ui.orientation)}>
              <Glyphicon glyph='plus' />
            </div>
          </div>
        </Cell>
      </Row>
    )
  }

  render () {
    let body = null
    if (this.props.ui.orientation === 'horizontal') body = this.renderChapters()
    else body = this.renderLines()
    return <Row>{body}</Row>
  }
}

TopRow.propTypes = {
  ui: PropTypes.object.isRequired,
  chapters: PropTypes.array,
  nextChapterId: PropTypes.number,
  lines: PropTypes.array,
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
    ui: state.ui,
    chapters: chapters,
    nextChapterId: nextChapterId,
    lines: lines,
  }
}

function mapDispatchToProps (dispatch) {
  return {
    sceneActions: bindActionCreators(SceneActions, dispatch),
    lineActions: bindActionCreators(LineActions, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TopRow)
