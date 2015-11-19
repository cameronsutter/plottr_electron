import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import 'style!css!sass!../css/scene_list_block.css.scss'

class SceneView extends Component {
  render () {
    return (<li className='scene-list__item'>
      {this.props.scene.title}
    </li>)
  }
}

SceneView.propTypes = {
  scene: PropTypes.object.isRequired
}

function mapStateToProps (state) {
  return {
    scenes: state.scenes
  }
}

function mapDispatchToProps (dispatch) {
  return {}
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SceneView)
