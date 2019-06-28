import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { Waypoint } from 'react-waypoint'
import CardView from 'components/outline/cardView'

class SceneView extends Component {
  renderCards () {
    return this.props.cards.map(c =>
      <CardView key={c.id} card={c} labelMap={this.props.labelMap} />
    )
  }

  render () {
    let klasses = 'outline__scene_title'
    if (this.props.ui.darkMode) klasses += ' darkmode'
    return (
      <div id={this.props.scene.title}>
        <Waypoint onEnter={() => this.props.waypoint(this.props.scene.title)} threshold={-0.75} />
        <h3 className={klasses}>{this.props.scene.title}</h3>
        {this.renderCards()}
      </div>
    )
  }
}

SceneView.propTypes = {
  scene: PropTypes.object.isRequired,
  cards: PropTypes.array.isRequired,
  waypoint: PropTypes.func.isRequired,
  labelMap: PropTypes.object.isRequired,
  ui: PropTypes.object.isRequired,
}

function mapStateToProps (state) {
  return {
    ui: state.ui,
  }
}

function mapDispatchToProps (dispatch) {
  return {}
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SceneView)
