import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

class TagView extends Component {

  render () {
    return (
      <div className='tag'>
        <h4>{this.props.tag.title}</h4>
      </div>
    )
  }
}

TagView.propTypes = {
  tag: PropTypes.object.isRequired
}

function mapStateToProps (state) {
  return {}
}

function mapDispatchToProps (dispatch) {
  return {}
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TagView)
