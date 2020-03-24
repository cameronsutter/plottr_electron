import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Row, Cell } from 'react-sticky-table'
import { Glyphicon } from 'react-bootstrap'
import * as SceneActions from 'actions/scenes'
import * as LineActions from 'actions/lines'
import * as BeatActions from 'actions/beats'
import * as SeriesLineActions from 'actions/seriesLines'
import ChapterTitleCell from 'components/timeline/ChapterTitleCell'
import LineTitleCell from 'components/timeline/LineTitleCell'
import ChapterInsertCell from 'components/timeline/ChapterInsertCell'
import { reorderList } from 'helpers/lists'
import { insertChapter } from 'helpers/chapters'
import orientedClassName from 'helpers/orientedClassName'
import { nextId } from '../../store/newIds'
import { chaptersByBookSelector } from '../../selectors/chapters'
import { linesByBookSelector } from '../../selectors/lines'

class TopRow extends Component {

  isSeries = () => {
    return this.props.ui.currentTimeline == 'series'
  }

  handleReorderChapters = (originalPosition, droppedPosition) => {
    const { ui, beatActions, sceneActions } = this.props
    const chapters = reorderList(originalPosition, droppedPosition, this.props.chapters)
    if (this.isSeries()) {
      beatActions.reorderBeats(chapters)
    } else {
      sceneActions.reorderScenes(chapters, ui.currentTimeline)
    }
  }

  handleReorderLines = (originalPosition, droppedPosition) => {
    const { ui, lineActions, seriesLineActions } = this.props
    const lines = reorderList(originalPosition, droppedPosition, this.props.lines)
    if (this.isSeries()) {
      seriesLineActions.reorderSeriesLines(lines)
    } else {
      lineActions.reorderLines(lines, ui.currentTimeline)
    }
  }

  handleInsertNewChapter = (nextPosition) => {
    const { ui, beatActions, sceneActions } = this.props
    const chapters = insertChapter(nextPosition, this.props.chapters, this.props.nextChapterId)
    if (this.isSeries()) {
      beatActions.reorderBeats(chapters)
    } else {
      sceneActions.reorderScenes(chapters, ui.currentTimeline)
    }
  }

  handleAppendChapter = () => {
    const { ui, beatActions, sceneActions } = this.props
    if (this.isSeries()) {
      beatActions.addBeat()
    } else {
      sceneActions.addScene(ui.currentTimeline)
    }
  }

  handleAppendLine = () => {
    const { ui, lineActions, seriesLineActions } = this.props
    if (this.isSeries()) {
      seriesLineActions.addSeriesLine()
    } else {
      lineActions.addLine(ui.currentTimeline)
    }
  }

  renderLastInsertChapterCell () {
    const { orientation } = this.props.ui
    return <ChapterInsertCell key='last-insert' isInChapterList={true} handleInsert={this.handleAppendChapter} isLast={true} orientation={orientation}/>
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
    return [<Cell key='placeholder'/>].concat(renderedChapters).concat([this.renderLastInsertChapterCell()])
  }

  renderLines () {
    const lines = _.sortBy(this.props.lines, 'position')
    const renderedLines = lines.map(line => <LineTitleCell key={`line-${line.id}`} line={line} handleReorder={this.handleReorderLines} bookId={this.props.ui.currentTimeline}/>)
    return [<Cell key='placeholder'/>].concat(renderedLines).concat(
      <Row key='insert-line'>
        <Cell>
          <div
            className={orientedClassName('line-list__append-line', this.props.ui.orientation)}
            onClick={this.handleAppendLine}
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
  let nextChapterId = -1
  const bookId = state.ui.currentTimeline
  if (bookId == 'series') {
    // get all beats / seriesLines
    nextChapterId = nextId(state.beats)
  } else {
    // get all the chapters / lines for state.ui.currentTimeline (bookId)
    nextChapterId = nextId(state.chapters)
  }

  return {
    ui: state.ui,
    chapters: chaptersByBookSelector(state),
    nextChapterId: nextChapterId,
    lines: linesByBookSelector(state),
  }
}

function mapDispatchToProps (dispatch) {
  return {
    sceneActions: bindActionCreators(SceneActions, dispatch),
    lineActions: bindActionCreators(LineActions, dispatch),
    beatActions: bindActionCreators(BeatActions, dispatch),
    seriesLinesActions: bindActionCreators(SeriesLineActions, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TopRow)
