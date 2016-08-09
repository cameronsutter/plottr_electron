import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

class AddCard extends Component {

  render () {
    const item = this.props.item
    return (
      <div>
        <span>new card</span>
        <p>Before: </p>
        <p>After: <span className='history-component__item__after'>{item.action.card.title}</span></p>
      </div>
    )
  }
}

AddCard.propTypes = {
  item: PropTypes.object.isRequired
}

function mapStateToProps (state) {
  return {
  }
}

function mapDispatchToProps (dispatch) {
  return {
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddCard)
