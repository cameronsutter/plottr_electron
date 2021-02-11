import React, { PureComponent } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import i18n from 'format-message'
import { Cell } from 'react-sticky-table'
import Card from './Card'
import cx from 'classnames'
import Floater from 'react-floater'
import CardAdd from './CardAdd'
import ErrorBoundary from '../../containers/ErrorBoundary'
import { helpers, actions, selectors } from 'pltr/v2'

const {
  lists: { reorderList, moveToAbove },
} = helpers

class CardCell extends PureComponent {
  moveSceneCardAbove = (id, positionWithinLine) => {
    const { beatId, lineId, cards } = this.props
    let newOrder = []

    const currentIds = cards.map((c) => c.id)
    if (currentIds.includes(id)) {
      const currentPosition = cards.find((c) => c.id == id).positionWithinLine
      newOrder = moveToAbove(currentPosition, positionWithinLine, currentIds)
    } else {
      // dropped in from a different beat
      newOrder = currentIds
      newOrder.splice(positionWithinLine, 0, id)
    }

    this.props.actions.reorderCardsWithinLine(beatId, lineId, newOrder)
  }

  moveSceneCard = (id, positionWithinLine) => {
    const { beatId, lineId, cards } = this.props
    let newOrder = []

    const currentIds = cards.map((c) => c.id)
    if (currentIds.includes(id)) {
      const currentPosition = cards.find((c) => c.id == id).positionWithinLine
      newOrder = reorderList(positionWithinLine, currentPosition, currentIds)
    } else {
      // dropped in from a different beat
      newOrder = currentIds
      newOrder.splice(positionWithinLine, 0, id)
    }

    this.props.actions.reorderCardsWithinLine(beatId, lineId, newOrder)
  }

  addSceneCard = (newCardData) => {
    // add a new one
    // and reorder current cards
    const newCard = this.buildCard(newCardData)
    const reorderIds = this.props.cards.map((c) => c.id)
    reorderIds.splice(newCardData.positionWithinLine, 0, null)

    this.props.actions.addNewCardInBeat(newCard, reorderIds)
  }

  buildCard(data) {
    const { beatId, lineId } = this.props
    return Object.assign({}, { beatId, lineId }, data)
  }

  renderCards(arentHidden) {
    const { beatId, lineId, beatPosition, linePosition, color, cards, isSmall } = this.props
    const numOfCards = cards.length
    const idxOfCards = numOfCards - 1
    return cards.map((card, idx) => {
      const isLastOne = idx == cards.length - 1
      return (
        <div key={card.id}>
          <ErrorBoundary>
            <Card
              card={card}
              beatId={beatId}
              lineId={lineId}
              idx={idx}
              beatPosition={beatPosition}
              linePosition={linePosition}
              color={color}
              last={idxOfCards == idx}
              moveCard={this.moveSceneCardAbove}
              allowDrop={arentHidden || isSmall}
            />
          </ErrorBoundary>
          {arentHidden ? (
            <CardAdd
              color={color}
              positionWithinLine={idx}
              moveCard={this.moveSceneCard}
              addCard={this.addSceneCard}
              allowDrop={isLastOne}
              dropPosition={cards.length}
              beatId={beatId}
              lineId={lineId}
            />
          ) : null}
        </div>
      )
    })
  }

  renderHiddenCards = () => {
    return <div className="card__hidden-cards">{this.renderCards(false)}</div>
  }

  renderBody() {
    const { cards, ui, isVisible, color, lineIsExpanded, isMedium } = this.props
    const numOfCards = cards.length
    const vertical = ui.orientation == 'vertical'
    if (lineIsExpanded || numOfCards == 1) {
      return (
        <div className={cx('card__cell', { multiple: numOfCards > 1, vertical: vertical })}>
          {this.renderCards(true)}
        </div>
      )
    } else {
      let cardStyle = { borderColor: color }
      if (!isVisible) {
        cardStyle.opacity = '0.1'
      }
      const bodyKlass = cx('card__body', { 'medium-timeline': isMedium })
      return (
        <div className={cx('card__cell__overview-cell', { vertical: vertical })}>
          <Floater
            component={this.renderHiddenCards}
            placement="right"
            offset={0}
            disableAnimation={true}
          >
            <div className={bodyKlass} style={cardStyle}>
              <div className="card__title">{i18n('{num} Scenes', { num: numOfCards })}</div>
            </div>
          </Floater>
          <CardAdd
            color={this.props.color}
            positionWithinLine={numOfCards}
            moveCard={this.moveSceneCard}
            addCard={this.addSceneCard}
            beatId={this.props.beatId}
            lineId={this.props.lineId}
            allowDrop
          />
        </div>
      )
    }
  }

  render() {
    const { cards, isSmall } = this.props

    if (!cards.length) {
      if (isSmall) return <td></td>
      return <Cell></Cell>
    }

    if (isSmall) {
      return <td>{this.renderCards(false)}</td>
    } else {
      return <Cell>{this.renderBody()}</Cell>
    }
  }
}

CardCell.propTypes = {
  cards: PropTypes.array,
  beatId: PropTypes.number.isRequired,
  lineId: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
  linePosition: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  beatPosition: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  ui: PropTypes.object.isRequired,
  lineIsExpanded: PropTypes.bool.isRequired,
  isVisible: PropTypes.bool.isRequired,
  isSmall: PropTypes.bool.isRequired,
  isMedium: PropTypes.bool.isRequired,
  actions: PropTypes.object.isRequired,
}

function mapStateToProps(state, ownProps) {
  const visibleCards = selectors.visibleCardsSelector(state.present)
  const visible = ownProps.cards.some((c) => visibleCards[c.id])
  return {
    ui: state.present.ui,
    lineIsExpanded: selectors.lineIsExpandedSelector(state.present)[ownProps.lineId],
    isVisible: visible,
    isSmall: selectors.isSmallSelector(state.present),
    isMedium: selectors.isMediumSelector(state.present),
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(actions.card, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CardCell)
