import React, { Component, PropTypes } from 'react'
// import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

class StoryName extends Component {

  render () {
    const item = this.props.item
    return (
      <div>
        <span>story name</span>
        <p>Before: <span className='history-component__item__before'>{item.diff[0].lhs}</span></p>
        <p>After: <span className='history-component__item__after'>{item.diff[0].rhs}</span></p>
      </div>
    )
  }
}

StoryName.propTypes = {
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
)(StoryName)
