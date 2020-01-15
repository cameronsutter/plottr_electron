import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Cell } from 'react-sticky-table'
import * as CardActions from 'actions/cards'
import CardSVGline from 'components/timeline/cardSVGline'
import i18n from 'format-message'
import orientedClassName from 'helpers/orientedClassName'
import { FormControl, FormGroup, ControlLabel } from 'react-bootstrap'

class BlankCard extends Component {
  constructor (props) {
    super(props)
    this.state = {
      creating: false,
      hovering: false
    }
  }

  saveCreate = () => {
    var newCard = this.buildCard(this.refs.titleInput.getValue())
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
    var newTitle = this.refs.titleInput.getValue()
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
    return <div className='blank-card__body' style={blankCardStyle}>
      {i18n('New Card')}
    </div>
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
      <div className='card__cell' onClick={() => this.setState({creating: true})}>
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
