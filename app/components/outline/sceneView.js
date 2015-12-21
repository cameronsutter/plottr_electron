import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import CardView from 'components/outline/cardView'

class SceneView extends Component {
  renderCards () {
    return this.props.cards.map(c =>
      <CardView key={c.id} card={c} />
    )
  }

  render () {
    return (
      <div>
        <h3>{this.props.scene.title}</h3>
        {this.renderCards()}
      </div>
    )
  }
}

SceneView.propTypes = {
  scene: PropTypes.object.isRequired,
  cards: PropTypes.array.isRequired
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
