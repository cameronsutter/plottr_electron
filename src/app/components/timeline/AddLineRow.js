import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Row, Cell } from 'react-sticky-table'
import { Glyphicon } from 'react-bootstrap'
import i18n from 'format-message'
import _ from 'lodash'
import * as LineActions from 'actions/lines'
import SETTINGS from '../../../common/utils/settings'
import TemplatePicker from '../../../common/components/templates/TemplatePicker'
import { nextId } from '../../store/newIds'
import { card } from '../../../../shared/initialState'

class AddLineRow extends Component {
  state = {
    hovering: false,
    showTemplatePicker: false,
  }

  handleChooseTemplate = (template) => {
    const { ui, actions } = this.props
    const templateData = template.templateData
    const newLineId = nextId(this.props.lines)
    let newCardId = nextId(this.props.cards)
    const chapters = _.sortBy(this.props.chapters, 'position')
    let cards = []
    let lines = []
    if (templateData.chapters) {
      const chapterCards = _.sortBy(templateData.chapters, 'position').map((sc, idx) => {
        return Object.assign({}, card, {
          title: sc.title,
          id: newCardId++,
          lineId: newLineId,
          chapterId: chapters[idx].id,
        })
      })
      cards = cards.concat(chapterCards)
      lines.push({
        id: newLineId,
        title: template.name,
      })
    }
    if (templateData.lines) {
      const templateLines = _.sortBy(templateData.lines, 'position').map((l, idx) => {
        const thisLineId = newLineId++
        if (templateData.cards) {
          const templateCards = templateData.cards.filter(c => c.lineId == l.id).map((c, idx) => {
            return Object.assign({}, card, {
              title: c.title,
              description: c.description,
              id: newCardId++,
              lineId: thisLineId,
              chapterId: chapters[idx].id,
            })
          })
          cards = cards.concat(templateCards)
        }
        return {
          id: thisLineId,
          title: `${template.name} - ${l.title}`,
        }
      })
      lines = lines.concat(templateLines)
    } else if (templateData.cards) {
      const cardCards = _.sortBy(templateData.cards, 'id').map((c, idx) => {
        return Object.assign({}, card, {
          title: c.title,
          description: c.description,
          id: newCardId++,
          lineId: newLineId + 1,
          chapterId: chapters[idx].id,
        })
      })
      cards = cards.concat(cardCards)
      lines.push({
        id: newLineId + 1,
        title: template.name,
      })
    }
    actions.addLinesFromTemplate(cards, lines, ui.currentTimeline)
    this.setState({showTemplatePicker: false})
  }

  renderInsertButton () {
    const { ui, actions } = this.props
    if (SETTINGS.get('premiumFeatures') && this.props.bookId != 'series') {
      return <div className='line-list__append-line'>
        {this.state.hovering ?
          <div className='line-list__append-line__double'>
            <div onClick={() => actions.addLine(ui.currentTimeline)} className='non-template'><Glyphicon glyph='plus' /></div>
            <div onClick={() => this.setState({showTemplatePicker: true, hovering: false})} className='template'>{i18n('Use Template')}</div>
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

  static propTypes = {
    ui: PropTypes.object.isRequired,
    bookId: PropTypes.number,
  }
}

function mapStateToProps (state) {
  return {
    ui: state.ui,
    chapters: state.chapters,
    lines: state.lines,
    cards: state.cards,
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(LineActions, dispatch),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddLineRow)