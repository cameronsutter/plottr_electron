import React, { Component } from 'react'
import { findDOMNode } from 'react-dom'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Glyphicon, Button, ButtonGroup, FormControl, FormGroup, ControlLabel } from 'react-bootstrap'
import { Cell } from 'react-sticky-table'
import * as LineActions from 'actions/lines'
import * as SeriesLineActions from 'actions/seriesLines'
import ColorPicker from '../colorpicker'
import orientedClassName from 'helpers/orientedClassName'
import i18n from 'format-message'

class LineTitleCell extends Component {
  constructor (props) {
    super(props)
    this.state = {
      hovering: false,
      editing: props.line.title === '',
      dragging: false,
      dropping: false,
      showColorPicker: false
    }
  }

  editTitle = () => {
    var id = this.props.line.id
    const ref = findDOMNode(this.refs.titleRef)
    if (!ref) return
    this.props.actions.editLineTitle(id, ref.value)
    this.setState({editing: false, hovering: false})
  }

  handleFinishEditingTitle = (event) => {
    if (event.which === 13) {
      this.editTitle()
    }
  }

  handleBlur = () => {
    if (findDOMNode(this.refs.titleRef).value !== '') {
      this.editTitle()
      this.setState({editing: false, hovering: false})
    }
  }

  handleDragStart = (e) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/json', JSON.stringify(this.props.line))
    this.setState({dragging: true})
  }

  handleDragEnd = () => {
    this.setState({dragging: false})
  }

  handleDragEnter = (e) => {
    this.setState({dropping: true})
  }

  handleDragOver = (e) => {
    this.setState({dropping: true})
    e.preventDefault()
    return false
  }

  handleDragLeave = (e) => {
    this.setState({dropping: false})
  }

  handleDrop = (e) => {
    e.stopPropagation()
    this.setState({dropping: false})

    var json = e.dataTransfer.getData('text/json')
    var droppedLine = JSON.parse(json)
    if (droppedLine.id == null) return

    this.props.handleReorder(this.props.line.position, droppedLine.position)
  }

  handleDelete = () => {
    const { line } = this.props
    let label = i18n("Do you want to delete this story line: { title }?", {title: line.title})
    if (window.confirm(label)) {
      this.props.actions.deleteLine(line.id)
    }
  }

  changeColor = (newColor) => {
    if (newColor) {
      this.props.actions.editLineColor(this.props.line.id, newColor)
    }
    this.setState({showColorPicker: false})
  }

  renderColorPicker () {
    if (this.state.showColorPicker) {
      var key = 'colorPicker-' + this.props.line.id
      return <ColorPicker key={key} darkMode={this.props.ui.darkMode} color={this.props.line.color} closeDialog={this.changeColor} />
    } else {
      return null
    }
  }

  renderHoverOptions () {
    if (this.props.ui.orientation === 'vertical') {
      return (<div className={orientedClassName('line-title__hover-options', this.props.ui.orientation)}>
        <ButtonGroup>
          <Button onClick={() => this.setState({editing: true})}><Glyphicon glyph='edit' /></Button>
          <Button onClick={() => this.setState({showColorPicker: true})}><Glyphicon glyph='tint' /></Button>
          <Button onClick={this.handleDelete}><Glyphicon glyph='trash' /></Button>
        </ButtonGroup>
      </div>)
    } else {
      return (<div className='line-title__hover-options'>
        <Button block onClick={() => this.setState({editing: true})}><Glyphicon glyph='edit' /></Button>
        <Button block onClick={() => this.setState({showColorPicker: true})}><Glyphicon glyph='tint' /></Button>
        <Button block onClick={this.handleDelete}><Glyphicon glyph='trash' /></Button>
      </div>)
    }
  }

  renderTitle () {
    if (!this.state.editing) return this.props.line.title
    return <FormGroup>
      <ControlLabel>{i18n('Story line name')}</ControlLabel>
      <FormControl
        type='text'
        defaultValue={this.props.line.title}
        ref='titleRef'
        autoFocus
        onKeyDown={(event) => {if (event.which === 27) this.setState({editing: false})}}
        onBlur={this.handleBlur}
        onKeyPress={this.handleFinishEditingTitle} />
    </FormGroup>
  }

  render () {
    if (this.state.editing) {
      window.SCROLLWITHKEYS = false
    } else {
      window.SCROLLWITHKEYS = true
    }
    let innerKlass = orientedClassName('line-title__body', this.props.ui.orientation)
    if (this.state.hovering) innerKlass += ' hover'
    if (this.state.dropping) innerKlass += ' dropping'
    return <Cell>
      <div
        className={orientedClassName('line-title__cell', this.props.ui.orientation)}
        onMouseEnter={() => this.setState({hovering: true})}
        onMouseLeave={() => this.setState({hovering: false})}
        onDrop={this.handleDrop}>
        { this.renderHoverOptions() }
        <div className={innerKlass}
          onClick={() => this.setState({editing: true})}
          onDragStart={this.handleDragStart}
          onDragEnd={this.handleDragEnd}
          onDragEnter={this.handleDragEnter}
          onDragOver={this.handleDragOver}
          onDragLeave={this.handleDragLeave}
          draggable={true}>
          { this.renderTitle() }
        </div>
      </div>
      { this.renderColorPicker() }
    </Cell>
  }
}

LineTitleCell.propTypes = {
  line: PropTypes.object.isRequired,
  bookId: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  actions: PropTypes.object.isRequired,
  ui: PropTypes.object.isRequired,
}

function mapStateToProps (state) {
  return {
    ui: state.ui
  }
}

function mapDispatchToProps (dispatch, ownProps) {
  let actions = ownProps.bookId == 'series' ? SeriesLineActions : LineActions
  return {
    actions: bindActionCreators(actions, dispatch),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LineTitleCell)
