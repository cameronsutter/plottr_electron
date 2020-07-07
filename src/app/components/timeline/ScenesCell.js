import React, { PureComponent } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Cell } from 'react-sticky-table'
import { Glyphicon } from 'react-bootstrap'
import * as CardActions from 'actions/cards'
import Card from './Card'
import cx from 'classnames'

class ScenesCell extends PureComponent {

  renderAddButton () {
    return <div className='card__add-card'>
      <Glyphicon glyph='plus' />
    </div>
  }

  renderCards () {
    const { chapterId, lineId, chapterPosition, linePosition, color, filtered } = this.props
    const numOfCards = this.props.cards.length - 1
    return this.props.cards.map((card, idx) => {
      return <Card key={card.id} card={card} chapterId={chapterId} lineId={lineId}
        chapterPosition={chapterPosition} linePosition={linePosition}
        color={color} filtered={filtered} last={numOfCards == idx}
      />
    })
  }

  render () {
    if (!this.props.cards.length) return <Cell></Cell>

    return <Cell>
      <div className={cx('card__cell', {multiple: this.props.cards.length > 1})}>
        { this.renderCards() }
        { this.renderAddButton() }
      </div>
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
  chapterPosition: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
}

function mapStateToProps (state, ownProps) {
  return {
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
