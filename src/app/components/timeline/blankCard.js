import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Cell } from 'react-sticky-table'
import * as CardActions from 'actions/cards'

class BlankCard extends Component {
  render () {
    return <Cell><div>blank</div></Cell>
  }
}

BlankCard.propTypes = {
  sceneId: PropTypes.number.isRequired,
  lineId: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
  isZoomed: PropTypes.bool.isRequired,
  ui: PropTypes.object.isRequired,
  linePosition: PropTypes.number.isRequired,
  scenePosition: PropTypes.number.isRequired
}

function mapStateToProps (state, passedProps) {
  let line = state.lines.find(l => l.id === passedProps.lineId)
  let scene = state.scenes.find(s => s.id === passedProps.sceneId)
  return {
    ui: state.ui,
    linePosition: line.position,
    scenePosition: scene.position,
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(CardActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BlankCard)
