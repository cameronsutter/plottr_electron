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
import ColorPicker from '../colorpicker'
import DeleteConfirmModal from '../dialogs/DeleteConfirmModal'
import i18n from 'format-message'
import cx from 'classnames'
import { FaExpandAlt, FaCompressAlt } from 'react-icons/fa'
import Floater from 'react-floater'
import { actions, helpers, selectors } from 'pltr/v2'

const LineActions = actions.line
const SeriesLineActions = actions.seriesLine

const {
  card: { truncateTitle },
  orientedClassName: { orientedClassName },
} = helpers

const { lineIsExpandedSelector, isLargeSelector, isMediumSelector, isSmallSelector } = selectors

const CELL_WIDTH = 200

class LineTitleCell extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      hovering: false,
      editing: props.line.title === '',
      dragging: false,
      inDropZone: false,
      dropDepth: 0,
      showColorPicker: false,
      deleting: false,
    }
    this.hoverTimeout = null
    this.titleInputRef = React.createRef()
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
    const ref = this.titleInputRef.current
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
    if (this.titleInputRef.current.value !== '') {
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
    if (!this.state.dragging) this.setState({ dropDepth: this.state.dropDepth + 1 })
  }

  handleDragOver = (e) => {
    e.preventDefault()
    if (!this.state.dragging) this.setState({ inDropZone: true })
  }

  handleDragLeave = (e) => {
    if (!this.state.dragging) {
      let dropDepth = this.state.dropDepth
      --dropDepth
      this.setState({ dropDepth: dropDepth })
      if (dropDepth > 0) return
      this.setState({ inDropZone: false })
    }
  }

  handleDrop = (e) => {
    e.stopPropagation()
    this.setState({ inDropZone: false, dropDepth: 0 })

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
          inputRef={this.titleInputRef}
          autoFocus
          onKeyDown={this.handleEsc}
          onBlur={this.handleBlur}
          onKeyPress={this.handleFinishEditingTitle}
        />
      </FormGroup>
    )
  }

  render() {
    const { line, ui, isSmall } = this.props
    const { editing, hovering, inDropZone } = this.state
    if (editing) {
      window.SCROLLWITHKEYS = false
    }

    if (isSmall) {
      const isHorizontal = ui.orientation == 'horizontal'
      const klasses = {
        'rotate-45': !isHorizontal,
        'row-header': isHorizontal,
        dropping: inDropZone,
      }
      return (
        <th
          className={cx(klasses)}
          onDragEnter={this.handleDragEnter}
          onDragOver={this.handleDragOver}
          onDragLeave={this.handleDragLeave}
          onDrop={this.handleDrop}
        >
          <div draggable onDragStart={this.handleDragStart} onDragEnd={this.handleDragEnd}>
            <span>{truncateTitle(line.title, 50)}</span>
          </div>
        </th>
      )
    }

    let innerKlass = cx(orientedClassName('line-title__body', ui.orientation), {
      hover: hovering,
      dropping: inDropZone,
    })

    let placement = 'bottom'
    if (ui.orientation == 'vertical') placement = 'right'
    return (
      <Cell>
        <div
          className={orientedClassName('line-title__cell', ui.orientation)}
          onMouseEnter={this.startHovering}
          onMouseLeave={this.stopHovering}
          onDrop={this.handleDrop}
        >
          {this.renderDelete()}
          <Floater
            component={this.renderHoverOptions}
            open={hovering}
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
  handleReorder: PropTypes.func,
  ui: PropTypes.object.isRequired,
  isSmall: PropTypes.bool,
  isMedium: PropTypes.bool,
  isLarge: PropTypes.bool,
  lineIsExpanded: PropTypes.bool.isRequired,
  actions: PropTypes.object.isRequired,
}

function mapStateToProps(state, ownProps) {
  return {
    ui: state.present.ui,
    isSmall: isSmallSelector(state.present),
    isMedium: isMediumSelector(state.present),
    isLarge: isLargeSelector(state.present),
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
