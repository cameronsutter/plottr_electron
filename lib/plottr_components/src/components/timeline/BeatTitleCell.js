import React, { PureComponent } from 'react'
import PropTypes from 'react-proptypes'
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
import DeleteConfirmModal from '../dialogs/DeleteConfirmModal'
import InputModal from '../dialogs/InputModal'
import { helpers } from 'pltr/v2'
import VisualLine from './VisualLine'

const {
  card: { truncateTitle },
  beats: { editingBeatLabel, beatPositionTitle },
  orientedClassName: { orientedClassName },
  hierarchyLevels: { hierarchyToStyles },
} = helpers

const BeatTitleCellConnector = (connector) => {
  class BeatTitleCell extends PureComponent {
    constructor(props) {
      super(props)
      let editing = props.beat.title == ''
      this.state = {
        editing: editing,
        dragging: false,
        deleting: false,
        hovering: false,
      }
      this.titleInputRef = null
      this.cellRef = null
    }

    deleteBeat = (e) => {
      e.stopPropagation()
      this.props.actions.deleteBeat(this.props.beat.id, this.props.currentTimeline)
    }

    cancelDelete = (e) => {
      e.stopPropagation()
      this.setState({ deleting: false })
    }

    handleDelete = (e) => {
      e.stopPropagation()
      this.setState({ deleting: true })
    }

    handleAddBeat = (e) => {
      this.props.actions.insertBeat(this.props.currentTimeline, this.props.beat.id)
      if (this.props.tour.run === true) this.props.tourActions.tourNext('next')

      let SCENE_CELL_WIDTH = this.props.isMedium ? 90 : 175 + 17
      let SCENE_CELL_HEIGHT = this.props.isMedium ? 85 : 94 + 17

      this.props.actions.expandBeat(this.props.beat.id, this.props.currentTimeline)

      let children = this.props.beats.children[this.props.beat.id]
      let numChildren = children.length

      let expandedChildren = 0
      children.forEach((child) => {
        if (this.props.beats.children[child].length > 0 && this.props.beats.index[child].expanded) {
          expandedChildren += this.props.beats.children[child].length
        }
      })
      // Scroll based on how many children and grandChildren cards
      // there are between clicked card and newly added card
      const target =
        this.props.orientation === 'vertical'
          ? {
              ...this.props.timelineScrollPosition,
              y:
                this.props.timelineScrollPosition.y +
                (numChildren + expandedChildren) * SCENE_CELL_HEIGHT,
            }
          : {
              ...this.props.timelineScrollPosition,
              x:
                this.props.timelineScrollPosition.x +
                (numChildren + expandedChildren) * SCENE_CELL_WIDTH,
            }

      if (!this.props.tour.showTour) this.props.uiActions.recordScrollPosition(target)
    }

    handleAddChild = (e) => {
      let SCENE_CELL_WIDTH = this.props.isMedium ? 90 : 175 + 17
      let SCENE_CELL_HEIGHT = this.props.isMedium ? 85 : 94 + 17

      this.props.actions.expandBeat(this.props.beat.id, this.props.currentTimeline)
      this.props.actions.addBeat(this.props.currentTimeline, this.props.beat.id)
      if (this.props.tour.run === true) this.props.tourActions.tourNext('next')

      let children = this.props.beats.children[this.props.beat.id]
      let numChildren = children.length

      let expandedChildren = 0
      children.forEach((child) => {
        if (this.props.beats.children[child].length > 0 && this.props.beats.index[child].expanded) {
          expandedChildren += this.props.beats.children[child].length
        }
      })
      // Scroll based on how many children and grandChildren cards
      // there are between clicked card and newly added card
      const target =
        this.props.orientation === 'vertical'
          ? {
              ...this.props.timelineScrollPosition,
              y:
                this.props.timelineScrollPosition.y +
                (numChildren + expandedChildren) * SCENE_CELL_HEIGHT,
            }
          : {
              ...this.props.timelineScrollPosition,
              x:
                this.props.timelineScrollPosition.x +
                (numChildren + expandedChildren) * SCENE_CELL_WIDTH,
            }

      this.props.uiActions.recordScrollPosition(target)
    }

    handleToggleExpanded = (e) => {
      const {
        actions: { collapseBeat, expandBeat },
        beat: { id, expanded },
        currentTimeline,
        tour,
      } = this.props

      if (expanded === true && tour.run === true) this.props.tourActions.tourNext('next')

      if (expanded) collapseBeat(id, currentTimeline)
      else expandBeat(id, currentTimeline)
    }

    editTitle = () => {
      const ref = this.titleInputRef
      if (!ref) return

      this.finalizeEdit(ref.value)
    }

    finalizeEdit = (newVal) => {
      const { beat, actions, currentTimeline } = this.props
      actions.editBeatTitle(beat.id, currentTimeline, newVal || 'auto') // if nothing, set to auto
      this.setState({ editing: false })
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
      this.props.uiActions.pickUpBeat(this.props.beatId)
      this.setState({ dragging: true })
    }

    handleDragEnd = () => {
      this.setState({ dragging: false }, () => {
        this.props.uiActions.draggingOverBeat(null)
      })
    }

    handleDragOver = (e) => {
      e.stopPropagation()
      e.preventDefault()
      if (!this.state.dragging && !this.props.inDropZone) {
        this.props.uiActions.draggingOverBeat(this.props.beatId)
      }
    }

    handleDrop = (e) => {
      e.stopPropagation()

      var json = e.dataTransfer.getData('text/json')
      var droppedBeat = JSON.parse(json)
      if (droppedBeat.id == null) return
      if (droppedBeat.id == this.props.beat.id) return

      if (!this.props.beat.expanded)
        this.props.actions.expandBeat(this.props.beat.id, this.props.currentTimeline)
      this.props.handleReorder(this.props.beat.id, droppedBeat.id)
    }

    startEditing = () => {
      this.setState({ editing: true })
    }

    startHovering = () => {
      this.setState(
        {
          hovering: true,
        },
        () => {
          this.props.uiActions.hoverOverBeat(this.props.beatId)
        }
      )
    }

    stopHovering = () => {
      this.setState(
        {
          hovering: false,
        },
        () => {
          this.props.uiActions.hoverOverBeat(null)
        }
      )
    }

    renderDelete() {
      if (!this.state.deleting) return null

      const { hierarchyLevel, beatTitle, hierarchyLevels } = this.props

      const depth =
        hierarchyLevels.length -
        hierarchyLevels.findIndex(({ name }) => name === hierarchyLevel.name)

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
          cancel={() => this.setState({ editing: false })}
        />
      )
    }

    renderHorizontalHoverOptions(style) {
      const {
        orientation,
        isMedium,
        isSmall,
        beat,
        hierarchyLevel,
        hierarchyLevels,
        tour,
      } = this.props
      const klasses = orientedClassName('beat-list__item__hover-options', orientation)
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
              <Button
                bsSize={isSmall ? 'small' : undefined}
                className={tour.run ? 'acts-tour-step7' : ''}
                onClick={this.handleToggleExpanded}
              >
                {beat.expanded ? <FaCompressAlt /> : <FaExpandAlt />}
              </Button>
            ) : null}
          </ButtonGroup>
        </div>
      )
    }

    renderLowerHoverOptions(style) {
      const {
        orientation,
        isMedium,
        isSmall,
        isFirst,
        hierarchyLevel,
        hierarchyLevels,
        tour,
      } = this.props
      const klasses = orientedClassName('medium-lower-hover-options', orientation)

      style = { visibility: 'hidden' }
      const { hovering } = this.state
      if (hovering) style.visibility = 'visible'
      const isHigherLevel = hierarchyLevels.length - hierarchyLevel.level > 1
      if (orientation === 'horizontal' && !isHigherLevel) style.marginTop = '-14px'

      let button1 = (
        <Button
          className={!isFirst && tour.run ? 'acts-tour-step6' : null}
          bsSize={isSmall ? 'small' : undefined}
          block
          onClick={this.handleAddBeat}
          style={isMedium ? (isHigherLevel ? { marginTop: '0px' } : { marginTop: '19px' }) : null}
        >
          <Glyphicon glyph="plus" />
        </Button>
      )

      let button2 = hierarchyLevels.length - hierarchyLevel.level > 1 && (
        <Button
          className={'acts-tour-step8'}
          bsSize={isSmall ? 'small' : undefined}
          block
          style={{ marginTop: '0px' }}
          onClick={this.handleAddChild}
        >
          <IoIosReturnRight size={25} style={{ margin: '-1px -5px -6px -5px' }} />
        </Button>
      )

      let extraHoverButtons
      if (orientation === 'vertical') {
        extraHoverButtons = (
          <div className={cx(klasses, { 'small-timeline': isSmall })} style={style}>
            {button1}
            {button2}
          </div>
        )
      } else {
        extraHoverButtons = (
          <ButtonGroup className={cx(klasses, { 'small-timeline': isSmall })} style={style}>
            {button1}
            {button2}
          </ButtonGroup>
        )
      }

      return extraHoverButtons
    }

    renderVerticalHoverOptions(style) {
      const {
        orientation,
        isSmall,
        isMedium,
        beat,
        hierarchyLevel,
        hierarchyLevels,
        tour,
      } = this.props
      const klasses = orientedClassName('beat-list__item__hover-options', orientation)
      const showExpandCollapse = hierarchyLevels.length - hierarchyLevel.level > 1
      return (
        <div className={cx(klasses, { 'small-timeline': isSmall })} style={style}>
          <Button
            bsSize={isSmall ? 'small' : undefined}
            block
            onClick={this.startEditing}
            style={
              isMedium
                ? showExpandCollapse
                  ? { marginTop: '0px' }
                  : { marginTop: '19px' }
                : showExpandCollapse
                ? { marginTop: '5px' }
                : { marginTop: '24px' }
            }
          >
            <Glyphicon glyph="edit" />
          </Button>
          <Button bsSize={isSmall ? 'small' : undefined} block onClick={this.handleDelete}>
            <Glyphicon glyph="trash" />
          </Button>
          {showExpandCollapse && (
            <Button
              bsSize={isSmall ? 'small' : undefined}
              className={tour.run ? 'acts-tour-step7' : ''}
              onClick={this.handleToggleExpanded}
            >
              {beat.expanded ? <FaCompressAlt /> : <FaExpandAlt />}
            </Button>
          )}
        </div>
      )
    }

    renderHoverOptions() {
      let style = {}
      const { hovering } = this.state
      if (this.props.isSmall) {
        style = { display: 'none' }
        if (hovering) style.display = 'block'
      } else {
        style = { visibility: 'hidden' }
        if (hovering) style.visibility = 'visible'
      }

      if (this.props.orientation === 'vertical') {
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
        beatIndex,
      } = this.props
      if (!this.state.editing) return <span>{truncateTitle(beatTitle, 50)}</span>

      return (
        <FormGroup>
          <ControlLabel>
            {editingBeatLabel(
              beatIndex,
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
        beatIndex,
        hierarchyLevels,
        hierarchyLevel,
        beat,
        orientation,
        positionOffset,
        beatTitle,
        isSmall,
        isMedium,
        hierarchyEnabled,
        isSeries,
        inDropZone,
      } = this.props
      const { hovering } = this.state
      const innerKlass = cx(orientedClassName('beat__body', orientation), {
        'medium-timeline': isMedium,
        hover: hovering,
        dropping: inDropZone,
      })
      const beatKlass = cx(orientedClassName('beat__cell', orientation), {
        'medium-timeline': isMedium,
      })
      const isHorizontal = orientation == 'horizontal'

      if (isSmall) {
        const klasses = {
          'rotate-45': isHorizontal,
          'row-header': !isHorizontal,
          dropping: inDropZone,
        }
        return (
          <th className={cx(klasses)} onDragOver={this.handleDragOver} onDrop={this.handleDrop}>
            {this.renderHoverOptions()}
            {this.renderDelete()}
            {this.renderEditInput()}
            <div
              title={beatPositionTitle(
                beatIndex,
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
              ref={(ref) => {
                this.cellRef = ref
              }}
              title={beatPositionTitle(
                beatIndex,
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
                  this.props.timelineSize,
                  hovering || this.props.inDropZone,
                  this.props.darkMode === true
                    ? this.props.hierarchyLevel.dark
                    : this.props.hierarchyLevel.light,
                  this.props.darkMode
                )}
                className={innerKlass}
                onClick={this.startEditing}
                draggable
                onDragStart={this.handleDragStart}
                onDragEnd={this.handleDragEnd}
                onDragOver={this.handleDragOver}
              >
                {this.renderTitle()}
              </div>
              {isMedium && this.renderLowerHoverOptions()}
              {this.cellRef && this.props.showInsertGuide && (
                <VisualLine
                  disableAnimation
                  tableLength={this.props.tableHeight}
                  orientation={this.props.orientation === 'vertical' ? 'horizontal' : 'vertical'}
                  color={hierarchyLevel.borderColor}
                  isMedium={isMedium}
                  offset={this.cellRef.getBoundingClientRect().width / 2}
                />
              )}
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
    beatIndex: PropTypes.number.isRequired,
    hierarchyLevels: PropTypes.array.isRequired,
    beat: PropTypes.object.isRequired,
    uiActions: PropTypes.object.isRequired,
    isFirst: PropTypes.bool,
    inDropZone: PropTypes.bool,
    hierarchyLevel: PropTypes.object.isRequired,
    showInsertGuide: PropTypes.bool.isRequired,
    currentTimeline: PropTypes.number.isRequired,
    timelineScrollPosition: PropTypes.object.isRequired,
    orientation: PropTypes.string.isRequired,
    darkMode: PropTypes.bool.isRequired,
    timelineSize: PropTypes.string.isRequired,
    beatTitle: PropTypes.string.isRequired,
    positionOffset: PropTypes.number.isRequired,
    isSmall: PropTypes.bool.isRequired,
    isMedium: PropTypes.bool.isRequired,
    hierarchyEnabled: PropTypes.bool.isRequired,
    isSeries: PropTypes.bool.isRequired,
    tour: PropTypes.object.isRequired,
    tourActions: PropTypes.object.isRequired,
    tableHeight: PropTypes.number.isRequired,
  }

  const {
    redux,
    pltr: { selectors, actions },
  } = connector

  if (redux) {
    const { connect, bindActionCreators } = redux

    const makeMapState = (state) => {
      const uniqueBeatsSelector = selectors.makeBeatSelector()
      const uniqueBeatTitleSelector = selectors.makeBeatTitleSelector()

      return function mapStateToProps(state, ownProps) {
        return {
          beats: selectors.beatsByBookSelector(state.present),
          beatIndex: selectors.beatIndexSelector(state.present, ownProps.beatId),
          hierarchyLevels: selectors.sortedHierarchyLevels(state.present),
          beat: uniqueBeatsSelector(state.present, ownProps.beatId),
          showInsertGuide: selectors.showInsertGuideSelector(state.present, ownProps.beatId),
          hierarchyLevel: selectors.hierarchyLevelSelector(state.present, ownProps.beatId),
          inDropZone: selectors.beatIsDraggedOverSelector(state.present, ownProps.beatId),
          currentTimeline: selectors.currentTimelineSelector(state.present),
          orientation: selectors.orientationSelector(state.present),
          darkMode: selectors.darkModeSelector(state.present),
          timelineScrollPosition: selectors.timelineScrollPositionSelector(state.present),
          timelineSize: selectors.timelineSizeSelector(state.present),
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

    const mapDispatchToProps = (dispatch) => {
      return {
        actions: bindActionCreators(actions.beat, dispatch),
        tourActions: bindActionCreators(actions.tour, dispatch),
        uiActions: bindActionCreators(actions.ui, dispatch),
      }
    }

    return connect(makeMapState, mapDispatchToProps)(BeatTitleCell)
  }

  throw new Error('Could not connect BeatTtileCell')
}

export default BeatTitleCellConnector
