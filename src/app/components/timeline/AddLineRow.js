import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Row, Cell } from 'react-sticky-table'
import { Glyphicon } from 'react-bootstrap'
import i18n from 'format-message'
import { sortBy } from 'lodash'
import TemplatePicker from '../../../common/components/templates/TemplatePicker'
import {
  card,
  chapter as defaultChapter,
  line as defaultLine,
} from '../../../../shared/initialState'
import { actions, selectors, nextColor } from 'pltr/v2'
import InputModal from '../dialogs/InputModal'

const {
  nextCardIdSelector,
  sortedChaptersByBookSelector,
  nextChapterIdSelector,
  linesByBookSelector,
  nextLineIdSelector,
  isSmallSelector,
} = selectors
const LineActions = actions.line
const SeriesLineActions = actions.series

class AddLineRow extends Component {
  state = {
    hovering: false,
    showTemplatePicker: false,
    askingForInput: false,
  }
  allChapters = []
  allLines = []
  allCards = []
  nextChapterId = null
  nextLineId = null
  nextCardId = null
  newLineMapping = {}
  newChapterOffset = 0

  getLast = (list) => {
    return list[list.length - 1]
  }

  getPositionById = (list) => {
    return list.reduce((acc, item) => {
      acc[item.id] = item.position
      return acc
    }, {})
  }

  addBlankLine = (template, bookId) => {
    const newLine = Object.assign({}, defaultLine, { title: template.name, bookId: bookId })
    this.addLines([newLine], bookId, false, template)
  }

  addChapters = (templateChapters, bookId, template) => {
    if (!templateChapters) return
    templateChapters = sortBy(templateChapters, 'position')

    const allAreAuto = templateChapters.every((ch) => ch.title == 'auto')

    // situations
    // 1. there are < 2 current chapters
    // 2. there are > 2 current chapters
    //    a. template has allAuto chapters (doesn't care about names)
    //        1. current are less than how many the template needs
    //    b. template has chapter titles (cares about names)
    //        1. current are less than how many the template needs
    //        2. current are enough (or more) than how many the template needs

    if (this.allChapters.length < 2) {
      // replace the current chapter with chapters from template
      this.allChapters = templateChapters.map((tCh) => {
        const id = this.nextChapterId
        ++this.nextChapterId
        return {
          ...tCh,
          id: id,
          bookId: bookId,
          fromTemplateId: template.id,
        }
      })
    } else {
      if (allAreAuto) {
        if (this.allChapters.length < templateChapters.length) {
          // add more auto chapters
          templateChapters.slice(this.allChapters.length).forEach((tCh) => {
            const id = this.nextChapterId
            ++this.nextChapterId
            const last = this.getLast(this.allChapters)
            const newChapter = {
              ...tCh,
              id: id,
              bookId: bookId,
              position: last.position + 1,
              fromTemplateId: template.id,
            }
            this.allChapters.push(newChapter)
          })
        }
      } else {
        if (this.allChapters.length < templateChapters.length) {
          // add them to the end
          this.newChapterOffset = this.allChapters.length
          templateChapters.forEach((tCh) => {
            const id = this.nextChapterId
            ++this.nextChapterId
            const last = this.getLast(this.allChapters)
            const newChapter = {
              ...tCh,
              id: id,
              bookId: bookId,
              position: last.position + 1,
              fromTemplateId: template.id,
            }
            this.allChapters.push(newChapter)
          })
        } else {
          // add a new line and add chapters as cards
          this.addBlankLine(template, bookId)
          let thisLine = this.getLast(this.allLines)

          templateChapters.forEach((tCh) => {
            const id = this.nextCardId
            ++this.nextCardId
            const newCard = Object.assign({}, card, {
              id: id,
              bookId: bookId,
              lineId: thisLine.id,
              chapterId: this.allChapters[tCh.position].id,
              title: tCh.title,
              fromTemplateId: template.id,
            })
            this.allCards.push(newCard)
          })
        }
      }
    }
  }

  addLines = (templateLines, bookId, remember, template) => {
    if (!templateLines) return
    templateLines = sortBy(templateLines, 'position')

    templateLines.forEach((tL) => {
      const id = this.nextLineId
      if (remember) this.newLineMapping[tL.id] = id // remember old line id -> new line id
      const lastLine = this.getLast(this.allLines)
      const lastPosition = lastLine ? lastLine.position : 0
      const color = nextColor(this.allLines.length)
      const newLine = {
        ...tL,
        id: id,
        bookId: bookId,
        position: lastPosition + 1 + tL.position,
        color: color,
        fromTemplateId: template.id,
      }
      this.allLines.push(newLine)
      ++this.nextLineId
    })
  }

  addCards = (templateCards, templateChapters, bookId, template) => {
    if (!templateCards) return

    const chaptersPositionById = this.getPositionById(templateChapters)
    let useLines = true
    let lineId = null

    // if the template doesn't have any lines, add a new one
    if (!Object.keys(this.newLineMapping).length) {
      useLines = false
      this.addBlankLine(template, bookId)
      const lastLine = this.getLast(this.allLines)
      if (lastLine) lineId = lastLine.id
    }

    templateCards.forEach((tC) => {
      const id = this.nextCardId
      lineId = useLines ? this.newLineMapping[tC.lineId] : lineId
      const chapterPosition = chaptersPositionById[tC.chapterId]
      const chapter =
        this.allChapters[chapterPosition + this.newChapterOffset] ||
        this.allChapters[this.allChapters.length - 1] // default to last chapter ... not sure if that's right to do
      const chapterId = chapter ? chapter.id : 0 // default to no chapter ... again not sure if that's right
      const newCard = {
        ...tC,
        id: id,
        bookId: bookId,
        chapterId: chapterId,
        lineId: lineId,
        fromTemplateId: template.id,
      }
      this.allCards.push(newCard)
      ++this.nextCardId
    })
  }

