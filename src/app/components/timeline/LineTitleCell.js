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
import { ColorPicker } from 'connected-components'
import { DeleteConfirmModal, InputModal } from 'connected-components'
import { t } from 'plottr_locales'
import cx from 'classnames'
import { FaExpandAlt, FaCompressAlt } from 'react-icons/fa'
import Floater from 'react-floater'
import { actions, helpers, selectors } from 'pltr/v2'

const LineActions = actions.line
const uiActions = actions.ui

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
    this.titleInputRef = null
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
    const ref = this.titleInputRef
    if (!ref) return
    this.finalizeEdit(ref.value)
  }

  finalizeEdit = (newVal) => {
    var id = this.props.line.id
    this.props.actions.editLineTitle(id, newVal)
    this.setState({ editing: false, hovering: false })
  }

  handleFinishEditingTitle = (event) => {
    if (event.which === 13) {
      this.editTitle()
    }
  }

  handleBlur = () => {
    if (this.titleInputRef.value !== '') {
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

  toggleExpanded = () => {
    if (this.props.ui.timelineIsExpanded) {
      this.props.uiActions.collapseTimeline()
    } else {
      this.props.uiActions.expandTimeline()
    }
  }

  renderEditInput() {
    if (!this.state.editing) return null

    return (
      <InputModal
        isOpen={true}
        type="text"
        getValue={this.finalizeEdit}
        defaultValue={this.props.line.title}
        title={t('Edit {lineName}', { lineName: this.props.line.title || t('New Plotline') })}
        cancel={() => this.setState({ editing: false, hovering: false })}
      />
    )
  }

  renderDelete() {
    if (!this.state.deleting) return null

    return (
      <DeleteConfirmModal
        name={this.props.line.title || t('New Plotline')}
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
    const { lineIsExpanded, ui, isSmall } = this.props
    let expandedIcon = null
    let allIcon = null
    if (lineIsExpanded) {
      expandedIcon = <FaCompressAlt />
    } else {
      expandedIcon = <FaExpandAlt />
    }
    if (ui.timelineIsExpanded) {
      allIcon = <FaCompressAlt />
    } else {
      allIcon = <FaExpandAlt />
    }

    if (ui.orientation === 'vertical') {
      let klasses = orientedClassName('line-title__hover-options', ui.orientation)
      return (
        <div className={cx(klasses, { 'small-timeline': isSmall })}>
          <Button block bsSize="small" onClick={this.startEditing}>
            <Glyphicon glyph="edit" />
          </Button>
          <Button block bsSize="small" onClick={this.openColorPicker}>
            <Glyphicon glyph="tint" />
          </Button>
          {isSmall ? null : (
            <>
              <Button block bsSize="small" onClick={this.toggleLine}>
                {expandedIcon}
              </Button>
              <Button block bsSize="small" onClick={this.toggleExpanded}>
                {allIcon} {t('All')}
              </Button>
            </>
          )}
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
            {isSmall ? null : (
              <>
                <Button bsSize="small" onClick={this.toggleLine}>
                  {expandedIcon}
                </Button>
                <Button bsSize="small" onClick={this.toggleExpanded}>
                  {allIcon} {t('All')}
                </Button>
              </>
            )}
            <Button bsSize="small" onClick={this.handleDelete}>
              <Glyphicon glyph="trash" />
            </Button>
          </ButtonGroup>
        </div>
      )
    }
  }

  renderTitle() {
    const { ui } = this.props
    if (!this.state.editing) return truncateTitle(this.props.line.title, 50)
    return (
      <FormGroup>
        <ControlLabel className={cx({ darkmode: ui.darkMode })}>{t('Plotline name')}</ControlLabel>
        <FormControl
          type="text"
          defaultValue={this.props.line.title}
          inputRef={(ref) => {
            this.titleInputRef = ref
          }}
          autoFocus
          onKeyDown={this.handleEsc}
          onBlur={this.handleBlur}
          onKeyPress={this.handleFinishEditingTitle}
        />
      </FormGroup>
    )
  }

  renderSmall() {
    const { line, ui } = this.props
    const { hovering, inDropZone } = this.state
    const isHorizontal = ui.orientation == 'horizontal'
    const klasses = {
      'rotate-45': !isHorizontal,
      'row-header': isHorizontal,
      dropping: inDropZone,
    }
    let placement = 'right'
    if (ui.orientation == 'vertical') placement = 'bottom'
    return (
      <th
        className={cx(klasses)}
        onDragEnter={this.handleDragEnter}
        onDragOver={this.handleDragOver}
        onDragLeave={this.handleDragLeave}
        onDrop={this.handleDrop}
      >
        {this.renderColorPicker()}
        {this.renderDelete()}
        {this.renderEditInput()}
        <div
          draggable
          onDragStart={this.handleDragStart}
          onDragEnd={this.handleDragEnd}
          onClick={hovering ? this.stopHovering : this.startHovering}
        >
          <Floater
            component={this.renderHoverOptions}
            open={hovering}
            placement={placement}
            hideArrow
            offset={isHorizontal ? 0 : 1}
            styles={{ wrapper: { cursor: 'move' } }}
          >
            <span>{truncateTitle(line.title, 50)}</span>
          </Floater>
        </div>
      </th>
    )
  }

  render() {
    const { ui, isSmall, isMedium } = this.props
    const { editing, hovering, inDropZone } = this.state
    if (editing) {
      window.SCROLLWITHKEYS = false
    }

    if (isSmall) return this.renderSmall()

    let innerKlass = cx(orientedClassName('line-title__body', ui.orientation), {
      'medium-timeline': isMedium,
      hover: hovering,
      dropping: inDropZone,
    })
    let wrapperKlass = cx(orientedClassName('line-title__cell', ui.orientation), {
      'medium-timeline': isMedium,
    })

    let placement = 'bottom'
    if (ui.orientation == 'vertical') placement = 'right'
    return (
      <Cell>
        <div
          className={wrapperKlass}
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
            style={{ cursor: 'move' }}
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
  uiActions: PropTypes.object.isRequired,
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
  return {
    actions: bindActionCreators(LineActions, dispatch),
    uiActions: bindActionCreators(uiActions, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LineTitleCell)
