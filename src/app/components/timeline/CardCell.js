import React, { PureComponent } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { t as i18n } from 'plottr_locales'
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
      if (card.color === null) {
        card.color = 'null'
      }
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
    const { cards, ui, isVisible, color, lineIsExpanded, beatIsExpanded, isMedium } = this.props
    const numOfCards = cards.length
    const vertical = ui.orientation == 'vertical'
    console.log(lineIsExpanded,'beatIsExpanded')
    if (beatIsExpanded && (lineIsExpanded || numOfCards == 1)) {
      // console.log('here')
      const cellKlass = cx('card__cell', {
        multiple: numOfCards > 1,
        vertical: vertical,
        'medium-timeline': isMedium,
      })
      return <div className={cellKlass}>{this.renderCards(true)}</div>
    } else {
      // console.log('there')
      let cardStyle = { borderColor: color }
      if (!isVisible) {
        cardStyle.opacity = '0.1'
      }
      const bodyKlass = cx('card__body shadow', { 'medium-timeline': isMedium })
      const overviewKlass = cx('card__cell__overview-cell', {
        vertical: vertical,
        'medium-timeline': isMedium,
      })
      return (
        <div className={overviewKlass}>
          <div>
            <Floater
              component={this.renderHiddenCards}
              placement="right"
              offset={0}
              disableAnimation={true}
              styles={{ wrapper: { cursor: 'pointer' } }}
            >
              <>
                <div className={bodyKlass} style={cardStyle}>
                  <div className="card__title">{cards[0].title}</div>
                </div>
                <div className="card__behind" style={cardStyle}></div>
              </>
            </Floater>
          </div>
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
  beatIsExpanded: PropTypes.bool,
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
