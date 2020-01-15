import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Cell } from 'react-sticky-table'
import * as CardActions from 'actions/cards'
import CardSVGline from 'components/timeline/cardSVGline'
import i18n from 'format-message'
import { FormControl, FormGroup, ControlLabel } from 'react-bootstrap'
import ReactDOM from 'react-dom'

class BlankCard extends Component {
  constructor (props) {
    super(props)
    this.state = {
      creating: false,
      dropping: false,
      mouseOverIt: false,
    }
    this.dragLeaveTimeout = null
    this.dragOverTimeout = null
  }

  componentWillUnmount() {
    clearTimeout(this.dragLeaveTimeout)
    clearTimeout(this.dragOverTimeout)
  }

  handleDragEnter = (e) => {
    this.setState({dropping: true})
  }

  handleDragOver = (e) => {
    if (!this.state.mouseOverIt) {
      this.setState({mouseOverIt: true})
      this.dragOverTimeout = setTimeout(() => {this.setState({mouseOverIt: false})}, 50)
    }
    e.preventDefault()
    return false
  }

  handleDragLeave = (e) => {
    this.dragLeaveTimeout = setTimeout(() => {
      if (!this.state.mouseOverIt) this.setState({dropping: false});
    }, 100)
  }

  handleDrop = (e) => {
    e.stopPropagation()
    this.setState({dropping: false, mouseOverIt: false})

    var json = e.dataTransfer.getData('text/json')
    var droppedCard = JSON.parse(json)
    if (droppedCard.id === null || droppedCard.id === undefined) return

    this.props.actions.editCardCoordinates(droppedCard.id, this.props.lineId, this.props.sceneId)
  }

  saveCreate = () => {
    var newCard = this.buildCard(ReactDOM.findDOMNode(this.refs.titleInput).value)
    this.props.actions.addCard(newCard)
    this.setState({creating: false})
  }

  handleFinishCreate = (event) => {
    if (event.which === 13) { //enter
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
    if (event.which === 27) { //esc
      this.setState({creating: false})
    }
  }

  handleBlur = () => {
    var newTitle = ReactDOM.findDOMNode(this.refs.titleInput).value
    if (newTitle === '') {
      this.setState({creating: false})
      return false
    } else {
      this.saveCreate()
      this.setState({creating: false})
    }
  }

  renderBlank () {
    var blankCardStyle = {
      borderColor: this.props.color
    }
    let klass = 'blank-card__body'
    if (this.state.dropping) klass += ' hover'
    return <div className={klass} style={blankCardStyle} />
  }

  renderCreateNew () {
    var cardStyle = {
      borderColor: this.props.color
    }
    return (
      <div className='card__body' style={cardStyle}>
        <FormGroup>
          <ControlLabel>{i18n('Card Title')}</ControlLabel>
          <FormControl
            type='text'
            autoFocus
            ref='titleInput'
            bsSize='small'
            onBlur={this.handleBlur}
            onKeyDown={this.handleCancelCreate}
            onKeyPress={this.handleFinishCreate} />
        </FormGroup>
      </div>
    )
  }

  render () {
    let body = null
    if (this.state.creating) {
      window.SCROLLWITHKEYS = false
      body = this.renderCreateNew()
    } else {
      window.SCROLLWITHKEYS = true
      body = this.renderBlank()
    }
    return <Cell>
      <div className='card__cell'
        onDragEnter={this.handleDragEnter}
        onDragOver={this.handleDragOver}
        onDragLeave={this.handleDragLeave}
        onDrop={this.handleDrop}
        onClick={() => this.setState({creating: true})}
      >
        <CardSVGline color={this.props.color} orientation={this.props.ui.orientation}/>
        {body}
      </div>
    </Cell>
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
