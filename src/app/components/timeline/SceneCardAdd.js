import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import i18n from 'format-message'
import { findDOMNode } from 'react-dom'
import { Glyphicon, FormGroup, FormControl, ControlLabel } from 'react-bootstrap'
import cx from 'classnames'

export default class SceneCardAdd extends Component {
  state = {creating: false, dropping: false}

  saveCreate = () => {
    const title = findDOMNode(this.refs.titleInput).value
    this.props.addCard({title, positionWithinLine: this.props.positionWithinLine + 1})
    this.setState({creating: false})
  }

  handleFinishCreate = (event) => {
    if (event.which === 13) { //enter
      this.saveCreate()
    }
  }

  handleCancelCreate = (event) => {
    if (event.which === 27) { //esc
      this.setState({creating: false})
    }
  }

  handleBlur = () => {
    var newTitle = findDOMNode(this.refs.titleInput).value
    if (newTitle == '') {
      this.setState({creating: false})
      return false
    } else {
      this.saveCreate()
      this.setState({creating: false})
    }
  }

  startCreating = () => {
    this.setState({creating: true})
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

    this.props.moveCard(droppedData.cardId, this.props.dropPosition || this.props.positionWithinLine)
  }

  render () {
    if (this.state.creating) {
      var cardStyle = {
        borderColor: this.props.color
      }
      return <div className='card__body' style={cardStyle}>
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
    } else {
      if (this.props.allowDrop) {
        return <div className={cx('card__add-card', {dropping: this.state.dropping})}
          onClick={this.startCreating}
          onDragEnter={this.handleDragEnter}
          onDragOver={this.handleDragOver}
          onDragLeave={this.handleDragLeave}
          onDrop={this.handleDrop}
        >
          <Glyphicon glyph='plus' />
        </div>
      } else {
        return <div className={cx('card__add-card', {dropping: this.state.dropping})} onClick={this.startCreating}>
          <Glyphicon glyph='plus' />
        </div>
      }
    }
  }

  shouldComponentUpdate (nextProps, nextState) {
    if (this.state.dropping != nextState.dropping) return true
    if (this.state.creating != nextState.creating) return true
    if (this.props.color != nextProps.color) return true
    if (this.props.allowDrop != nextProps.allowDrop) return true
    return false
  }

  static propTypes = {
    color: PropTypes.string.isRequired,
    positionWithinLine: PropTypes.number.isRequired,
    moveCard: PropTypes.func.isRequired,
    addCard: PropTypes.func.isRequired,
    allowDrop: PropTypes.bool.isRequired,
    dropPosition: PropTypes.number,
  }
}