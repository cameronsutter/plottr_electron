import React, { PureComponent } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { t as i18n } from 'plottr_locales'
import {
  Glyphicon,
  Button,
  ButtonGroup,
  FormControl,
  FormGroup,
  ControlLabel,
} from 'react-bootstrap'
import { Cell } from 'react-sticky-table'
import cx from 'classnames'
import { DeleteConfirmModal } from 'plottr_components'
import { actions, helpers, selectors } from 'pltr/v2'
import InputModal from '../dialogs/InputModal'

const {
  card: { truncateTitle },
  beats: { editingBeatLabel, beatPositionTitle },
  orientedClassName: { orientedClassName },
} = helpers

class BeatTitleCell extends PureComponent {
  constructor(props) {
    super(props)
    let editing = props.beat.title == ''
    this.state = {
      hovering: false,
      editing: editing,
      dragging: false,
      inDropZone: false,
      dropDepth: 0,
      deleting: false,
    }
    this.titleInputRef = React.createRef()
  }

  deleteBeat = (e) => {
    e.stopPropagation()
    this.props.actions.deleteBeat(this.props.beat.id, this.props.ui.currentTimeline)
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
    const ref = this.titleInputRef.current
    if (!ref) return

    this.finalizeEdit(ref.value)
  }

  finalizeEdit = (newVal) => {
    const { beat, actions } = this.props
    actions.editBeatTitle(beat.id, newVal || 'auto') // if nothing, set to auto
    this.setState({ editing: false, hovering: false })
  }

  handleFinishEditing = (event) => {
    if (event.which === 13) {
      this.editTitle()
    }
  }

  handleBlur = () => {
    this.editTitle()
  }

  handleEsc = (event) => {
    if (event.which === 27) this.setState({ editing: false })
  }

  handleDragStart = (e) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/json', JSON.stringify(this.props.beat))
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
    if (this.state.dragging) return
    this.setState({ inDropZone: false, dropDepth: 0 })

    var json = e.dataTransfer.getData('text/json')
    var droppedBeat = JSON.parse(json)
    if (droppedBeat.id == null) return
    if (droppedBeat.id == this.props.beat.id) return

