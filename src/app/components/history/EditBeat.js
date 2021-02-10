import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import i18n from 'format-message'

class EditBeat extends Component {
  render() {
    const item = this.props.item
    const diff = item.diff[0]
    return (
      <div>
        <span>
          {i18n('Beat')}: &quot;{item.action.title}&quot;
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
}

EditBeat.propTypes = {
  item: PropTypes.object.isRequired,
}

function mapStateToProps(state) {
  return {}
}

function mapDispatchToProps(dispatch) {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(EditBeat)