  handleChooseTemplate = (template) => {
    // NOTE: doesn't work for series lines
    const { ui, actions } = this.props
    const templateData = template.templateData
    let bookId = ui.currentTimeline

    this.nextLineId = this.props.nextLineId
    this.nextCardId = this.props.nextCardId
    this.nextChapterId = this.props.nextChapterId

    this.allChapters = this.props.chapters
    this.allLines = this.props.lines
    this.allCards = this.props.cards

    this.addChapters(templateData.chapters, bookId, template)
    this.addLines(templateData.lines, bookId, true, template)
    this.addCards(templateData.cards, templateData.chapters, bookId, template)

    actions.addLinesFromTemplate(this.allCards, this.allLines, this.allChapters, bookId, template)
    this.setState({ showTemplatePicker: false })
  }

  simpleAddLine = (title) => {
    const { ui, actions } = this.props
    actions.addLineWithTitle(title, ui.currentTimeline)
    this.setState({ askingForInput: false, hovering: false })
  }

  renderInputModal() {
    if (!this.state.askingForInput) return null

    return (
      <InputModal
        isOpen={true}
        getValue={this.simpleAddLine}
        title={i18n('Plotline Title:')}
        type="text"
        cancel={() => this.setState({ askingForInput: false, hovering: false })}
      />
    )
  }

  renderInsertButton() {
    const { bookId, isSmall } = this.props
    if (isSmall) {
      return (
        <th className="row-header">
          {this.renderInputModal()}
          <div
            className="line-list__append-line"
            onClick={() => this.setState({ askingForInput: true })}
          >
            <div className="line-list__append-line-wrapper">
              <Glyphicon glyph="plus" />
            </div>
          </div>
        </th>
      )
    }

    if (bookId != 'series') {
      return (
        <div className="line-list__append-line">
          {this.renderInputModal()}
          {this.state.hovering ? (
            <div className="line-list__append-line__double">
              <div
                onClick={() => this.setState({ showTemplatePicker: true, hovering: false })}
                className="template"
              >
                {i18n('Use Template')}
              </div>
              <div onClick={() => this.setState({ askingForInput: true })} className="non-template">
                <Glyphicon glyph="plus" />
              </div>
            </div>
          ) : (
            <div className="line-list__append-line-wrapper">
              <Glyphicon glyph="plus" />
            </div>
          )}
        </div>
      )
    } else {
      return (
        <div
          className="line-list__append-line"
          onClick={() => this.setState({ askingForInput: true })}
        >
          {this.renderInputModal()}
          <div className="line-list__append-line-wrapper">
            <Glyphicon glyph="plus" />
          </div>
        </div>
      )
    }
  }

  renderTemplatePicker() {
    if (!this.state.showTemplatePicker) return null

    return (
      <TemplatePicker
        type={['plotlines']}
        modal={true}
        isOpen={this.state.showTemplatePicker}
        close={() => this.setState({ showTemplatePicker: false })}
        onChooseTemplate={this.handleChooseTemplate}
      />
    )
  }

  render() {
    const { isSmall, howManyCells } = this.props
    if (isSmall) {
      const tds = [<td key={howManyCells + 1} />]
      for (let i = 0; i < howManyCells; i++) {
        tds.push(<td key={i} />)
      }
      return (
        <tr>
          {this.renderInsertButton()}
          {tds}
        </tr>
      )
    } else {
      return (
        <Row>
          <Cell
            onMouseEnter={() => this.setState({ hovering: true })}
            onMouseLeave={() => this.setState({ hovering: false })}
          >
            {this.renderInsertButton()}
            {this.renderTemplatePicker()}
          </Cell>
        </Row>
      )
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.showTemplatePicker != nextState.showTemplatePicker) return true
    if (this.state.hovering != nextState.hovering) return true
    if (this.state.askingForInput != nextState.askingForInput) return true
    return false
  }

  static propTypes = {
    howManyCells: PropTypes.number,
    ui: PropTypes.object.isRequired,
    isSmall: PropTypes.bool,
    bookId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    chapters: PropTypes.array,
    lines: PropTypes.array,
    cards: PropTypes.array,
    nextLineId: PropTypes.number,
    nextChapterId: PropTypes.number,
    nextCardId: PropTypes.number,
    actions: PropTypes.object,
  }
}

function mapStateToProps(state) {
  return {
    ui: state.present.ui,
    isSmall: isSmallSelector(state.present),
    chapters: sortedChaptersByBookSelector(state.present),
    lines: linesByBookSelector(state.present),
    cards: state.present.cards,
    nextLineId: nextLineIdSelector(state.present),
    nextChapterId: nextChapterIdSelector(state.present),
    nextCardId: nextCardIdSelector(state.present),
  }
}

function mapDispatchToProps(dispatch, ownProps) {
  let actions = ownProps.bookId == 'series' ? SeriesLineActions : LineActions
  return {
    actions: bindActionCreators(actions, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AddLineRow)
