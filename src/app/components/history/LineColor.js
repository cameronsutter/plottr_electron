import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import _ from 'lodash'
import i18n from 'format-message'

class EditScene extends Component {
  render() {
    const item = this.props.item
    const diff = item.diff[0]
    const line = _.find(this.props.lines, { id: item.action.id }) || { title: '' }
    return (
      <div>
        <span>
          {i18n('story line')}: "{line.title}"
        </span>
        <p>
          {i18n('Before')}:{' '}
          <span className="history-component__item__before" style={{ color: diff.lhs }}>
            {diff.lhs}{' '}
          </span>
          <span
            className="history-component__item__color"
            style={{ backgroundColor: diff.lhs }}
          ></span>
        </p>
        <p>
          {i18n('After')}: <span style={{ color: diff.rhs }}>{diff.rhs} </span>
          <span
            className="history-component__item__color"
            style={{ backgroundColor: diff.rhs }}
          ></span>
        </p>
      </div>
    )
  }
}

EditScene.propTypes = {
  item: PropTypes.object.isRequired,
  lines: PropTypes.array.isRequired,
}

function mapStateToProps(state) {
  return {
    lines: state.lines,
  }
}

function mapDispatchToProps(dispatch) {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(EditScene)
