import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import _ from 'lodash'
import i18n from 'format-message'

class DeleteLine extends Component {

  render () {
    const item = this.props.item
    var line = _.find(item.before.lines, {id: item.action.id}) || {title: ''}
    return (
      <div>
        <span>{i18n('Story line')}: "{line.title}"</span>
        <p>{i18n('Before')}: <span className='history-component__item__before'>{line.title}</span></p>
        <p>{i18n('After')}: </p>
      </div>
    )
  }
}

DeleteLine.propTypes = {
  item: PropTypes.object.isRequired,
  lines: PropTypes.array.isRequired
}

function mapStateToProps (state) {
  return {
    lines: state.lines
  }
}

function mapDispatchToProps (dispatch) {
  return {
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DeleteLine)
