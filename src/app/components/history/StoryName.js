import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import i18n from 'format-message'

class StoryName extends Component {
  render() {
    const item = this.props.item
    return (
      <div>
        <span>{i18n('Story name')}</span>
        <p>
          {i18n('Before')}:{' '}
          <span className="history-component__item__before">{item.diff[0].lhs}</span>
        </p>
        <p>
          {i18n('After')}:{' '}
          <span className="history-component__item__after">{item.diff[0].rhs}</span>
        </p>
      </div>
    )
  }
}

StoryName.propTypes = {
  item: PropTypes.object.isRequired,
}

function mapStateToProps(state) {
  return {}
}

function mapDispatchToProps(dispatch) {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(StoryName)
