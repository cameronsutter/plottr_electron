import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash'

class DeleteTag extends Component {

  render () {
    const item = this.props.item
    var tag = _.find(item.before.tags, {id: item.action.id}) || {title: ''}
    return (
      <div>
        <span>tag: "{tag.title}"</span>
        <p>Before: <span className='history-component__item__before'>{tag.title}</span></p>
        <p>After: </p>
      </div>
    )
  }
}

DeleteTag.propTypes = {
  item: PropTypes.object.isRequired,
  tags: PropTypes.array.isRequired
}

function mapStateToProps (state) {
  return {
    tags: state.tags
  }
}

function mapDispatchToProps (dispatch) {
  return {
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DeleteTag)
