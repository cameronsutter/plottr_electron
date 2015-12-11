import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import CardView from 'components/cardView'
import _ from 'lodash'
import $ from 'jquery'

// import CardView from 'components/cardView'

// var RBS = require('react-bootstrap');
// var Button = RBS.Button;
// var Input = RBS.Input;
// var ButtonToolbar = RBS.ButtonToolbar;
// var Icon = RBS.Glyphicon;
// var Modal = require('react-modal/dist/react-modal');

class LineView extends Component {

  findCard (sceneId) {
    return _.find(this.cards(), (card) => {
      return card.sceneId === sceneId
    })
  }

  lineLength () {
    return this.numberOfScenes() * this.width() + 25
  }

  numberOfScenes () {
    return this.props.scenes.length + 1 // + 2 because of the placeholder and the new (hidden) beats
  }

  height () {
    return 66 / 2
  }

  width () {
    return 150 + 25
  }

  cards () {
    var cards = _.filter(this.props.cards, (card) => {
      return card.lineId === this.props.line.id
    })
    return _.sortBy(cards, 'position')
  }

  renderCards () {
    var sceneMap = this.props.sceneMap

    return Object.keys(sceneMap).map((scenePosition) => {
      var sceneId = sceneMap[scenePosition]
      var card = this.findCard(sceneId)
      var id = card ? card.id : '' + sceneId + scenePosition
      return (<CardView key={id} card={card}
        sceneId={sceneId} lineId={this.props.line.id}
        color={this.props.line.color} />
      )
    })
  }

  render () {
    var lineLength = this.lineLength()
    const { line } = this.props
    return (
      <div className='line' style={{width: (lineLength + this.width())}}>
        <div className='line__title-box'>
          <div className='line__title'>{line.title}</div>
        </div>
        <div className='line__svg-line-box'>
          <svg width={lineLength} >
            <line x1='0' y1={this.height()} x2={lineLength} y2={this.height()} className='line__svg-line' style={{stroke: line.color}} />
          </svg>
        </div>
        <div className='card__box'>
          {this.renderCards()}
        </div>
      </div>
    )
  }
}

LineView.propTypes = {
  line: PropTypes.object.isRequired,
  scenes: PropTypes.array.isRequired,
  sceneMap: PropTypes.object.isRequired,
  cards: PropTypes.array.isRequired
}

function mapStateToProps (state) {
  return {
    lines: state.lines,
    scenes: state.scenes,
    cards: state.cards
  }
}

function mapDispatchToProps (dispatch) {
  return {}
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LineView)
