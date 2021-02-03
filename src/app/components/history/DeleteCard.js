import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import _ from 'lodash'
import i18n from 'format-message'

class DeleteCard extends Component {
  render() {
    const item = this.props.item
    var card = _.find(item.before.cards, { id: item.action.id }) || { title: '' }
    return (
      <div>
        <span>
          {i18n('Card')}: &quot;{card.title}&quot;
        </span>
        <p>
          {i18n('Before')}: <span className="history-component__item__before">{card.title}</span>
        </p>
        <p>{i18n('After')}: </p>
      </div>
    )
  }
}

DeleteCard.propTypes = {
  item: PropTypes.object.isRequired,
  cards: PropTypes.array.isRequired,
}

function mapStateToProps(state) {
  return {
    cards: state.cards,
  }
}

function mapDispatchToProps(dispatch) {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(DeleteCard)
