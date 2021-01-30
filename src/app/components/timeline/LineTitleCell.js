import React, { PureComponent } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {
  Glyphicon,
  Button,
  ButtonGroup,
  FormControl,
  FormGroup,
  ControlLabel,
} from 'react-bootstrap'
import { Cell } from 'react-sticky-table'
import * as LineActions from 'actions/lines'
import * as SeriesLineActions from 'actions/seriesLines'
import ColorPicker from '../colorpicker'
import DeleteConfirmModal from '../dialogs/DeleteConfirmModal'
import orientedClassName from 'helpers/orientedClassName'
import i18n from 'format-message'
import cx from 'classnames'
import { FaExpandAlt, FaCompressAlt } from 'react-icons/fa'
import { lineIsExpandedSelector } from '../../selectors/lines'
import Floater from 'react-floater'
import { truncateTitle } from 'helpers/cards'

const CELL_WIDTH = 200

class LineTitleCell extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      hovering: false,
      editing: props.line.title === '',
      dragging: false,
      dropping: false,
      showColorPicker: false,
      deleting: false,
    }
    this.hoverTimeout = null
  }

  deleteLine = (e) => {
    e.stopPropagation()
    this.props.actions.deleteLine(this.props.line.id)
  }

  cancelDelete = (e) => {
    e.stopPropagation()
    this.setState({ deleting: false })
  }

  handleDelete = (e) => {
    e.stopPropagation()
    this.setState({ deleting: true, hovering: false })
  }

  editTitle = () => {
    var id = this.props.line.id
    const ref = this.titleRef
    if (!ref) return
    this.props.actions.editLineTitle(id, ref.value)
    this.setState({ editing: false, hovering: false })
  }

  handleFinishEditingTitle = (event) => {
    if (event.which === 13) {
      this.editTitle()
    }
  }

  handleBlur = () => {
    if (this.titleRef.value !== '') {
      this.editTitle()
      this.setState({ editing: false, hovering: false })
    }
  }

  handleDragStart = (e) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/json', JSON.stringify(this.props.line))
    this.setState({ dragging: true })
  }

  handleDragEnd = () => {
    this.setState({ dragging: false })
  }

  handleDragEnter = (e) => {
    this.setState({ dropping: true })
  }

  handleDragOver = (e) => {
    this.setState({ dropping: true })
    e.preventDefault()
    return false
  }

  handleDragLeave = (e) => {
    this.setState({ dropping: false })
  }

  handleDrop = (e) => {
    e.stopPropagation()
    this.setState({ dropping: false })

    var json = e.dataTransfer.getData('text/json')
    var droppedLine = JSON.parse(json)
    if (droppedLine.id == null) return

    this.props.handleReorder(this.props.line.position, droppedLine.position)
  }

  handleEsc = (event) => {
    if (event.which === 27) this.setState({ editing: false })
  }

  changeColor = (newColor) => {
    if (newColor) {
      this.props.actions.editLineColor(this.props.line.id, newColor)
    }
    this.setState({ showColorPicker: false })
  }

  openColorPicker = () => {
    this.setState({ showColorPicker: true })
  }

  startEditing = () => {
    this.setState({ editing: true })
  }

  startHovering = () => {
    clearTimeout(this.hoverTimeout)
    this.setState({ hovering: true })
  }

  stopHovering = () => {
    this.hoverTimeout = setTimeout(() => this.setState({ hovering: false }), 200)
  }

  toggleLine = () => {
    if (this.props.lineIsExpanded) {
      this.props.actions.collapseLine(this.props.line.id)
    } else {
      this.props.actions.expandLine(this.props.line.id)
    }
  }

  renderDelete() {
    if (!this.state.deleting) return null

    return (
      <DeleteConfirmModal
        name={this.props.line.title || i18n('New Plotline')}
        onDelete={this.deleteLine}
        onCancel={this.cancelDelete}
      />
    )
  }

  renderColorPicker() {
    if (this.state.showColorPicker) {
      var key = 'colorPicker-' + this.props.line.id
      return <ColorPicker key={key} color={this.props.line.color} closeDialog={this.changeColor} />
    } else {
      return null
    }
  }

  renderHoverOptions = () => {
    let expandedIcon = null
    if (this.props.lineIsExpanded) {
      expandedIcon = <FaCompressAlt />
    } else {
      expandedIcon = <FaExpandAlt />
    }

    if (this.props.ui.orientation === 'vertical') {
      return (
        <div className={orientedClassName('line-title__hover-options', this.props.ui.orientation)}>
          <Button block bsSize="small" onClick={this.startEditing}>
            <Glyphicon glyph="edit" />
          </Button>
          <Button block bsSize="small" onClick={this.openColorPicker}>
            <Glyphicon glyph="tint" />
          </Button>
          <Button block bsSize="small" onClick={this.toggleLine}>
            {expandedIcon}
          </Button>
          <Button block bsSize="small" onClick={this.handleDelete}>
            <Glyphicon glyph="trash" />
          </Button>
        </div>
      )
    } else {
      return (
        <div className="line-title__hover-options">
          <ButtonGroup>
            <Button bsSize="small" onClick={this.startEditing}>
              <Glyphicon glyph="edit" />
            </Button>
            <Button bsSize="small" onClick={this.openColorPicker}>
              <Glyphicon glyph="tint" />
            </Button>
            <Button bsSize="small" onClick={this.toggleLine}>
              {expandedIcon}
            </Button>
            <Button bsSize="small" onClick={this.handleDelete}>
              <Glyphicon glyph="trash" />
            </Button>
          </ButtonGroup>
        </div>
      )
    }
  }

  renderTitle() {
    if (!this.state.editing) return truncateTitle(this.props.line.title, 50)
    return (
      <FormGroup>
        <ControlLabel>{i18n('Plotline name')}</ControlLabel>
        <FormControl
          type="text"
          defaultValue={this.props.line.title}
          ref={(e) => (this.titleRef = e)}
          autoFocus
          onKeyDown={this.handleEsc}
          onBlur={this.handleBlur}
          onKeyPress={this.handleFinishEditingTitle}
        />
      </FormGroup>
    )
  }

  render() {
    if (this.state.editing) {
      window.SCROLLWITHKEYS = false
    }

    let innerKlass = cx(orientedClassName('line-title__body', this.props.ui.orientation), {
      hover: this.state.hovering,
      dropping: this.state.dropping,
    })

    let placement = 'bottom'
    if (this.props.ui.orientation == 'vertical') placement = 'right'
    return (
      <Cell>
        <div
          className={orientedClassName('line-title__cell', this.props.ui.orientation)}
          onMouseEnter={this.startHovering}
          onMouseLeave={this.stopHovering}
          onDrop={this.handleDrop}
        >
          {this.renderDelete()}
          <Floater
            component={this.renderHoverOptions}
            open={this.state.hovering}
            placement={placement}
            hideArrow
            offset={0}
          >
            <div
              className={innerKlass}
              onClick={this.startEditing}
              onDragStart={this.handleDragStart}
              onDragEnd={this.handleDragEnd}
              onDragEnter={this.handleDragEnter}
              onDragOver={this.handleDragOver}
              onDragLeave={this.handleDragLeave}
              draggable={true}
            >
              {this.renderTitle()}
            </div>
          </Floater>
        </div>
        {this.renderColorPicker()}
      </Cell>
    )
  }
}

LineTitleCell.propTypes = {
  line: PropTypes.object.isRequired,
  bookId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  actions: PropTypes.object.isRequired,
  ui: PropTypes.object.isRequired,
  lineIsExpanded: PropTypes.bool.isRequired,
  handleReorder: PropTypes.func,
}

function mapStateToProps(state, ownProps) {
  return {
    ui: state.present.ui,
    lineIsExpanded: lineIsExpandedSelector(state.present)[ownProps.line.id],
  }
}

function mapDispatchToProps(dispatch, ownProps) {
  let actions = ownProps.bookId == 'series' ? SeriesLineActions : LineActions
  return {
    actions: bindActionCreators(actions, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LineTitleCell)
