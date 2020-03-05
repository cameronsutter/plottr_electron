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
import { lineId, cardId } from '../../store/newIds'
import { card } from '../../store/initialState'

class AddLineRow extends Component {
  state = {
    hovering: false,
    showTemplatePicker: false,
  }

  handleChooseTemplate = (template) => {
    const templateData = template.templateData
    const newLineId = lineId(this.props.lines)
    let lineIds = []
    let newCardId = cardId(this.props.cards)
    const scenes = _.sortBy(this.props.scenes, 'position')
    let cards = []
    if (templateData.scenes) {
      const sceneCards = _.sortBy(templateData.scenes, 'position').map((sc, idx) => {
        return Object.assign({}, card, {
          title: sc.title,
          id: newCardId++,
          lineId: newLineId,
          sceneId: scenes[idx].id,
        })
      })
      cards = cards.concat(sceneCards)
      lineIds.push(newLineId)
    }
    if (templateData.cards) {
      const cardCards = _.sortBy(templateData.cards, 'id').map((c, idx) => {
        return Object.assign({}, card, {
          title: c.title,
          description: c.description,
          id: newCardId++,
          lineId: newLineId + 1,
          sceneId: scenes[idx].id,
        })
      })
      cards = cards.concat(cardCards)
      lineIds.push(newLineId + 1)
    }
    this.props.actions.addLinesFromTemplate(cards, lineIds, template.name)
    this.setState({showTemplatePicker: false})
  }

  renderInsertButton () {
    if (SETTINGS.get('premiumFeatures')) {
      return <div className='line-list__append-line'>
        {this.state.hovering ?
          <div className='line-list__append-line__double'>
            <div onClick={this.props.actions.addLine} className='non-template'><Glyphicon glyph='plus' /></div>
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
        onClick={this.props.actions.addLine}
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
  }
}

function mapStateToProps (state) {
  return {
    ui: state.ui,
    scenes: state.scenes,
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