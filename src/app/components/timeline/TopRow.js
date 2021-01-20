import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Row, Cell } from 'react-sticky-table'
import { Glyphicon } from 'react-bootstrap'
import * as SceneActions from 'actions/scenes'
import * as BeatActions from 'actions/beats'
import * as SeriesLineActions from 'actions/seriesLines'
import ChapterTitleCell from 'components/timeline/ChapterTitleCell'
import LineTitleCell from 'components/timeline/LineTitleCell'
import ChapterInsertCell from 'components/timeline/ChapterInsertCell'
import { reorderList } from 'helpers/lists'
import { insertChapter } from 'helpers/chapters'
import orientedClassName from 'helpers/orientedClassName'
import { nextId } from '../../store/newIds'
import { sortedChaptersByBookSelector } from '../../selectors/chapters'
import { sortedLinesByBookSelector } from '../../selectors/lines'
import { isSeriesSelector, isLargeSelector, isMediumSelector, isSmallSelector } from '../../selectors/ui'

const LineActions = actions.lineActions

class TopRow extends Component {
  handleReorderChapters = (originalPosition, droppedPosition) => {
    const { ui, beatActions, sceneActions, isSeries, chapters } = this.props
    const newChapters = reorderList(originalPosition, droppedPosition, chapters)
    if (isSeries) {
      beatActions.reorderBeats(newChapters)
    } else {
      sceneActions.reorderScenes(newChapters, ui.currentTimeline)
    }
  }

  handleReorderLines = (originalPosition, droppedPosition) => {
    const { ui, lineActions, seriesLineActions, isSeries, lines } = this.props
    const newLines = reorderList(originalPosition, droppedPosition, lines)
    if (isSeries) {
      seriesLineActions.reorderLines(newLines)
    } else {
      lineActions.reorderLines(newLines, ui.currentTimeline)
    }
  }

  handleInsertNewChapter = (nextPosition) => {
    const { ui, beatActions, sceneActions, isSeries, chapters, nextChapterId } = this.props
    const newChapters = insertChapter(nextPosition, chapters, nextChapterId, ui.currentTimeline)
    if (isSeries) {
      beatActions.reorderBeats(newChapters)
    } else {
      sceneActions.reorderScenes(newChapters, ui.currentTimeline)
    }
  }

  handleAppendChapter = () => {
    const { ui, beatActions, sceneActions, isSeries } = this.props
    if (isSeries) {
      beatActions.addBeat()
    } else {
      sceneActions.addScene(ui.currentTimeline)
    }
  }

  handleAppendLine = () => {
    const { ui, lineActions, seriesLineActions, isSeries } = this.props
    if (isSeries) {
      seriesLineActions.addLine()
    } else {
      lineActions.addLine(ui.currentTimeline)
    }
  }

  renderLastInsertChapterCell() {
    const { orientation } = this.props.ui
    return (
      <ChapterInsertCell
        key="last-insert"
        isInChapterList={true}
        handleInsert={this.handleAppendChapter}
        isLast={true}
        orientation={orientation}
      />
    )
  }

  renderChapters () {
    const { ui, chapters, isLarge, isMedium } = this.props
    const renderedChapters = chapters.flatMap(ch => {
      const cells = []
      if (isLarge) {
        cells.push(
          <ChapterInsertCell
            key={`chapterId-${ch.id}-insert`}
            isInChapterList={true}
            chapterPosition={ch.position}
            handleInsert={this.handleInsertNewChapter}
            orientation={ui.orientation}
          />
        )
      }
      cells.push(
        <ChapterTitleCell
          key={`chapterId-${ch.id}`}
          chapterId={ch.id}
          handleReorder={this.handleReorderChapters}
        />
      )
      return cells
    })
    if (isLarge) {
      return [<Cell key='placeholder'/>]
        .concat(renderedChapters)
        .concat([this.renderLastInsertChapterCell()])
    }
    if (isMedium) {
      return [<Cell key='placeholder'/>].concat(renderedChapters)
    } else {
      return renderedChapters
    }
  }

  renderLines () {
    const { lines, ui, isSmall, isLarge } = this.props
    const renderedLines = lines.map(line => <LineTitleCell key={`line-${line.id}`} line={line} handleReorder={this.handleReorderLines} bookId={ui.currentTimeline}/>)
    if (isSmall) return renderedLines

    let array = [<Cell key='placeholder'/>].concat(renderedLines)
    if (isLarge) {
      array = array.concat(
        <Row key='insert-line'>
          <Cell>
            <div
              className={orientedClassName('line-list__append-line', ui.orientation)}
              onClick={this.handleAppendLine}
            >
              <div className={orientedClassName('line-list__append-line-wrapper', ui.orientation)}>
                <Glyphicon glyph='plus' />
              </div>
            </div>
          </Cell>
        </Row>
      )
    }
    return array
  }

  render() {
    const { ui, isSmall } = this.props
    let body = null
    if (ui.orientation === 'horizontal') body = this.renderChapters()
    else body = this.renderLines()

    if (isSmall) {
      return <thead>
        <tr>
          <th></th>
          { body }
        </tr>
      </thead>
    } else {
      return <Row>{body}</Row>
    }
  }
}

TopRow.propTypes = {
  ui: PropTypes.object.isRequired,
  isSeries: PropTypes.bool,
  isSmall: PropTypes.bool,
  isMedium: PropTypes.bool,
  isLarge: PropTypes.bool,
  chapters: PropTypes.array,
  nextChapterId: PropTypes.number,
  lines: PropTypes.array,
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
    ui: state.present.ui,
    isSeries: isSeriesSelector(state.present),
    isSmall: isSmallSelector(state.present),
    isMedium: isMediumSelector(state.present),
    isLarge: isLargeSelector(state.present),
    chapters: sortedChaptersByBookSelector(state.present),
    nextChapterId: nextChapterId,
    lines: sortedLinesByBookSelector(state.present),
  }
}

function mapDispatchToProps(dispatch) {
  return {
    sceneActions: bindActionCreators(SceneActions, dispatch),
    lineActions: bindActionCreators(LineActions, dispatch),
    beatActions: bindActionCreators(BeatActions, dispatch),
    seriesLineActions: bindActionCreators(SeriesLineActions, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TopRow)
