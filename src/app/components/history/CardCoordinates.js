import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash'
import i18n from 'format-message'

class CardCoordinates extends Component {

  renderDiff (diff, index) {
    var collection = this.props.scenes
    if (diff.path[2] === 'lineId') {
      collection = this.props.lines
    }
    var lhs = _.find(collection, {id: diff.lhs}) || {title: ''}
    var rhs = _.find(collection, {id: diff.rhs}) || {title: ''}
    return (
      <div key={`diff-${index}-${diff.path[1]}`}>
        <span>{diff.path[2].replace('Id', '').replace('line', i18n('story line'))}</span>
        <p>Before: <span className='history-component__item__before'>{lhs.title}</span></p>
        <p>After: <span className='history-component__item__after'>{rhs.title}</span></p>
      </div>
    )
  }

  render () {
    const item = this.props.item
    var diffs = item.diff.map(this.renderDiff, this)
    var card = this.props.cards[item.diff[0].path[1]] || {title: ''}
    return (
      <div>
        <div className='history-component__item-identifier'>{i18n('Card')}: "{card.title}"</div>
        {diffs}
      </div>
    )
  }
}

CardCoordinates.propTypes = {
  item: PropTypes.object.isRequired,
  scenes: PropTypes.array.isRequired,
  lines: PropTypes.array.isRequired,
  cards: PropTypes.array.isRequired
}

function mapStateToProps (state) {
  return {
    scenes: state.scenes,
    lines: state.lines,
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
)(CardCoordinates)
