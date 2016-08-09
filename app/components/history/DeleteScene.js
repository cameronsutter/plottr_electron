import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash'

class DeleteScene extends Component {

  render () {
    const item = this.props.item
    var scene = _.find(item.before.scenes, {id: item.action.id}) || {title: ''}
    return (
      <div>
        <span>scene: "{scene.title}"</span>
        <p>Before: <span className='history-component__item__before'>{scene.title}</span></p>
        <p>After: </p>
      </div>
    )
  }
}

DeleteScene.propTypes = {
  item: PropTypes.object.isRequired,
  scenes: PropTypes.array.isRequired
}

function mapStateToProps (state) {
  return {
    scenes: state.scenes
  }
}

function mapDispatchToProps (dispatch) {
  return {
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DeleteScene)
