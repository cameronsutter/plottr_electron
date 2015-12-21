import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Glyphicon, Button, Input } from 'react-bootstrap'
import * as LineActions from 'actions/lines'
import CardView from 'components/cardView'
import _ from 'lodash'

class LineView extends Component {
  constructor (props) {
    super(props)
    this.state = {
      hovering: false,
      editing: false,
      dragging: false,
      dropping: false,
      editingWhat: ''
    }
  }

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

  handleFinishEditingTitle (event) {
    if (event.which === 13) {
      var id = this.props.line.id
      var newTitle = this.refs.titleInput.getValue()
      this.props.actions.editLineTitle(id, newTitle)
      this.setState({editing: false})
    }
  }

  handleFinishEditingColor (event) {
    if (event.which === 13) {
      var id = this.props.line.id
      var newColor = this.refs.colorInput.getValue()
      this.props.actions.editLineColor(id, newColor)
      this.setState({editing: false})
    }
  }

  handleDragStart (e) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/json', JSON.stringify(this.props.line))
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
    var droppedLine = JSON.parse(json)
    if (!droppedLine.id) return

    this.props.handleReorder(this.props.line.position, droppedLine.position)
  }

  handleDelete () {
    if (window.confirm(`Do you want to delete this story line: '${this.props.line.title}'?`)) {
      this.props.actions.deleteLine(this.props.line.id)
    }
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

  renderHoverOptions () {
    var style = {visibility: 'hidden'}
    if (this.state.hovering) style.visibility = 'visible'
    return (<div className='line__hover-options' style={style}>
      <Button block onClick={() => this.setState({editing: true, editingWhat: 'title'})}><Glyphicon glyph='edit' /></Button>
      <Button block bsStyle='info' onClick={() => this.setState({editing: true, editingWhat: 'color'})}><Glyphicon glyph='tint' /></Button>
      <Button block bsStyle='danger' onClick={this.handleDelete.bind(this)}><Glyphicon glyph='trash' /></Button>
    </div>)
  }

  renderBody () {
    var classes = 'line__body'
    if (this.state.hovering) classes += ' hover'
    var toRender = <div className='line__title'>{this.props.line.title}</div>
    if (this.state.editing) {
      switch (this.state.editingWhat) {
        case 'title':
          toRender = (<Input
            type='text'
            placeholder={this.props.line.title}
            label='Story line name'
            ref='titleInput'
            autoFocus
            onBlur={() => this.setState({editing: false})}
            onKeyPress={this.handleFinishEditingTitle.bind(this)} />)
          break
        case 'color':
          toRender = (<Input
            type='color'
            placeholder={this.props.line.color}
            defaultValue={this.props.line.color}
            label='Story line color'
            ref='colorInput'
            autoFocus
            onBlur={() => this.setState({editing: false})}
            onKeyPress={this.handleFinishEditingColor.bind(this)} />)
          break
        default:
          return null
      }
    }
    return (
      <div className={classes}>
        {toRender}
      </div>
    )
  }

  render () {
    var lineLength = this.lineLength()
    return (
      <div className='line'
        style={{width: (lineLength + this.width())}}
        onMouseEnter={() => this.setState({hovering: true})}
        onMouseLeave={() => this.setState({hovering: false})}
        draggable={true}
        onMouseEnter={() => this.setState({hovering: true})}
        onMouseLeave={() => this.setState({hovering: false})}
        onDragStart={this.handleDragStart.bind(this)}
        onDragEnd={this.handleDragEnd.bind(this)}
        onDragEnter={this.handleDragEnter.bind(this)}
        onDragOver={this.handleDragOver.bind(this)}
        onDragLeave={this.handleDragLeave.bind(this)}
        onDrop={this.handleDrop.bind(this)} >
        {this.renderHoverOptions()}
        {this.renderBody()}
        <div className='line__svg-line-box'>
          <svg width={lineLength} >
            <line x1='0' y1={this.height()} x2={lineLength} y2={this.height()} className='line__svg-line' style={{stroke: this.props.line.color}} />
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
  cards: PropTypes.array.isRequired,
  actions: PropTypes.object.isRequired,
  handleReorder: PropTypes.func.isRequired
}

function mapStateToProps (state) {
  return {
    lines: state.lines,
    scenes: state.scenes,
    cards: state.cards
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(LineActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LineView)
