import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash'
import SceneView from 'components/outline/sceneView'

class OutlineView extends Component {

  cardMapping () {
    var mapping = {}
    this.props.scenes.forEach(s =>
      mapping[s.id] = this.sortedSceneCards(s.id)
    )
    return mapping
  }

  sortedSceneCards (sceneId) {
    var cards = this.findSceneCards(sceneId)
    const lines = _.sortBy(this.props.lines, 'position')
    var sorted = []
    lines.forEach((l) => {
      var card = _.find(cards, {lineId: l.id})
      if (card) {
        sorted.push(card)
      }
    })
    return sorted
  }

  findSceneCards (sceneId) {
    return this.props.cards.filter(c =>
      c.sceneId === sceneId
    )
  }

  renderScenes () {
    var cardMapping = this.cardMapping()
    const scenes = _.sortBy(this.props.scenes, 'position')
    return scenes.map(s =>
      <SceneView key={s.id} scene={s} cards={cardMapping[s.id]} />
    )
  }

  render () {
    return (
      <div>
        {this.renderScenes()}
      </div>
    )
  }
}

OutlineView.propTypes = {
  scenes: PropTypes.array.isRequired,
  lines: PropTypes.array.isRequired,
  cards: PropTypes.array.isRequired
}

function mapStateToProps (state) {
  return {
    scenes: state.scenes,
    lines: state.lines,
    cards: state.cards
  }
}

function mapDispatchToProps (dispatch) {
  return {}
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OutlineView)
