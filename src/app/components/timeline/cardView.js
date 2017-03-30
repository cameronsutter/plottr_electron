import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import _ from 'lodash'
import { Label, Input } from 'react-bootstrap'
import CardDialog from 'components/timeline/cardDialog'
import * as CardActions from 'actions/cards'
import orientedClassName from 'helpers/orientedClassName'

class CardView extends Component {
  constructor (props) {
    super(props)
    this.state = {dialogOpen: false, creating: false, dropping: false, dragging: false, hovering: false}
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
    if (droppedCard.id === null || droppedCard.id === undefined) return

    this.props.actions.editCardCoordinates(droppedCard.id, this.props.lineId, this.props.sceneId)
  }

  handleCardClick () {
    if (this.props.isZoomed) {
      var box = this.refs.card.getBoundingClientRect()
      this.props.zoomIn(box.left, box.top)
    } else {
      this.setState({dialogOpen: true})
    }
  }

  handleFinishCreate (event) {
    if (event.which === 13) {
      var newCard = this.buildCard(this.refs.titleInput.getValue())
      this.props.actions.addCard(newCard)
      this.setState({creating: false})
    }
  }

  buildCard (title) {
    return {
      title: title,
      sceneId: this.props.sceneId,
      lineId: this.props.lineId,
      description: '',
      characters: [],
      places: [],
      tags: []
    }
  }

  handleCancelCreate (event) {
    if (event.which === 27) {
      this.setState({creating: false})
    }
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
    if (this.props.filtered) {
      cardStyle.opacity = '0.1'
    }
    if (this.props.isZoomed && this.state.hovering) {
      cardStyle.transform = 'scale(5, 5)'
    }
    var titleStyle = (!this.props.isZoomed && this.state.hovering && this.hasLabels()) ? {overflow: 'scroll'} : {}

    return (<div
      className={orientedClassName('card__real', this.props.orientation)}
      ref='card'
      draggable={true}
      onDragStart={this.handleDragStart.bind(this)}
      onDragEnd={this.handleDragEnd.bind(this)}
      onMouseEnter={() => this.setState({hovering: true})}
      onMouseLeave={() => this.setState({hovering: false})}
      style={cardStyle}
      onClick={this.handleCardClick.bind(this)} >
        <div className='card__title' style={titleStyle}>{this.renderTitle()}</div>
    </div>)
  }

  renderBlank () {
    if (this.state.creating) {
      window.SCROLLWITHKEYS = false
      return this.renderCreateNew()
    } else {
      window.SCROLLWITHKEYS = true
      return this.renderBlankShape()
    }
  }

  renderBlankShape () {
    var cardClass = 'card__blank'
    if (this.state.dropping) {
      cardClass += ' card__hover'
    }

    return (
      <div
        className={orientedClassName(cardClass, this.props.orientation)}
        onDragEnter={this.handleDragEnter.bind(this)}
        onDragOver={this.handleDragOver.bind(this)}
        onDragLeave={this.handleDragLeave.bind(this)}
        onDrop={this.handleDrop.bind(this)}
        onClick={ () => { this.setState({creating: true}) } }
        style={{borderColor: this.props.color}}
      ></div>
    )
  }

  renderCreateNew () {
    return (
      <div className={orientedClassName('card__real card__creating', this.props.orientation)} style={{borderColor: this.props.color}}>
        <div className='card__creating__inner-wrapper'>
          <Input
            type='text'
            autoFocus
            label='Card Title'
            ref='titleInput'
            bsSize='small'
            onBlur={() => this.setState({creating: false})}
            onKeyDown={this.handleCancelCreate.bind(this)}
            onKeyPress={this.handleFinishCreate.bind(this)} />
        </div>
      </div>
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
        labelMap={this.props.labelMap}
        closeDialog={this.closeDialog.bind(this)} />
    )
  }

  renderTitle () {
    if (this.state.hovering && this.hasLabels()) {
      return this.renderTags()
    } else {
      return <p>{this.props.card.title}</p>
    }
  }

  hasLabels () {
    const { card } = this.props
    return card.tags && card.tags.length > 0
  }

  renderTags () {
    var tags = null
    if (this.props.card.tags) {
      tags = this.props.card.tags.map(tId => {
        var tag = _.find(this.props.tags, 'id', tId)
        if (!tag) return null
        var style = {}
        if (tag.color) style = {backgroundColor: tag.color}
        return <Label bsStyle='info' style={style} key={tId}>{tag.title}</Label>
      })
    }
    return (<div className='labels'>
      {tags}
    </div>)
  }
}

CardView.propTypes = {
  card: PropTypes.object,
  sceneId: PropTypes.number.isRequired,
  lineId: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
  filtered: PropTypes.bool.isRequired,
  labelMap: PropTypes.object.isRequired,
  tags: PropTypes.array,
  isZoomed: PropTypes.bool.isRequired,
  zoomIn: PropTypes.func.isRequired,
  orientation: PropTypes.string.isRequired
}

function mapStateToProps (state) {
  return {
    tags: state.tags,
    orientation: state.ui.orientation
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
)(CardView)
