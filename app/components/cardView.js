import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import CardDialog from 'components/cardDialog'
import * as CardActions from '../actions/cards'
import 'style!css!sass!../css/card_block.css.scss'

class CardView extends Component {
  constructor (props) {
    super(props)
    this.state = {dialogOpen: false, creating: false, dropping: false, dragging: false}
  }

  closeDialog () {
    this.setState({dialogOpen: false})
  }

  handleDragStart (e) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/json', JSON.stringify(this.props.card))
    this.setState({dragging: true})
  }

  handleDragEnd () {
    this.setState({dragging: false})
  }

  handleDragEnter (e) {
    this.setState({dropping: true})
  }

  handleDragOver (e) {
    e.preventDefault()
    return false
  }

  handleDragLeave (e) {
    this.setState({dropping: false})
  }

  handleDrop (e) {
    e.stopPropagation()
    this.handleDragLeave()

    var json = e.dataTransfer.getData('text/json')
    var droppedCard = JSON.parse(json)
    if (!droppedCard.id) return

    this.props.actions.editCardPosition(droppedCard.id, this.props.lineId, this.props.sceneId)
  }

  render () {
    return this.state.dialogOpen ? this.renderDialog() : this.renderShape()
  }

  renderShape () {
    return this.props.card ? this.renderCard() : this.renderBlank()
  }

  renderCard () {
    var cardStyle = {
      borderColor: this.props.color
    }
    if (this.state.dragging) {
      cardStyle.opacity = '0.5'
    }

    return (<div className='card__real'
      draggable={true}
      onDragStart={this.handleDragStart.bind(this)}
      onDragEnd={this.handleDragEnd.bind(this)}
      style={cardStyle}
      onClick={() => this.setState({dialogOpen: true})} >
        <div className='card__title'>{this.props.card.title}</div>
    </div>)
  }

  renderBlank () {
    var cardClass = 'card__blank'
    if (this.state.dropping) {
      cardClass += ' card__hover'
    }

    return (
      <div className={cardClass}
        onDragEnter={this.handleDragEnter.bind(this)}
        onDragOver={this.handleDragOver.bind(this)}
        onDragLeave={this.handleDragLeave.bind(this)}
        onDrop={this.handleDrop.bind(this)}
        onClick={ () => { this.setState({creating: true, dialogOpen: true}) } }
        style={{borderColor: this.props.color}}
      ></div>
    )
  }

  renderDialog () {
    const { card, sceneId, lineId } = this.props
    var key = 'new' + sceneId + lineId
    if (card) key = card.id
    return (
      <CardDialog
        key={key}
        card={card}
        sceneId={sceneId}
        lineId={lineId}
        isNewCard={this.state.creating}
        closeDialog={this.closeDialog.bind(this)} />
    )
  }

}

CardView.propTypes = {
  card: PropTypes.object,
  sceneId: PropTypes.number.isRequired,
  lineId: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired
}

function mapStateToProps (state) {
  return {}
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(CardActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CardView)
