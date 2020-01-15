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
      <Waypoint onEnter={() => this.props.waypoint(this.props.scene.id)} scrollableAncestor={window} topOffset={"60%"} bottomOffset={"60%"}>
        <div>
          <h3 id={`scene-${this.props.scene.id}`} className={klasses}>{this.props.scene.title}</h3>
          {this.renderCards()}
        </div>
      </Waypoint>
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
