import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import Waypoint from 'react-waypoint'
import CardView from 'components/outline/cardView'

class SceneView extends Component {
  renderCards () {
    return this.props.cards.map(c =>
      <CardView key={c.id} card={c} />
    )
  }

  render () {
    return (
      <div id={this.props.scene.title}>
        <Waypoint onEnter={() => this.props.waypoint(this.props.scene.title)} threshold={-0.75} />
        <h3>{this.props.scene.title}</h3>
        {this.renderCards()}
      </div>
    )
  }
}

SceneView.propTypes = {
  scene: PropTypes.object.isRequired,
  cards: PropTypes.array.isRequired,
  waypoint: PropTypes.func.isRequired
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
)(SceneView)
