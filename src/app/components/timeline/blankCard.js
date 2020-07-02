import React, { Component } from 'react'
import { findDOMNode } from 'react-dom'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Cell } from 'react-sticky-table'
import * as CardActions from 'actions/cards'
import CardSVGline from 'components/timeline/CardSVGline'
import i18n from 'format-message'
import { FormControl, FormGroup, ControlLabel } from 'react-bootstrap'
import { card } from '../../../../shared/initialState'
import { isSeriesSelector } from '../../selectors/ui'
import cx from 'classnames'

class BlankCard extends Component {
  constructor (props) {
    super(props)
    this.state = {
      creating: false,
      dropping: false,
    }
  }

  handleDragEnter = (e) => {
    this.setState({dropping: true})
  }

  handleDragOver = (e) => {
    this.setState({dropping: true})
    e.preventDefault()
  }

  handleDragLeave = (e) => {
    this.setState({dropping: false})
  }

  handleDrop = (e) => {
    e.stopPropagation()
    this.setState({dropping: false, mouseOverIt: false})

    var json = e.dataTransfer.getData('text/json')
    var droppedCard = JSON.parse(json)
    if (droppedCard.id === null || droppedCard.id === undefined) return

    this.props.actions.editCardCoordinates(droppedCard.id, this.props.lineId, this.props.chapterId, this.props.currentTimeline)
  }

  saveCreate = () => {
    var newCard = this.buildCard(findDOMNode(this.refs.titleInput).value)
    this.props.actions.addCard(newCard)
    this.setState({creating: false})
  }

  handleFinishCreate = (event) => {
    if (event.which === 13) { //enter
      this.saveCreate()
    }
  }

  startCreating = () => {
    this.setState({creating: true})
  }

  buildCard (title) {
    const { chapterId, lineId } = this.props
    if (this.props.isSeries) {
      return Object.assign({}, card, { title, beatId: chapterId, seriesLineId: lineId })
    } else {
      return Object.assign({}, card, { title, chapterId, lineId })
    }
  }

  handleCancelCreate = (event) => {
    if (event.which === 27) { //esc
      this.setState({creating: false})
    }
  }

  handleBlur = () => {
    var newTitle = findDOMNode(this.refs.titleInput).value
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
    return <div className={cx('blank-card__body', {hover: this.state.dropping})} style={blankCardStyle} />
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
    // console.count('BlankCard')
    let body = null
    if (this.state.creating) {
      window.SCROLLWITHKEYS = false
      body = this.renderCreateNew()
    } else {
      window.SCROLLWITHKEYS = true
      body = this.renderBlank()
    }
    return <Cell>
      <div
        className='card__cell'
        onDragEnter={this.handleDragEnter}
        onDragOver={this.handleDragOver}
        onDragLeave={this.handleDragLeave}
        onDrop={this.handleDrop}
        onClick={this.startCreating}
      >
        {body}
      </div>
    </Cell>
  }

  shouldComponentUpdate (nextProps, nextState) {
    if (this.state.dropping != nextState.dropping) return true
    if (this.state.creating != nextState.creating) return true
    if (this.props.color != nextProps.color) return true
    return false
  }
}

BlankCard.propTypes = {
  chapterId: PropTypes.number,
  lineId: PropTypes.number,
  color: PropTypes.string.isRequired,
  currentTimeline: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  orientation: PropTypes.string,
  isSeries: PropTypes.bool,
}

function mapStateToProps (state) {
  return {
    currentTimeline: state.present.ui.currentTimeline,
    orientation: state.present.ui.orientation,
    isSeries: isSeriesSelector(state.present),
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
