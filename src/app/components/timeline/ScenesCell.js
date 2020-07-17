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
import SceneCardAdd from './SceneCardAdd'
import { reorderList } from '../../helpers/lists'
import ErrorBoundary from '../../containers/ErrorBoundary'
import { visibleCardsSelector } from '../../selectors/cards'

class ScenesCell extends PureComponent {

  moveSceneCard = (id, positionWithinLine) => {
    const { chapterId, lineId, isSeries, cards } = this.props
    let newOrder = []

    const currentIds = cards.map(c => c.id)
    if (currentIds.includes(id)) {
      const currentPosition = cards.find(c => c.id == id).positionWithinLine
      newOrder = reorderList(positionWithinLine, currentPosition, currentIds)
    } else {
      // dropped in from a different chapter
      newOrder = currentIds
      newOrder.splice(positionWithinLine, 0, id)
    }

    this.props.actions.reorderCardsWithinLine(chapterId, lineId, isSeries, newOrder)
  }

  addSceneCard = (newCardData) => {
    // add a new one
    // and reorder current cards
    const newCard = this.buildCard(newCardData)
    const reorderIds = this.props.cards.map(c => c.id)
    reorderIds.splice(newCardData.positionWithinLine, 0, null)

    this.props.actions.addNewCardInChapter(newCard, reorderIds)
  }

  buildCard (data) {
    const { chapterId, lineId, isSeries } = this.props
    if (isSeries) {
      return Object.assign({}, { beatId: chapterId, seriesLineId: lineId }, data)
    } else {
      return Object.assign({}, { chapterId, lineId }, data)
    }
  }

  renderCards (renderAddButtons) {
    const { chapterId, lineId, chapterPosition, linePosition, color, cards } = this.props
    const numOfCards = cards.length
    const idxOfCards = numOfCards - 1
    return cards.map((card, idx) => {
      return <div key={card.id}>
        <ErrorBoundary>
          <Card card={card} chapterId={chapterId} lineId={lineId}
            chapterPosition={chapterPosition} linePosition={linePosition}
            color={color} last={idxOfCards == idx}
          />
        </ErrorBoundary>
        {renderAddButtons ?
          <SceneCardAdd
            color={color}
            positionWithinLine={idx}
            moveCard={this.moveSceneCard}
            addCard={this.addSceneCard}
          />
        : null}
      </div>
    })
  }

  renderHiddenCards = () => {
    return <div className='card__hidden-cards'>
      { this.renderCards(false) }
    </div>
  }

  renderBody () {
    const numOfCards = this.props.cards.length
    const vertical = this.props.ui.orientation == 'vertical'
    if (this.props.lineIsExpanded || numOfCards == 1) {
      return <div className={cx('card__cell', {multiple: numOfCards > 1, vertical: vertical})}>
        { this.renderCards(true) }
      </div>
    } else {
      let cardStyle = { borderColor: this.props.color }
      if (!this.props.isVisible) {
        cardStyle.opacity = '0.1'
      }
      return <div className={cx('card__cell__overview-cell', {vertical: vertical})}>
        <Floater component={this.renderHiddenCards} placement='right' offset={0} disableAnimation={true}>
          <div className='card__body' style={cardStyle}>
            <div className='card__title'>{i18n('{num} Scenes', {num: numOfCards})}</div>
          </div>
        </Floater>
        <SceneCardAdd
          color={this.props.color}
          positionWithinLine={numOfCards}
          moveCard={this.moveSceneCard}
          addCard={this.addSceneCard}
        />
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
  linePosition: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  chapterPosition: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  ui: PropTypes.object.isRequired,
  isSeries: PropTypes.bool.isRequired,
  lineIsExpanded: PropTypes.bool.isRequired,
  isVisible: PropTypes.bool.isRequired,
  actions: PropTypes.object.isRequired,
}

function mapStateToProps (state, ownProps) {
  const visibleCards = visibleCardsSelector(state.present)
  const visible = ownProps.cards.some(c => visibleCards[c.id])
  return {
    ui: state.present.ui,
    isSeries: isSeriesSelector(state.present),
    lineIsExpanded: lineIsExpandedSelector(state.present)[ownProps.lineId],
    isVisible: visible,
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
