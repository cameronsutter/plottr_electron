import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import _ from 'lodash'
import MarkDown from 'pagedown'
import { Label, Input, Popover, OverlayTrigger } from 'react-bootstrap'
import CardDialog from 'components/timeline/cardDialog'
import * as CardActions from 'actions/cards'
import orientedClassName from 'helpers/orientedClassName'

const md = MarkDown.getSanitizingConverter()

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
    var zoomFactor = this.props.zoomFactor
    if (this.props.isZoomed && this.state.hovering) {
      switch(true) {
        case zoomFactor < 0.25:
          cardStyle.transform = 'scale(6, 6)'
          break;
        case zoomFactor === 0.25:
          cardStyle.transform = 'scale(3, 3)';
          break;
        case zoomFactor === 0.50:
          cardStyle.transform = 'scale(2, 2)';
          break;
        case zoomFactor > 0.50:
          cardStyle.transform = 'scale(1, 1)'
          break;
        default:
          cardStyle.transform = 'scale(4, 4)' // This is for fit
      }
    }

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
        {this.renderTitle()}
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
    let title = <div className='card__title'>
      <p>{this.props.card.title}</p>
    </div>
    if (!this.props.isZoomed && (this.hasLabels() || this.props.card.description)) {
      let placement = 'left'
      if (this.props.orientation === 'horizontal') {
        placement = this.props.scenePosition === 1 ? 'right' : placement
      } else {
        placement = this.props.linePosition === 1 ? 'right' : placement
      }
      title = <OverlayTrigger ref='popover' placement={placement} overlay={this.renderPopover()}>
        {title}
      </OverlayTrigger>
    }
    return title
  }

  renderPopover () {
    return <Popover title={'Description'} id={`card-popover-${this.props.card.id}`}>
      <div className='card__popover-description' dangerouslySetInnerHTML={{__html: this.makeLabels(md.makeHtml(this.props.card.description))}} />
      {this.renderTags()}
    </Popover>
  }

  makeLabels (html) {
    var regex = /{{([\w\s]*)}}/gi
    var matches
    while ((matches = regex.exec(html)) !== null) {
      var labelText = matches[1].toLowerCase()
      if (this.props.labelMap[labelText] !== undefined) {
        var color = this.props.labelMap[labelText]
        html = html.replace(matches[0], `<span style='background-color:${color}' class='label label-default'>${labelText}</span>`)
      }
    }
    return html
  }

  hasLabels () {
    const { card } = this.props
    return card.tags && card.tags.length > 0
  }

  renderTags () {
    var tags = null
    if (this.props.card.tags) {
      tags = this.props.card.tags.map(tId => {
        var tag = _.find(this.props.tags, {id: tId})
        if (!tag) return null
        var style = {}
        if (tag.color) style = {backgroundColor: tag.color}
        return <Label bsStyle='info' style={style} key={tId}>{tag.title}</Label>
      })
    }
    return (<div className='card__popover-labels'>
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
  zoomFactor: PropTypes.any.isRequired,
  zoomIn: PropTypes.func.isRequired,
  orientation: PropTypes.string.isRequired,
  linePosition: PropTypes.number.isRequired,
  scenePosition: PropTypes.number.isRequired
}

function mapStateToProps (state, passedProps) {
  let line = state.lines.find(l => l.id === passedProps.lineId)
  let scene = state.scenes.find(s => s.id === passedProps.sceneId)
  return {
    tags: state.tags,
    orientation: state.ui.orientation,
    linePosition: line.position,
    scenePosition: scene.position
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
