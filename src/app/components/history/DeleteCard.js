import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash'

class DeleteCard extends Component {

  render () {
    const item = this.props.item
    var card = _.find(item.before.cards, {id: item.action.id}) || {title: ''}
    return (
      <div>
        <span>card: "{card.title}"</span>
        <p>Before: <span className='history-component__item__before'>{card.title}</span></p>
        <p>After: </p>
      </div>
    )
  }
}

DeleteCard.propTypes = {
  item: PropTypes.object.isRequired,
  cards: PropTypes.array.isRequired
}

function mapStateToProps (state) {
  return {
    cards: state.cards
  }
}

function mapDispatchToProps (dispatch) {
  return {
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DeleteCard)
