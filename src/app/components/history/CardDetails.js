import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import _ from 'lodash'
import { connect } from 'react-redux'
import i18n from 'format-message'

class CardDetails extends Component {
  renderLabels(path, beforeOrAfter) {
    var ids = path.reduce((o, i) => o[i], this.props.item[beforeOrAfter])
    var titles = ids.map((id) => {
      var item = _.find(this.props[path[2]], { id: id })
      var title = item['title'] || item['name']
      return title
    })
    return <span>{titles.join(', ')}</span>
  }

  renderDiff(diff, index) {
    if (diff.kind === 'E') {
      if (diff.path.length < 4) {
        // if greater it means a tag/character/place has changed position. Don't show that
        return (
          <div key={`diff-${index}-${diff.path[1]}`}>
            <span>
              {i18n('Edit')} {diff.path[2]}
            </span>
            <p>
              {i18n('Before')}: <span className="history-component__item__before">{diff.lhs}</span>
            </p>
            <p>
              {i18n('After')}: <span className="history-component__item__after">{diff.rhs}</span>
            </p>
          </div>
        )
      }
    } else if (diff.kind === 'A') {
      if (diff.item.kind === 'D') {
        var label = _.find(this.props[diff.path[2]], { id: diff.item.lhs })
        var title = label['title'] || label['name']
        return (
          <div key={`diff-${index}-${diff.path[1]}`}>
            <span>
              {i18n('Delete')} {diff.path[2]}: {title}
            </span>
            <p>
              {i18n('Before')}:{' '}
              <span className="history-component__item__before">
                {this.renderLabels(diff.path, 'before')}
              </span>
            </p>
            <p>
              {i18n('After')}:{' '}
              <span className="history-component__item__after">
                {this.renderLabels(diff.path, 'after')}
              </span>
            </p>
          </div>
        )
      } else if (diff.item.kind === 'N') {
        label = _.find(this.props[diff.path[2]], { id: diff.item.rhs })
        title = label['title'] || label['name']
        return (
          <div key={`diff-${index}-${diff.path[1]}`}>
            <span>
              {i18n('New')} {diff.path[2]}: {title}
            </span>
            <p>
              {i18n('Before')}:{' '}
              <span className="history-component__item__before">
                {this.renderLabels(diff.path, 'before')}
              </span>
            </p>
            <p>
              {i18n('After')}:{' '}
              <span className="history-component__item__after">
                {this.renderLabels(diff.path, 'after')}
              </span>
            </p>
          </div>
        )
      }
    }
  }

  render() {
    const item = this.props.item
    var diffs = item.diff.map(this.renderDiff, this)
    var card = this.props.cards[item.diff[0].path[1]] || { title: '' }
    return (
      <div>
        <div className="history-component__item-identifier">
          {i18n('Card')}: &quot;{card.title}&quot;
        </div>
        {diffs}
      </div>
    )
  }
}

CardDetails.propTypes = {
  item: PropTypes.object.isRequired,
  tags: PropTypes.array.isRequired,
  places: PropTypes.array.isRequired,
  characters: PropTypes.array.isRequired,
  cards: PropTypes.array.isRequired,
}

function mapStateToProps(state) {
  return {
    tags: state.tags,
    places: state.places,
    characters: state.characters,
    cards: state.cards,
  }
}

function mapDispatchToProps(dispatch) {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(CardDetails)
