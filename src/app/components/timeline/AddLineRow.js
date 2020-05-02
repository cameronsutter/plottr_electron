import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Row, Cell } from 'react-sticky-table'
import { Glyphicon } from 'react-bootstrap'
import i18n from 'format-message'
import _ from 'lodash'
import * as LineActions from 'actions/lines'
import * as SeriesLineActions from 'actions/seriesLines'
import TemplatePicker from '../../../common/components/templates/TemplatePicker'
import { nextId } from '../../store/newIds'
import { card, chapter as defaultChapter } from '../../../../shared/initialState'
import { sortedChaptersByBookSelector } from '../../selectors/chapters'
import { linesByBookSelector } from '../../selectors/lines'

class AddLineRow extends Component {
  state = {
    hovering: false,
    showTemplatePicker: false,
  }

  createChapters = (templateName, templateChapters, currentChapters, cardId, newLineId, bookId) => {
    let newChapters = []
    let newCards = []
    let newLine = null
    if (!templateChapters) return {newChapters, newCards, cardId, newLine}
    const areAllAuto = templateChapters.every(ch => ch.title == 'auto')
    const allChapters = _.sortBy(templateChapters, 'position').map(ch => { return {...ch, bookId: bookId}})

    if (currentChapters.length >= templateChapters.length) {
      if (areAllAuto) return {newChapters, newCards, cardId, newLine}

      // chapter titles are useful & they don't need to be chapters
      // add them as cards
      newCards = allChapters.map((ch, idx) => {
        return Object.assign({}, card, {
          title: ch.title,
          id: cardId++,
          lineId: newLineId,
          chapterId: currentChapters[idx].id,
        })
      })
      newLine = { id: newLineId, title: templateName, bookId: bookId }
    } else if (currentChapters.length) {
      // some current chapters, but not enough
      if (areAllAuto) {
        // take enough to fill up how many we need
        const chIds = currentChapters.map(ch => ch.id)
        newChapters = allChapters.slice(currentChapters.length).map(ch => {
          // make sure ids don't clash
          let chapter = {...ch, bookId: bookId}
          if (chIds.includes(ch.id)) {
            chapter.id = ch.id + 100 // ought to be a safe number
          }
          return chapter
        })
      } else {
        // add them to the end
        newChapters = allChapters
      }
    } else {
      // no current chapters
      newChapters = allChapters
    }
    return {newChapters, newCards, cardId, newLine}
  }

  createCards = (cards, newChapters, currentChapters, cardId, lineId) => {
    let moreCards = []
    let moreChapters = []
    if (!cards.length) return [moreCards, moreChapters]

    let allChapters = []

    if (newChapters.length >= cards.length) {
      // use newChapters' chapterId
      allChapters = newChapters
    } else {
      // the chapters are 'auto', replace chapterIds
      allChapters = [...currentChapters, ...newChapters]
    }

    if (allChapters.length < cards.length) {
      const chapterId = nextId(allChapters)
      // have to create more chapters
      for (let i = allChapters.length; i < cards.length; i++) {
        moreChapters.push(Object.assign({}, defaultChapter, {id: chapterId + i}))
      }
      allChapters = [...allChapters, ...moreChapters]
    }

    moreCards = cards.map((c, idx) => {
      return Object.assign({}, card, {
        title: c.title,
        description: c.description,
        id: cardId++,
        lineId: lineId,
        chapterId: allChapters[idx].id,
      })
    })
    return [moreCards, moreChapters]
  }

  handleChooseTemplate = (template) => {
    // NOTE: doesn't work for series lines
    const { ui, actions } = this.props
    const templateData = template.templateData
    let newLineId = nextId(this.props.lines)
    let newCardId = nextId(this.props.cards)
    let bookId = ui.currentTimeline
    let cards = []
    let lines = []
    let { newChapters, newCards, cardId, newLine } = this.createChapters(template.name, templateData.chapters, this.props.chapters, newCardId, newLineId, bookId)
    if (newCards.length) cards = cards.concat(newCards)
    if (newLine) lines.push(newLine)
    newCardId = cardId

    if (templateData.lines) {
      const templateLines = _.sortBy(templateData.lines, 'position').map(l => {
        const thisLineId = ++newLineId
        if (templateData.cards) {
          const [templateCards, moarChapters] = this.createCards(_.sortBy(templateData.cards.filter(c => c.lineId == l.id), 'id'), newChapters, this.props.chapters, newCardId, thisLineId)
          cards = cards.concat(templateCards)
          if (moarChapters) newChapters = newChapters.concat(moarChapters)
        }
        return {
          id: thisLineId,
          title: `${template.name} - ${l.title}`,
          bookId: bookId,
        }
      })
      lines = lines.concat(templateLines)
    } else if (templateData.cards) {
      const nextLineId = ++newLineId
      const [cardCards, moreChapters] = this.createCards(_.sortBy(templateData.cards, 'id'), newChapters, this.props.chapters, newCardId, nextLineId)
      cards = cards.concat(cardCards)
      if (moreChapters) newChapters = newChapters.concat(moreChapters)
      lines.push({
        id: nextLineId,
        title: template.name,
        bookId: bookId,
      })
    }
    actions.addLinesFromTemplate(cards, lines, newChapters, bookId)
    this.setState({showTemplatePicker: false})
  }

  renderInsertButton () {
    const { ui, actions } = this.props
    if (this.props.bookId != 'series') {
      return <div className='line-list__append-line'>
        {this.state.hovering ?
          <div className='line-list__append-line__double'>
            <div onClick={() => this.setState({showTemplatePicker: true, hovering: false})} className='template'>{i18n('Use Template')}</div>
            <div onClick={() => actions.addLine(ui.currentTimeline)} className='non-template'><Glyphicon glyph='plus' /></div>
          </div>
        :
          <div className='line-list__append-line-wrapper'>
            <Glyphicon glyph='plus' />
          </div>
        }
      </div>
    } else {
      return <div
        className='line-list__append-line'
        onClick={() => actions.addLine(ui.currentTimeline)}
      >
        <div className='line-list__append-line-wrapper'>
          <Glyphicon glyph='plus' />
        </div>
      </div>
    }
  }

  renderTemplatePicker () {
    if (!this.state.showTemplatePicker) return null

    return <TemplatePicker
      type='plotlines'
      modal={true}
      isOpen={this.state.showTemplatePicker}
      close={() => this.setState({showTemplatePicker: false})}
      onChooseTemplate={this.handleChooseTemplate}
    />
  }

  render () {
    return <Row>
      <Cell onMouseEnter={() => this.setState({hovering: true})} onMouseLeave={() => this.setState({hovering: false})}>
        {this.renderInsertButton()}
        {this.renderTemplatePicker()}
      </Cell>
    </Row>
  }

  shouldComponentUpdate (nextProps, nextState) {
    if (this.state.showTemplatePicker != nextState.showTemplatePicker) return true
    if (this.state.hovering != nextState.hovering) return true
    return false
  }

  static propTypes = {
    ui: PropTypes.object.isRequired,
    bookId: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    chapters: PropTypes.array,
    lines: PropTypes.array,
    cards: PropTypes.array,
  }
}

function mapStateToProps (state) {
  return {
    ui: state.ui,
    chapters: sortedChaptersByBookSelector(state),
    lines: linesByBookSelector(state),
    cards: state.cards,
  }
}

function mapDispatchToProps (dispatch, ownProps) {
  let actions = ownProps.bookId == 'series' ? SeriesLineActions : LineActions
  return {
    actions: bindActionCreators(actions, dispatch),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddLineRow)