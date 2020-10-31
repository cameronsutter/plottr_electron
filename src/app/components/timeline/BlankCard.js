import React, { Component } from 'react'
import { findDOMNode } from 'react-dom'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Cell } from 'react-sticky-table'
import * as CardActions from 'actions/cards'
import i18n from 'format-message'
import { FormControl, FormGroup, ControlLabel } from 'react-bootstrap'
import cx from 'classnames'
import { isSeriesSelector } from '../../selectors/ui'

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
    this.setState({dropping: false})

    const json = e.dataTransfer.getData('text/json')
    const droppedData = JSON.parse(json)
    if (!droppedData.cardId) return

    const {
      chapterId,
      lineId,
      isSeries
    } = this.props;

    this.props.actions.reorderCardsWithinLine(
      chapterId,
      lineId,
      isSeries,
      [droppedData.cardId],
    )
  }

  saveCreate = () => {
    const newCard = this.buildCard(findDOMNode(this.refs.titleInput).value)
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
      return { title, beatId: chapterId, seriesLineId: lineId, positionWithinLine: 0 }
    } else {
      return { title, chapterId, lineId, positionWithinLine: 0 }
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
    const cardStyle = {
      borderColor: this.props.color
    }
    return (
      <div className='card__body' style={cardStyle}>
        <FormGroup>
          <ControlLabel>{i18n('Scene Title')}</ControlLabel>
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
    window.SCROLLWITHKEYS = !this.state.creating

    let body = null
    if (this.state.creating) {
      body = this.renderCreateNew()
    } else {
      body = this.renderBlank()
    }

    const vertical = this.props.orientation === 'vertical';
    return (
      <Cell>
        <div
          className={cx('card__cell', { vertical })}
          onDragEnter={this.handleDragEnter}
          onDragOver={this.handleDragOver}
          onDragLeave={this.handleDragLeave}
          onDrop={this.handleDrop}
          onClick={this.startCreating}
        >
          {/* This div is necessary to match the structure of scene cell cards
              and thus get the styles to apply in the same way (flexbox) */}
          <div>
            {body}
          </div>
        </div>
      </Cell>
    )
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
