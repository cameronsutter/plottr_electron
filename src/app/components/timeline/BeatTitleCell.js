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
import { FaExpandAlt, FaCompressAlt } from 'react-icons/fa'
import { IoIosReturnRight } from 'react-icons/io'
import { Cell } from 'react-sticky-table'
import cx from 'classnames'
import { DeleteConfirmModal, InputModal } from 'connected-components'
import { actions, helpers, selectors } from 'pltr/v2'

const {
  card: { truncateTitle },
  beats: { editingBeatLabel, beatPositionTitle },
  orientedClassName: { orientedClassName },
  hierarchyLevels: { hierarchyToStyles },
} = helpers

class BeatTitleCell extends PureComponent {
  constructor(props) {
    super(props)
    let editing = props.beat.title == ''
    this.state = {
      hovering: this.props.hovering,
      editing: editing,
      dragging: false,
      inDropZone: false,
      dropDepth: 0,
      deleting: false,
    }
    this.titleInputRef = null
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

  handleAddBeat = (e) => {
    this.props.actions.insertBeat(this.props.ui.currentTimeline, this.props.beat.id)
  }

  handleAddChild = (e) => {
    this.props.actions.addBeat(this.props.ui.currentTimeline, this.props.beat.id)
  }

  handleToggleExpanded = (e) => {
    const {
      actions: { collapseBeat, expandBeat },
      beat: { id, expanded },
      ui: { currentTimeline },
      tour
    } = this.props

    if(expanded === true && tour.run === true) this.props.tourActions.tourNext('next')

    if (expanded) collapseBeat(id, currentTimeline)
    else expandBeat(id, currentTimeline)
  }

  editTitle = () => {
    const ref = this.titleInputRef
    if (!ref) return

    this.finalizeEdit(ref.value)
  }

  finalizeEdit = (newVal) => {
    const { beat, actions, ui } = this.props
    actions.editBeatTitle(beat.id, ui.currentTimeline, newVal || 'auto') // if nothing, set to auto
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
    this.setState({ inDropZone: false, dropDepth: 0 })

    var json = e.dataTransfer.getData('text/json')
    var droppedBeat = JSON.parse(json)
    if (droppedBeat.id == null) return
    if (droppedBeat.id == this.props.beat.id) return

    this.props.handleReorder(this.props.beat.id, droppedBeat.id)
  }

  startEditing = () => {
    this.setState({ editing: true, hovering: false })
  }

  startHovering = () => {
    this.props.onMouseEnter()
    this.setState({ hovering: this.props.onMouseEnter() })
  }

  stopHovering = () => {
    this.props.onMouseLeave()
    this.setState({ hovering: false })
  }

  renderDelete() {
    if (!this.state.deleting) return null

    const { hierarchyLevel, beatTitle, hierarchyLevels } = this.props

    const depth =
      hierarchyLevels.length - hierarchyLevels.findIndex(({ name }) => name === hierarchyLevel.name)

    let warningMessage = null
    switch (depth) {
      case 1:
        break
      case 2:
        warningMessage = `Are you sure you want to delete all scene cards in "${beatTitle}".`
        break
      case 3:
        warningMessage = `Are you sure you want to delete all chapters and their scene cards in "${beatTitle}".`
        break
    }
    return (
      <DeleteConfirmModal
        name={beatTitle}
        customText={warningMessage && i18n(warningMessage)}
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
    const { ui, isMedium, isSmall, beat, hierarchyLevel, hierarchyLevels, tour } = this.props
    const klasses = orientedClassName('beat-list__item__hover-options', ui.orientation)
    const showExpandCollapse = hierarchyLevels.length - hierarchyLevel.level > 1
    return (
      <div className={cx(klasses, { 'small-timeline': isSmall })} style={style}>
        <ButtonGroup>
          {isMedium ? null : (
            <Button bsSize={isSmall ? 'small' : undefined} onClick={this.startEditing}>
              <Glyphicon glyph="edit" />
            </Button>
          )}
          <Button bsSize={isSmall ? 'small' : undefined} onClick={this.handleDelete}>
            <Glyphicon glyph="trash" />
          </Button>
          {showExpandCollapse ? (
            <Button bsSize={isSmall ? 'small' : undefined} className={tour.run ? 'acts-tour-step7' : ''} onClick={this.handleToggleExpanded}>
              {beat.expanded ? <FaCompressAlt /> : <FaExpandAlt />}
            </Button>
          ) : null}
        </ButtonGroup>
      </div>
    )
  }

  renderLowerHoverOptions(style) {
    
    const { ui, isMedium, isSmall, isFirst, beat, hierarchyLevel, hierarchyLevels, tour } = this.props
    const klasses = orientedClassName('medium-lower-hover-options', ui.orientation)
    
    style = { visibility: 'hidden' }
    if (this.state.hovering) style.visibility = 'visible'
    const isHigherLevel = hierarchyLevels.length - hierarchyLevel.level > 1
    if (this.props.ui.orientation === 'horizontal' && !isHigherLevel) style.marginTop = '-14px'


    let button1 = <Button className={!isFirst ? 'acts-tour-step6' : null} bsSize={isSmall ? 'small' : undefined} block onClick={this.handleAddBeat} style={isMedium ? isHigherLevel ? {marginTop:'0px'} : {marginTop:'19px'} : null }>
                    <Glyphicon glyph="plus" />
                  </Button>

    let button2 = hierarchyLevels.length - hierarchyLevel.level > 1 && <Button className={'acts-tour-step8'} bsSize={isSmall ? 'small' : undefined} block style={{marginTop:'0px'}} onClick={this.handleAddChild}>
                    <IoIosReturnRight size={25} style={{margin:'-1px -5px -6px -5px'}} />
                  </Button>

    let extraHoverButtons
    if(ui.orientation === 'vertical' ) {
      extraHoverButtons = <div className={cx(klasses, { 'small-timeline': isSmall })} style={style}>{button1}{button2}</div>
    } else {
      extraHoverButtons = <ButtonGroup className={cx(klasses, { 'small-timeline': isSmall })} style={style}>{button1}{button2}</ButtonGroup>
    }

    return (
      extraHoverButtons
    )
  }

  renderVerticalHoverOptions(style) {
    const { ui, isSmall, isMedium, beat, hierarchyLevel, hierarchyLevels, tour } = this.props
    const klasses = orientedClassName('beat-list__item__hover-options', ui.orientation)
    const showExpandCollapse = hierarchyLevels.length - hierarchyLevel.level > 1
    return (
      <div className={cx(klasses, { 'small-timeline': isSmall })} style={style}>
        <Button bsSize={isSmall ? 'small' : undefined} block onClick={this.startEditing} style={isMedium ? showExpandCollapse ? {marginTop:'0px'} : {marginTop:'19px'} : showExpandCollapse ? {marginTop:'5px'} : {marginTop:'24px'} }>
          <Glyphicon glyph="edit" />
        </Button>
        <Button bsSize={isSmall ? 'small' : undefined} block onClick={this.handleDelete}>
          <Glyphicon glyph="trash" />
        </Button>
        {showExpandCollapse && (
          <Button bsSize={isSmall ? 'small' : undefined} className={tour.run ? 'acts-tour-step7' : ''} onClick={this.handleToggleExpanded}>
            {beat.expanded ? <FaCompressAlt /> : <FaExpandAlt />}
          </Button>
        )}
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
    const {
      beats,
      beat,
      beatTitle,
      hierarchyLevels,
      positionOffset,
      hierarchyEnabled,
      isSeries,
    } = this.props
    if (!this.state.editing) return <span>{truncateTitle(beatTitle, 50)}</span>

    return (
      <FormGroup>
        <ControlLabel>
          {editingBeatLabel(
            beats,
            beat,
            hierarchyLevels,
            positionOffset,
            hierarchyEnabled,
            isSeries
          )}
        </ControlLabel>
        <FormControl
          type="text"
          defaultValue={beat.title}
          inputRef={(ref) => {
            this.titleInputRef = ref
          }}
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
    const {
      beats,
      hierarchyLevels,
      beat,
      ui,
      positionOffset,
      beatTitle,
      isSmall,
      isMedium,
      hierarchyEnabled,
      isSeries,
    } = this.props
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
            title={beatPositionTitle(
              beats,
              beat,
              hierarchyLevels,
              positionOffset,
              hierarchyEnabled,
              isSeries
            )}
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
            title={beatPositionTitle(
              beats,
              beat,
              hierarchyLevels,
              positionOffset,
              hierarchyEnabled,
              isSeries
            )}
            onMouseEnter={this.startHovering}
            onMouseLeave={this.stopHovering}
            onDrop={this.handleDrop}
          >
            {this.renderHoverOptions()}
            {this.renderDelete()}
            <div
              style={hierarchyToStyles(
                this.props.hierarchyLevel,
                ui.timeline.size,
                this.state.hovering || this.state.inDropZone
              )}
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
            {isMedium && this.renderLowerHoverOptions()}
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
  beats: PropTypes.object.isRequired,
  hierarchyLevels: PropTypes.array.isRequired,
  beat: PropTypes.object.isRequired,
  hierarchyLevel: PropTypes.object.isRequired,
  ui: PropTypes.object.isRequired,
  beatTitle: PropTypes.string.isRequired,
  positionOffset: PropTypes.number.isRequired,
  isSmall: PropTypes.bool.isRequired,
  isMedium: PropTypes.bool.isRequired,
  hierarchyEnabled: PropTypes.bool.isRequired,
  isSeries: PropTypes.bool.isRequired,
  tour: PropTypes.object.isRequired,
  tourActions: PropTypes.object.isRequired,
}

const makeMapState = (state) => {
  const uniqueBeatsSelector = selectors.makeBeatSelector()
  const uniqueBeatTitleSelector = selectors.makeBeatTitleSelector()

  return function mapStateToProps(state, ownProps) {
    return {
      beats: selectors.beatsByBookSelector(state.present),
      hierarchyLevels: selectors.sortedHierarchyLevels(state.present),
      beat: uniqueBeatsSelector(state.present, ownProps.beatId),
      hierarchyLevel: selectors.hierarchyLevelSelector(state.present, ownProps.beatId),
      ui: state.present.ui,
      beatTitle: uniqueBeatTitleSelector(state.present, ownProps.beatId),
      positionOffset: selectors.positionOffsetSelector(state.present),
      isSmall: selectors.isSmallSelector(state.present),
      isMedium: selectors.isMediumSelector(state.present),
      hierarchyEnabled: selectors.beatHierarchyIsOn(state.present),
      isSeries: selectors.isSeriesSelector(state.present),
      tour: selectors.tourSelector(state.present),
    }
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(actions.beat, dispatch),
    tourActions: bindActionCreators(actions.tour, dispatch),
  }
}

export default connect(makeMapState, mapDispatchToProps)(BeatTitleCell)
