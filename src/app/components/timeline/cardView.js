import React, { Component, PropTypes } from 'react'
import PureComponent from 'react.pure.component'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import _ from 'lodash'
import { Input, Popover, OverlayTrigger } from 'react-bootstrap'
import CardDialog from 'components/timeline/cardDialog'
import * as CardActions from 'actions/cards'
import orientedClassName from 'helpers/orientedClassName'
import MDdescription from 'components/mdDescription'
import TagLabel from 'components/tagLabel'
import i18n from 'format-message'


class CardView extends Component {
  constructor (props) {
    super(props)
    this.state = {dialogOpen: false, creating: false, dropping: false, dragging: false, hovering: false}
  }

  closeDialog = () => {
    this.setState({dialogOpen: false})
  }

  handleDragStart = (e) => {
    this.setState({dragging: true, hovering: false})
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/json', JSON.stringify(this.props.card))
  }

  handleDragEnd = () => {
    this.setState({dragging: false})
  }

  handleDragEnter = (e) => {
    this.setState({dropping: true})
  }

  handleDragOver = (e) => {
    e.preventDefault()
    return false
  }

  handleDragLeave = (e) => {
    this.setState({dropping: false})
  }

  handleDrop = (e) => {
    e.stopPropagation()
    this.handleDragLeave()

    var json = e.dataTransfer.getData('text/json')
    var droppedCard = JSON.parse(json)
    if (droppedCard.id === null || droppedCard.id === undefined) return

    this.props.actions.editCardCoordinates(droppedCard.id, this.props.lineId, this.props.sceneId)
  }

  handleCardClick = () => {
    if (this.props.isZoomed) {
      var box = this.refs.card.getBoundingClientRect()
      this.props.zoomIn(box.left, box.top)
    } else {
      this.setState({dialogOpen: true})
    }
  }

  saveCreate = () => {
    var newCard = this.buildCard(this.refs.titleInput.getValue())
    this.props.actions.addCard(newCard)
    this.setState({creating: false})
  }

  handleFinishCreate = (event) => {
    if (event.which === 13) {
      this.saveCreate()
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

  handleCancelCreate = (event) => {
    if (event.which === 27) {
      this.setState({creating: false})
    }
  }

  handleBlur = () => {
    var newTitle = this.refs.titleInput.getValue()
    if (newTitle === '') {
      this.setState({creating: false})
      return false
    } else {
      this.saveCreate()
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

    let cardClasses = orientedClassName('card__real', this.props.ui.orientation)
    if (this.props.ui.darkMode) cardClasses += ' darkmode'

    return (<div
      className={cardClasses}
      ref='card'
      draggable={true}
      onDragStart={this.handleDragStart}
      onDragEnd={this.handleDragEnd}
      onMouseEnter={() => this.setState({hovering: true})}
      onMouseLeave={() => this.setState({hovering: false})}
      style={cardStyle}
      onClick={this.handleCardClick} >
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
        className={orientedClassName(cardClass, this.props.ui.orientation)}
        onDragEnter={this.handleDragEnter}
        onDragOver={this.handleDragOver}
        onDragLeave={this.handleDragLeave}
        onDrop={this.handleDrop}
        onClick={ () => { this.setState({creating: true}) } }
        style={{borderColor: this.props.color}}
      ></div>
    )
  }

  renderCreateNew () {
    return (
      <div className={orientedClassName('card__real card__creating', this.props.ui.orientation)} style={{borderColor: this.props.color}}>
        <div className='card__creating__inner-wrapper'>
          <Input
            type='text'
            autoFocus
            label={i18n('Card Title')}
            ref='titleInput'
            bsSize='small'
            onBlur={this.handleBlur}
            onKeyDown={this.handleCancelCreate}
            onKeyPress={this.handleFinishCreate} />
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
        closeDialog={this.closeDialog} />
    )
  }

  renderTitle () {
    let title = <div className='card__title'>
      <p>{this.props.card.title}</p>
    </div>
    if (!this.state.dragging && !this.props.isZoomed && (this.hasLabels() || this.props.card.description)) {
      let placement = 'left'
      if (this.props.ui.orientation === 'horizontal') {
        placement = this.props.scenePosition === 0 ? 'right' : placement
      } else {
        placement = this.props.linePosition === 0 ? 'right' : placement
      }
      title = <OverlayTrigger placement={placement} overlay={this.renderPopover()}>
        {title}
      </OverlayTrigger>
    }
    return title
  }

  renderPopover () {
    return <Popover title={this.props.card.title} id={`card-popover-${this.props.card.id}`}>
      <MDdescription className='card__popover-description' labels={this.props.labelMap}
        description={this.props.card.description.substring(0, 1000)}
        darkMode={this.props.ui.darkMode}
      />
      {this.renderTags()}
    </Popover>
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
        return <TagLabel tag={tag} key={`timeline-taglabel-${tId}`} />
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

const Pure = PureComponent(CardView)

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Pure)
