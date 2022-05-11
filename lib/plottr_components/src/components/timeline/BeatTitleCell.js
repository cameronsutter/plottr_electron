import React, { PureComponent } from 'react'
import PropTypes from 'react-proptypes'
import { t } from 'plottr_locales'
import { Glyphicon, ButtonGroup, FormControl, FormGroup, ControlLabel } from 'react-bootstrap'
import { FaExpandAlt, FaCompressAlt } from 'react-icons/fa'
import { IoIosReturnRight } from 'react-icons/io'
import { Cell } from 'react-sticky-table'
import cx from 'classnames'

import { helpers } from 'pltr/v2'

import Button from '../Button'
import DeleteConfirmModal from '../dialogs/DeleteConfirmModal'
import InputModal from '../dialogs/InputModal'
import { checkDependencies } from '../checkDependencies'

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
        hovering: this.props.hovering,
        editing: editing,
        dragging: false,
        inDropZone: false,
        dropDepth: 0,
        deleting: false,
      }
      this.titleInputRef = null
    }

    componentDidUpdate(_prevProps, _prevState) {
      if (this.state.editing && this.titleInputRef) {
        this.titleInputRef.select()
      }
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
      if (this.props.readOnly) return
      this.setState({ deleting: true, hovering: null })
    }

    handleAddBeat = (e) => {
      if (this.props.readOnly) return
      this.props.actions.insertBeat(this.props.currentTimeline, this.props.beat.id)
      if (this.props.tour.run === true) this.props.tourActions.tourNext('next')
      this.props.actions.expandBeat(this.props.beat.id, this.props.currentTimeline)
    }

    handleAddChild = (e) => {
      if (this.props.readOnly) return
      this.props.actions.expandBeat(this.props.beat.id, this.props.currentTimeline)
      this.props.actions.addBeat(this.props.currentTimeline, this.props.beat.id)
      if (this.props.tour.run === true) this.props.tourActions.tourNext('next')
    }

    handleToggleExpanded = (e) => {
      const {
        actions: { collapseBeat, expandBeat },
        beat: { id, expanded },
        currentTimeline,
        tour,
        readOnly,
      } = this.props

      if (readOnly) return

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
      this.setState({ editing: false, hovering: null })
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

      if (!this.props.beat.expanded)
        this.props.actions.expandBeat(this.props.beat.id, this.props.currentTimeline)
      this.props.handleReorder(this.props.beat.id, droppedBeat.id)
    }

    startEditing = () => {
      if (this.props.readOnly) return
      this.setState({ editing: true, hovering: null })
    }

    startHovering = () => {
      if (this.props.readOnly) return
      this.props.onMouseEnter()
      this.setState({ hovering: this.props.onMouseEnter() })
    }

    stopHovering = () => {
      if (this.props.readOnly) return
      this.props.onMouseLeave()
      this.setState({ hovering: null })
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
          customText={warningMessage && t(warningMessage)}
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
          defaultValue={t(this.props.beat.title)}
          title={t('Edit {beatName}', { beatName: t(this.props.beatTitle) })}
          cancel={() => this.setState({ editing: false, hovering: null })}
        />
      )
    }

    renderHorizontalHoverOptions(style) {
      const {
        beatIndex,
        beats,
        positionOffset,
        hierarchyEnabled,
        isSeries,
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
      const beatTitle = beatPositionTitle(
        beatIndex,
        beats,
        beat,
        hierarchyLevels,
        positionOffset,
        hierarchyEnabled,
        isSeries
      )
      return (
        <div className={cx(klasses, { 'small-timeline': isSmall })} style={style}>
          <ButtonGroup>
            {isMedium ? null : (
              <Button
                title={`Edit ${beatTitle}`}
                bsSize={isSmall ? 'small' : undefined}
                onClick={this.startEditing}
              >
                <Glyphicon glyph="edit" />
              </Button>
            )}
            <Button
              title={`Delete ${beatTitle}`}
              bsSize={isSmall ? 'small' : undefined}
              onClick={this.handleDelete}
            >
              <Glyphicon glyph="trash" />
            </Button>
            {showExpandCollapse ? (
              <Button
                title={`Expand/Collapse ${beatTitle}`}
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
        isMedium,
        isSmall,
        isFirst,
        beatId,
        hierarchyLevel,
        hierarchyLevels,
        tour,
        orientation,
      } = this.props
      const klasses = orientedClassName('medium-lower-hover-options', orientation)

      style = { visibility: 'hidden' }
      if (this.state.hovering === beatId) style.visibility = 'visible'
      const isHigherLevel = hierarchyLevels.length - hierarchyLevel.level > 1
      if (this.props.orientation === 'horizontal' && !isHigherLevel) style.marginTop = '-14px'

      let button1 = (
        <Button
          title="Insert Peer"
          className={!isFirst && tour.run ? 'acts-tour-step6' : null}
          bsSize="xs"
          block
          onClick={this.handleAddBeat}
          style={isMedium ? (isHigherLevel ? { marginTop: '0px' } : { marginTop: '19px' }) : null}
        >
          <Glyphicon glyph="plus" />
        </Button>
      )

      let button2 = hierarchyLevels.length - hierarchyLevel.level > 1 && (
        <Button
          title="Insert Child"
          className={'acts-tour-step8'}
          bsSize="xs"
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
        beatIndex,
        beats,
        positionOffset,
        hierarchyEnabled,
        isSeries,
      } = this.props
      const beatTitle = beatPositionTitle(
        beatIndex,
        beats,
        beat,
        hierarchyLevels,
        positionOffset,
        hierarchyEnabled,
        isSeries
      )
      const klasses = orientedClassName('beat-list__item__hover-options', orientation)
      const showExpandCollapse = hierarchyLevels.length - hierarchyLevel.level > 1
      return (
        <div className={cx(klasses, { 'small-timeline': isSmall })} style={style}>
          <Button
            title={`Edit ${beatTitle}`}
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
          <Button
            title={`Delete ${beatTitle}`}
            bsSize={isSmall ? 'small' : undefined}
            block
            onClick={this.handleDelete}
          >
            <Glyphicon glyph="trash" />
          </Button>
          {showExpandCollapse && (
            <Button
              title={`Expand/Collapse ${beatTitle}`}
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
      if (this.props.isSmall) {
        style = { display: 'none' }
        if (this.state.hovering === this.props.beatId) style.display = 'block'
      } else {
        style = { visibility: 'hidden' }
        if (this.state.hovering === this.props.beatId) style.visibility = 'visible'
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
        darkMode,
      } = this.props
      if (!this.state.editing) return <span>{truncateTitle(beatTitle, 50)}</span>

      return (
        <FormGroup>
          <ControlLabel className={cx({ darkmode: darkMode })}>
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
        hierarchyLevel,
        beat,
        beatTitle,
        isSmall,
        isMedium,
        orientation,
        timelineSize,
        readOnly,
        featureFlags,
        darkMode,
      } = this.props
      const { hovering, inDropZone } = this.state
      const innerKlass = cx(orientedClassName('beat__body', orientation), {
        'medium-timeline': isMedium,
        hover: hovering === beat.id,
        dropping: inDropZone,
        disabled: readOnly,
      })
      const beatKlass = cx(orientedClassName('beat__cell', orientation), {
        'medium-timeline': isMedium,
      })

      if (isSmall) {
        const isHorizontal = orientation == 'horizontal'
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
              title={beatTitle}
              onClick={hovering ? this.stopHovering : this.startHovering}
              draggable={!readOnly}
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
              title={beatTitle}
              onMouseEnter={this.startHovering}
              onMouseLeave={this.stopHovering}
              onDrop={this.handleDrop}
            >
              {this.renderHoverOptions()}
              {this.renderDelete()}
              <div
                style={hierarchyToStyles(
                  hierarchyLevel,
                  timelineSize,
                  hovering === beat.id || inDropZone,
                  darkMode === true ? hierarchyLevel.dark : hierarchyLevel.light,
                  darkMode,
                  featureFlags
                )}
                className={innerKlass}
                onClick={this.startEditing}
                draggable={!readOnly}
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
    currentTimeline: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    orientation: PropTypes.string.isRequired,
    timelineSize: PropTypes.string.isRequired,
    darkMode: PropTypes.bool.isRequired,
    handleReorder: PropTypes.func.isRequired,
    actions: PropTypes.object.isRequired,
    beats: PropTypes.object.isRequired,
    beatIndex: PropTypes.number.isRequired,
    hierarchyLevels: PropTypes.array.isRequired,
    beat: PropTypes.object.isRequired,
    isFirst: PropTypes.bool,
    hierarchyLevel: PropTypes.object.isRequired,
    beatTitle: PropTypes.string.isRequired,
    positionOffset: PropTypes.number.isRequired,
    isSmall: PropTypes.bool.isRequired,
    isMedium: PropTypes.bool.isRequired,
    hierarchyEnabled: PropTypes.bool.isRequired,
    isSeries: PropTypes.bool.isRequired,
    tour: PropTypes.object.isRequired,
    tourActions: PropTypes.object.isRequired,
    onMouseLeave: PropTypes.func.isRequired,
    onMouseEnter: PropTypes.func.isRequired,
    hovering: PropTypes.number,
    readOnly: PropTypes.bool,
    featureFlags: PropTypes.object.isRequired,
  }

  const {
    redux,
    pltr: { selectors, actions },
  } = connector
  checkDependencies({ redux, selectors, actions })

  if (redux) {
    const { connect, bindActionCreators } = redux

    const makeMapState = (state) => {
      const uniqueBeatsSelector = selectors.makeBeatSelector()
      const uniqueBeatTitleSelector = selectors.makeBeatTitleSelector()

      return function mapStateToProps(state, ownProps) {
        return {
          currentTimeline: selectors.currentTimelineSelector(state.present),
          orientation: selectors.orientationSelector(state.present),
          timelineSize: selectors.timelineSizeSelector(state.present),
          darkMode: selectors.isDarkModeSelector(state.present),
          beats: selectors.beatsByBookSelector(state.present),
          beatIndex: selectors.beatIndexSelector(state.present, ownProps.beatId),
          hierarchyLevels: selectors.sortedHierarchyLevels(state.present),
          beat: uniqueBeatsSelector(state.present, ownProps.beatId),
          hierarchyLevel: selectors.hierarchyLevelSelector(state.present, ownProps.beatId),
          beatTitle: uniqueBeatTitleSelector(state.present, ownProps.beatId),
          positionOffset: selectors.positionOffsetSelector(state.present),
          isSmall: selectors.isSmallSelector(state.present),
          isMedium: selectors.isMediumSelector(state.present),
          hierarchyEnabled: selectors.beatHierarchyIsOn(state.present),
          isSeries: selectors.isSeriesSelector(state.present),
          tour: selectors.tourSelector(state.present),
          readOnly: !selectors.canWriteSelector(state.present),
          featureFlags: selectors.featureFlags(state.present),
        }
      }
    }

    const mapDispatchToProps = (dispatch) => {
      return {
        actions: bindActionCreators(actions.beat, dispatch),
        tourActions: bindActionCreators(actions.tour, dispatch),
      }
    }

    return connect(makeMapState, mapDispatchToProps)(BeatTitleCell)
  }

  throw new Error('Could not connect BeatTtileCell')
}

export default BeatTitleCellConnector