    this.props.handleReorder(this.props.beat.position, droppedBeat.position)
  }

  startEditing = () => {
    this.setState({ editing: true, hovering: false })
  }

  startHovering = () => {
    this.setState({ hovering: true })
  }

  stopHovering = () => {
    this.setState({ hovering: false })
  }

  renderDelete() {
    if (!this.state.deleting) return null

    return (
      <DeleteConfirmModal
        name={this.props.beatTitle}
        onDelete={this.deleteBeat}
        onCancel={this.cancelDelete}
      />
    )
  }

  renderEditInput() {
    if (!this.state.editing) return null

    return (
      <InputModal
        isOpen={true}
        type="text"
        getValue={this.finalizeEdit}
        defaultValue={this.props.beat.title}
        title={i18n('Edit {beatName}', { beatName: this.props.beatTitle })}
        cancel={() => this.setState({ editing: false, hovering: false })}
      />
    )
  }

  renderHorizontalHoverOptions(style) {
    const { ui, isSmall } = this.props
    const klasses = orientedClassName('beat-list__item__hover-options', ui.orientation)
    return (
      <div className={cx(klasses, { 'small-timeline': isSmall })} style={style}>
        <ButtonGroup>
          <Button bsSize={isSmall ? 'small' : undefined} onClick={this.startEditing}>
            <Glyphicon glyph="edit" />
          </Button>
          <Button bsSize={isSmall ? 'small' : undefined} onClick={this.handleDelete}>
            <Glyphicon glyph="trash" />
          </Button>
        </ButtonGroup>
      </div>
    )
  }

  renderVerticalHoverOptions(style) {
    const { ui, isSmall } = this.props
    const klasses = orientedClassName('beat-list__item__hover-options', ui.orientation)
    return (
      <div className={cx(klasses, { 'small-timeline': isSmall })} style={style}>
        <Button bsSize={isSmall ? 'small' : undefined} block onClick={this.startEditing}>
          <Glyphicon glyph="edit" />
        </Button>
        <Button bsSize={isSmall ? 'small' : undefined} block onClick={this.handleDelete}>
          <Glyphicon glyph="trash" />
        </Button>
      </div>
    )
  }

  renderHoverOptions() {
    let style = {}
    if (this.props.isSmall) {
      style = { display: 'none' }
      if (this.state.hovering) style.display = 'block'
    } else {
      style = { visibility: 'hidden' }
      if (this.state.hovering) style.visibility = 'visible'
    }

    if (this.props.ui.orientation === 'vertical') {
      return this.renderVerticalHoverOptions(style)
    } else {
      return this.renderHorizontalHoverOptions(style)
    }
  }

  renderTitle() {
    const { beat, beatTitle, positionOffset, isSeries } = this.props
    if (!this.state.editing) return <span>{truncateTitle(beatTitle, 50)}</span>

    return (
      <FormGroup>
        <ControlLabel>{editingBeatLabel(beat, positionOffset, isSeries)}</ControlLabel>
        <FormControl
          type="text"
          defaultValue={beat.title}
          inputRef={this.titleInputRef}
          autoFocus
          onKeyDown={this.handleEsc}
          onBlur={this.handleBlur}
          onKeyPress={this.handleFinishEditing}
        />
      </FormGroup>
    )
  }

  render() {
    window.SCROLLWITHKEYS = !this.state.editing
    const { beat, ui, positionOffset, beatTitle, isSeries, isSmall, isMedium } = this.props
    const { hovering, inDropZone } = this.state
    const innerKlass = cx(orientedClassName('beat__body', ui.orientation), {
      'medium-timeline': isMedium,
      hover: hovering,
      dropping: inDropZone,
    })
    const beatKlass = cx(orientedClassName('beat__cell', ui.orientation), {
      'medium-timeline': isMedium,
    })

    if (isSmall) {
      const isHorizontal = ui.orientation == 'horizontal'
      const klasses = {
        'rotate-45': isHorizontal,
        'row-header': !isHorizontal,
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
          {this.renderHoverOptions()}
          {this.renderDelete()}
          {this.renderEditInput()}
          <div
            title={beatPositionTitle(beat, positionOffset, isSeries)}
            onClick={hovering ? this.stopHovering : this.startHovering}
            draggable
            onDragStart={this.handleDragStart}
            onDragEnd={this.handleDragEnd}
          >
            <span>{truncateTitle(beatTitle, 50)}</span>
          </div>
        </th>
      )
    } else {
      return (
        <Cell className="beat-table-cell">
          <div
            className={beatKlass}
            title={beatPositionTitle(beat, positionOffset, isSeries)}
            onMouseEnter={this.startHovering}
            onMouseLeave={this.stopHovering}
            onDrop={this.handleDrop}
          >
            {this.renderHoverOptions()}
            {this.renderDelete()}
            <div
              className={innerKlass}
              onClick={this.startEditing}
              draggable
              onDragStart={this.handleDragStart}
              onDragEnd={this.handleDragEnd}
              onDragEnter={this.handleDragEnter}
              onDragOver={this.handleDragOver}
              onDragLeave={this.handleDragLeave}
            >
              {this.renderTitle()}
            </div>
          </div>
        </Cell>
      )
    }
  }
}

BeatTitleCell.propTypes = {
  beatId: PropTypes.number.isRequired,
  handleReorder: PropTypes.func.isRequired,
  actions: PropTypes.object.isRequired,
  beats: PropTypes.array.isRequired,
  beat: PropTypes.object.isRequired,
  ui: PropTypes.object.isRequired,
  isSeries: PropTypes.bool,
  beatTitle: PropTypes.string.isRequired,
  positionOffset: PropTypes.number.isRequired,
  isSmall: PropTypes.bool.isRequired,
  isMedium: PropTypes.bool.isRequired,
}

const makeMapState = (state) => {
  const uniqueBeatsSelector = selectors.makeBeatSelector()
  const uniqueBeatTitleSelector = selectors.makeBeatTitleSelector()

  return function mapStateToProps(state, ownProps) {
    return {
      beats: state.present.beats,
      beat: uniqueBeatsSelector(state.present, ownProps.beatId),
      ui: state.present.ui,
      isSeries: selectors.isSeriesSelector(state.present),
      beatTitle: uniqueBeatTitleSelector(state.present, ownProps.beatId),
      positionOffset: selectors.positionOffsetSelector(state.present),
      isSmall: selectors.isSmallSelector(state.present),
      isMedium: selectors.isMediumSelector(state.present),
    }
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(actions.beat, dispatch),
  }
}

export default connect(makeMapState, mapDispatchToProps)(BeatTitleCell)
