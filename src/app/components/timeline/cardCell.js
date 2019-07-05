import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Cell } from 'react-sticky-table'
import * as CardActions from 'actions/cards'
import CardDialog from 'components/timeline/cardDialog'

const width = 200 + 20
const height = 60

class CardCell extends Component {
  constructor (props) {
    super(props)
    this.state = {
      dialogOpen: false,
      creating: false,
      dropping: false,
      dragging: false,
      hovering: false
    }
  }

  linePlacement () {
    if (this.props.ui.orientation == 'vertical') {
      return width / 2
    }
    return height / 2
  }

  renderSVGLine () {
    let style = {stroke: this.props.color}
    const placement = this.linePlacement()
    if (this.props.ui.orientation === 'vertical') {
      return (<svg height={height} >
        <line y1='0' x1={placement} y2={height} x2={placement} className='card__svg-line' style={style} />
      </svg>)
    } else {
      return (<svg width={width} >
        <line x1='0' y1={placement} x2={width} y2={placement} className='card__svg-line' style={style} />
      </svg>)
    }
  }

  renderDialog () {
    if (!this.dialogOpen) return null
    const { card, sceneId, lineId } = this.props
    return <CardDialog
      card={card}
      sceneId={sceneId}
      lineId={lineId}
      labelMap={this.props.labelMap}
      closeDialog={this.closeDialog}
    />
  }

  render () {
    return <Cell>
      <div className='card__cell'>
        { this.renderSVGLine() }
        <div className='card__body'>
          {this.props.card.title}
        </div>
        { this.renderDialog() }
      </div>
    </Cell>
  }
}

CardCell.propTypes = {
  card: PropTypes.object,
  sceneId: PropTypes.number.isRequired,
  lineId: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
  filtered: PropTypes.bool.isRequired,
  labelMap: PropTypes.object.isRequired,
  tags: PropTypes.array,
  isZoomed: PropTypes.bool.isRequired,
  ui: PropTypes.object.isRequired,
  linePosition: PropTypes.number.isRequired,
  scenePosition: PropTypes.number.isRequired
}

function mapStateToProps (state, passedProps) {
  let line = state.lines.find(l => l.id === passedProps.lineId)
  let scene = state.scenes.find(s => s.id === passedProps.sceneId)
  return {
    tags: state.tags,
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
)(CardCell)
