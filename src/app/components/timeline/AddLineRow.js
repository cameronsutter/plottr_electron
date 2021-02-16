import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Row, Cell } from 'react-sticky-table'
import { Glyphicon } from 'react-bootstrap'
import i18n from 'format-message'
import cx from 'classnames'
import { sortBy } from 'lodash'
import TemplatePicker from '../../../common/components/templates/TemplatePicker'
import { helpers, actions, selectors, lineColors, initialState } from 'pltr/v2'
import InputModal from '../dialogs/InputModal'

const { nextColor } = lineColors
const card = initialState.card
const defaultLine = initialState.line

const {
  books: { isSeries },
} = helpers

class AddLineRow extends Component {
  state = {
    hovering: false,
    showTemplatePicker: false,
    askingForInput: false,
  }
  allBeats = []
  allLines = []
  allCards = []
  nextBeatId = null
  nextLineId = null
  nextCardId = null
  newLineMapping = {}
  newBeatOffset = 0

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

  addBeats = (templateBeats, bookId, template) => {
    if (!templateBeats) return
    templateBeats = sortBy(templateBeats, 'position')

    const allAreAuto = templateBeats.every((beat) => beat.title == 'auto')

    // situations
    // 1. there are < 2 current beats
    // 2. there are > 2 current beats
    //    a. template has allAuto beats (doesn't care about names)
    //        1. current are less than how many the template needs
    //    b. template has beat titles (cares about names)
    //        1. current are less than how many the template needs
    //        2. current are enough (or more) than how many the template needs

    if (this.allBeats.length < 2) {
      // replace the current beat with beats from template
      this.allBeats = templateBeats.map((tCh) => {
        const id = this.nextBeatId
        ++this.nextBeatId
        return {
          ...tCh,
          id: id,
          bookId: bookId,
          fromTemplateId: template.id,
        }
      })
    } else {
      if (allAreAuto) {
        if (this.allBeats.length < templateBeats.length) {
          // add more auto beats
          templateBeats.slice(this.allBeats.length).forEach((tCh) => {
            const id = this.nextBeatId
            ++this.nextBeatId
            const last = this.getLast(this.allBeats)
            const newBeat = {
              ...tCh,
              id: id,
              bookId: bookId,
              position: last.position + 1,
              fromTemplateId: template.id,
            }
            this.allBeats.push(newBeat)
          })
        }
      } else {
        if (this.allBeats.length < templateBeats.length) {
          // add them to the end
          this.newBeatOffset = this.allBeats.length
          templateBeats.forEach((tCh) => {
            const id = this.nextBeatId
            ++this.nextBeatId
            const last = this.getLast(this.allBeats)
            const newBeat = {
              ...tCh,
              id: id,
              bookId: bookId,
              position: last.position + 1,
              fromTemplateId: template.id,
            }
            this.allBeats.push(newBeat)
          })
        } else {
          // add a new line and add beats as cards
          this.addBlankLine(template, bookId)
          let thisLine = this.getLast(this.allLines)

          templateBeats.forEach((tCh) => {
            const id = this.nextCardId
            ++this.nextCardId
            const newCard = Object.assign({}, card, {
              id: id,
              bookId: bookId,
              lineId: thisLine.id,
              beatId: this.allBeats[tCh.position].id,
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
      // We do not want to add lines for series.
      if (tL.bookId === 'series') return

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

  addCards = (templateCards, templateBeats, bookId, template) => {
    if (!templateCards) return

    const beatsPositionById = this.getPositionById(templateBeats)
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
      const beatPosition = beatsPositionById[tC.beatId]
      const beat =
        this.allBeats[beatPosition + this.newBeatOffset] || this.allBeats[this.allBeats.length - 1] // default to last beat ... not sure if that's right to do
      const beatId = beat ? beat.id : 0 // default to no beat ... again not sure if that's right
      const newCard = {
        ...tC,
        id: id,
        bookId: bookId,
        beatId: beatId,
        lineId: lineId,
        fromTemplateId: template.id,
      }
      this.allCards.push(newCard)
      ++this.nextCardId
    })
  }

  handleChooseTemplate = (template) => {
    const { ui, actions } = this.props
    let bookId = ui.currentTimeline

    this.nextLineId = this.props.nextLineId
    this.nextCardId = this.props.nextCardId
    this.nextBeatId = this.props.nextBeatId

    this.allBeats = this.props.beats
    this.allLines = this.props.lines
    this.allCards = this.props.cards

    this.addBeats(template.beats, bookId, template)
    this.addLines(template.lines, bookId, true, template)
    this.addCards(template.cards, template.beats, bookId, template)

    actions.addLinesFromTemplate(this.allCards, this.allLines, this.allBeats, template, bookId)
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
    const { bookId, isSmall, isMedium } = this.props
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

    const appendKlass = cx('line-list__append-line', { 'medium-timeline': isMedium })
    if (!isSeries(bookId)) {
      return (
        <div className={appendKlass}>
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
        <div className={appendKlass} onClick={() => this.setState({ askingForInput: true })}>
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
    isMedium: PropTypes.bool,
    bookId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    beats: PropTypes.array,
    lines: PropTypes.array,
    cards: PropTypes.array,
    nextLineId: PropTypes.number,
    nextBeatId: PropTypes.number,
    nextCardId: PropTypes.number,
    actions: PropTypes.object,
  }
}

function mapStateToProps(state) {
  return {
    ui: state.present.ui,
    isSmall: selectors.isSmallSelector(state.present),
    isMedium: selectors.isMediumSelector(state.present),
    beats: selectors.sortedBeatsByBookSelector(state.present),
    lines: selectors.linesByBookSelector(state.present),
    cards: state.present.cards,
    nextLineId: selectors.nextLineIdSelector(state.present),
    nextBeatId: selectors.nextBeatIdSelector(state.present),
    nextCardId: selectors.nextCardIdSelector(state.present),
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(actions.line, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AddLineRow)
