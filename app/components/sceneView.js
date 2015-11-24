import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Glyphicon, Button, ButtonGroup } from 'react-bootstrap'
import 'style!css!sass!../css/scene_list_block.css.scss'

class SceneView extends Component {
  constructor (props) {
    super(props)
    this.state = {hovering: false}
  }

  toggleHoverOptions () {
    var hovering = !this.state.hovering === true
    this.setState({hovering: hovering})
  }

  renderHoverOptions () {
    if (!this.state.hovering) return
    return (<div className='scene-list__item__hover-options'>
      <ButtonGroup>
        <Button><Glyphicon glyph='edit' /></Button>
        <Button bsStyle='danger'><Glyphicon glyph='trash' /></Button>
      </ButtonGroup>
    </div>)
  }

  render () {
    return (<li className='scene-list__item'
      onMouseEnter={() => this.setState({hovering: true})}
      onMouseLeave={() => this.setState({hovering: false})} >
      {this.renderHoverOptions()}
      <div className='scene-list__item__title'>
        <span>{this.props.scene.title}</span>
      </div>
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
