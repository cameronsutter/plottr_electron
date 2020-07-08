import React, { PureComponent } from 'react'
import PropTypes from 'react-proptypes'
import { findDOMNode } from 'react-dom'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import i18n from 'format-message'
import { Cell } from 'react-sticky-table'
import { Glyphicon, FormGroup, FormControl, ControlLabel } from 'react-bootstrap'
import * as CardActions from 'actions/cards'
import Card from './Card'
import cx from 'classnames'
import { isSeriesSelector } from '../../selectors/ui'
import { lineIsExpandedSelector } from '../../selectors/lines'
import Floater from 'react-floater'

class ScenesCell extends PureComponent {
  state = {creating: false}

  saveCreate = () => {
    const newCard = this.buildCard(findDOMNode(this.refs.titleInput).value)
    this.props.actions.addCard(newCard)
    this.setState({creating: false})
  }

  handleFinishCreate = (event) => {
    if (event.which === 13) { //enter
      this.saveCreate()
    }
  }

  buildCard (title) {
    const { chapterId, lineId, cards } = this.props
    if (this.props.isSeries) {
      return { title, beatId: chapterId, seriesLineId: lineId, position: cards.length }
    } else {
      return { title, chapterId, lineId, position: cards.length }
    }
  }

  handleCancelCreate = (event) => {
    if (event.which === 27) { //esc
      this.setState({creating: false})
    }
  }

  handleBlur = () => {
    var newTitle = findDOMNode(this.refs.titleInput).value
    if (newTitle == '') {
      this.setState({creating: false})
      return false
    } else {
      this.saveCreate()
      this.setState({creating: false})
    }
  }

  startCreating = () => {
    this.setState({creating: true})
  }

  addSceneCard = () => {
    const { chapterId, lineId, cards } = this.props
    this.props.actions.addCard({chapterId, lineId, position: cards.length})
    this.setState({creating: false})
  }

  renderAddButton () {
    if (this.state.creating) {
      var cardStyle = {
        borderColor: this.props.color
      }
      return <div className='card__body' style={cardStyle}>
        <FormGroup>
          <ControlLabel>{i18n('Scene Title')}</ControlLabel>
          <FormControl
            type='text'
            autoFocus
            ref='titleInput'
            bsSize='small'
            onBlur={this.handleBlur}
            onKeyDown={this.handleCancelCreate}
            onKeyPress={this.handleFinishCreate} />
        </FormGroup>
      </div>
    } else {
      return <div className='card__add-card' onClick={this.startCreating}>
        <Glyphicon glyph='plus' />
      </div>
    }
  }

  renderCards () {
    const { chapterId, lineId, chapterPosition, linePosition, color, filtered } = this.props
    const idxOfCards = this.props.cards.length - 1
    return this.props.cards.map((card, idx) => {
      return <Card key={card.id} card={card} chapterId={chapterId} lineId={lineId}
        chapterPosition={chapterPosition} linePosition={linePosition}
        color={color} filtered={filtered} last={idxOfCards == idx}
      />
    })
  }

  renderHiddenCards = () => {
    return <div className='card__hidden-cards'>
      { this.renderCards() }
    </div>
  }

  renderBody () {
    const numOfCards = this.props.cards.length
    if (this.props.lineIsExpanded || numOfCards == 1) {
      return <div className={cx('card__cell', {multiple: numOfCards > 1})}>
        { this.renderCards() }
        { this.renderAddButton() }
      </div>
    } else {
      var cardStyle = {
        borderColor: this.props.color
      }
      return <div className='card__cell__overview-cell'>
        <Floater component={this.renderHiddenCards} placement='right' offset={0} disableAnimation={true}>
          <div className='card__body' style={cardStyle}>
            <div className='card__title'>{i18n('{num} Scenes', {num: numOfCards})}</div>
          </div>
        </Floater>
        { this.renderAddButton() }
      </div>
    }
  }

  render () {
    if (!this.props.cards.length) return <Cell></Cell>

    return <Cell>
      { this.renderBody() }
    </Cell>
  }
}

ScenesCell.propTypes = {
  cards: PropTypes.array,
  chapterId: PropTypes.number.isRequired,
  lineId: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
  filtered: PropTypes.bool,
  linePosition: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  chapterPosition: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  isSeries: PropTypes.bool.isRequired,
  lineIsExpanded: PropTypes.bool.isRequired,
  actions: PropTypes.object.isRequired,
}

function mapStateToProps (state, ownProps) {
  return {
    isSeries: isSeriesSelector(state.present),
    lineIsExpanded: lineIsExpandedSelector(state.present)[ownProps.lineId],
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(CardActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ScenesCell)
