import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'react-proptypes'
import { t } from 'plottr_locales'
import { FaExpandAlt, FaCompressAlt } from 'react-icons/fa'
import { IoIosReturnRight } from 'react-icons/io'
import { Cell } from 'react-sticky-table'
import cx from 'classnames'

import { helpers } from 'pltr/v2'

import ButtonGroup from '../ButtonGroup'
import Glyphicon from '../Glyphicon'
import ControlLabel from '../ControlLabel'
import FormGroup from '../FormGroup'
import FormControl from '../FormControl'
import Button from '../Button'
import DeleteConfirmModal from '../dialogs/DeleteConfirmModal'
import InputModal from '../dialogs/InputModal'
import UnconnectedFloater from '../PlottrFloater'
import { checkDependencies } from '../checkDependencies'
import { boundingRectContains } from '../domHelpers'
import MousePositionContext from './MousePositionContext'

const {
  card: { truncateTitle },
  beats: { editingBeatLabel, beatPositionTitle },
  orientedClassName: { orientedClassName },
  hierarchyLevels: { hierarchyToStyles },
} = helpers

const BeatTitleCellConnector = (connector) => {
  const Floater = UnconnectedFloater(connector)

  const BeatTitleCell = ({
    beatId,
    currentTimeline,
    orientation,
    timelineSize,
    darkMode,
    handleReorder,
    actions,
    beats,
    beatIndex,
    hierarchyLevels,
    beat,
    hierarchyLevel,
    beatTitle,
    positionOffset,
    isSmall,
    isMedium,
    isLarge,
    hierarchyEnabled,
    isSeries,
    onMouseLeave,
    onMouseEnter,
    readOnly,
    featureFlags,
    timelineViewIsStacked,
    timelineViewIsTabbed,
    atMaximumDepth,
    hierarchyChildLevelName,
    timelineViewIsDefault,
  }) => {
    const [hovering, setHovering] = useState(false)
    const [editing, setEditing] = useState(beat.title == '')
    const [dragging, setDragging] = useState(false)
    const [inDropZone, setInDropZone] = useState(false)
    const [dropDepth, setDropDepth] = useState(0)
    const [deleting, setDeleting] = useState(false)
    const [stopHoveringTimeout, setStopHoveringTimeout] = useState(null)

    const titleInputRef = useRef(null)
    const insertPeerRef = useRef(null)
    const container = useRef(null)

    useEffect(() => {
      if (editing && titleInputRef.current && document.activeElement !== titleInputRef) {
        titleInputRef.current.select()
      }
    }, [editing])

    const deleteBeat = (e) => {
      e.stopPropagation()
      actions.deleteBeat(beat.id, currentTimeline)
    }

    const cancelDelete = (e) => {
      e.stopPropagation()
      setDeleting(false)
    }

    const handleDelete = (e) => {
      e.stopPropagation()
      if (readOnly) return
      setDeleting(true)
      setHovering(null)
    }

    const handleAddBeat = (e) => {
      if (readOnly) return
      actions.insertBeat(currentTimeline, beat.id)
      actions.expandBeat(beat.id, currentTimeline)
    }

    const handleAddChild = (e) => {
      if (readOnly) return
      actions.expandBeat(beat.id, currentTimeline)
      actions.addBeat(currentTimeline, beat.id)
    }

    const handleToggleExpanded = (e) => {
      const { collapseBeat, expandBeat } = actions
      const { id, expanded } = beat

      if (readOnly) return

      if (expanded) collapseBeat(id, currentTimeline)
      else expandBeat(id, currentTimeline)
    }

    const editTitle = () => {
      const ref = titleInputRef.current
      if (!ref) return

      finalizeEdit(ref.value)
    }

    const finalizeEdit = (newVal) => {
      actions.editBeatTitle(beat.id, currentTimeline, newVal || 'auto') // if nothing, set to auto
      setEditing(false)
      setHovering(null)
    }

    const handleFinishEditing = (event) => {
      if (event.which === 13) {
        editTitle()
      }
    }

    const handleBlur = () => {
      editTitle()
    }

    const handleEsc = (event) => {
      if (event.which === 27) setEditing(false)
    }

    const handleDragStart = (e) => {
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/json', JSON.stringify(beat))
      setDragging(true)
    }

    const handleDragEnd = () => {
      setDragging(false)
    }

    const handleDragEnter = (e) => {
      if (!dragging) setDropDepth(dropDepth + 1)
    }

    const handleDragOver = (e) => {
      e.preventDefault()
      if (!dragging) setInDropZone(true)
    }

    const handleDragLeave = (e) => {
      if (!dragging) {
        let newDropDepth = dropDepth
        --newDropDepth
        setDropDepth(newDropDepth)
        if (newDropDepth > 0) return
        setInDropZone(false)
      }
    }

    const handleDrop = (e) => {
      e.stopPropagation()
      setInDropZone(false)
      setDropDepth(0)

      var json = e.dataTransfer.getData('text/json')
      var droppedBeat = JSON.parse(json)
      if (droppedBeat.id == null) return
      if (droppedBeat.id == beat.id) return

      if (!beat.expanded) {
        actions.expandBeat(beat.id, currentTimeline)
      }
      handleReorder(beat.id, droppedBeat.id)
    }

    const startEditing = () => {
      if (readOnly) return
      setEditing(true)
      setHovering(null)
    }

    const startHovering = () => {
      if (readOnly) return
      onMouseEnter()
      setHovering(onMouseEnter())
    }

    const stopHovering = () => {
      if (readOnly) return
      // Tune this to the mouse tracking timeout in TopRow.
      if (stopHoveringTimeout) {
        clearTimeout(stopHoveringTimeout)
      }
      setStopHoveringTimeout(
        setTimeout(() => {
          onMouseLeave()
          setHovering(null)
        }, 100)
      )
    }

    const rightButtonsContain = (mouseCoord) => {
      return (
        insertPeerRef.current &&
        boundingRectContains(insertPeerRef.current.getBoundingClientRect(), mouseCoord)
      )
    }

    const padding = () => {
      const shouldRenderInsertChild =
        (timelineViewIsTabbed || timelineViewIsDefault) && !atMaximumDepth
      const controlHeight = shouldRenderInsertChild ? 52 : 25
      const offset = Math.floor(controlHeight / 2)

      if (container.current) {
        const isHorizontal = orientation == 'horizontal'
        const bodyElement = isHorizontal
          ? container.current.querySelector('.beat__body')
          : container.current.querySelector('.vertical-beat__body')
        if (bodyElement) {
          const { height, top } = bodyElement.getBoundingClientRect()
          const margin = top - container.current.getBoundingClientRect().top
          return margin + Math.floor(height / 2) - offset
        }
      }
      return 0
    }

    const renderDelete = () => {
      if (!deleting) return null

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
          onDelete={deleteBeat}
          onCancel={cancelDelete}
        />
      )
    }

    const renderEditInput = () => {
      if (!editing) return null

      return (
        <InputModal
          isOpen={true}
          type="text"
          getValue={finalizeEdit}
          defaultValue={t(beat.title)}
          title={t('Edit {beatName}', { beatName: t(beatTitle) })}
          cancel={() => {
            setEditing(false)
            setHovering(null)
          }}
        />
      )
    }

    const renderHorizontalHoverOptions = (style) => {
      const klasses = orientedClassName('beat-list__item__hover-options', orientation)
      const showExpandCollapse = hierarchyLevels.length - hierarchyLevel.level > 1
      // Not sure that we need this...
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
                onClick={startEditing}
              >
                <Glyphicon glyph="edit" />
              </Button>
            )}
            <Button
              title={`Delete ${beatTitle}`}
              bsSize={isSmall ? 'small' : undefined}
              onClick={handleDelete}
            >
              <Glyphicon glyph="trash" />
            </Button>
            {showExpandCollapse ? (
              <Button
                title={`Expand/Collapse ${beatTitle}`}
                bsSize={isSmall ? 'small' : undefined}
                onClick={handleToggleExpanded}
              >
                {beat.expanded ? <FaCompressAlt /> : <FaExpandAlt />}
              </Button>
            ) : null}
          </ButtonGroup>
        </div>
      )
    }

    const renderVerticalHoverOptions = (style) => {
      // Also not sure that we need this
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
            onClick={startEditing}
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
            onClick={handleDelete}
          >
            <Glyphicon glyph="trash" />
          </Button>
          {showExpandCollapse && (
            <Button
              title={`Expand/Collapse ${beatTitle}`}
              bsSize={isSmall ? 'small' : undefined}
              onClick={handleToggleExpanded}
            >
              {beat.expanded ? <FaCompressAlt /> : <FaExpandAlt />}
            </Button>
          )}
        </div>
      )
    }

    const renderHoverOptions = () => {
      let style = {}
      if (isSmall) {
        style = { display: 'none' }
        if (hovering === beatId) style.display = 'block'
      } else {
        style = { visibility: 'hidden' }
        if (hovering === beatId) style.visibility = 'visible'
      }

      if (orientation === 'vertical') {
        return renderVerticalHoverOptions(style)
      } else {
        return renderHorizontalHoverOptions(style)
      }
    }

    const renderTitle = () => {
      if (!editing) return <span>{truncateTitle(beatTitle, 50)}</span>

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
              titleInputRef.current = ref
            }}
            autoFocus
            onKeyDown={handleEsc}
            onBlur={handleBlur}
            onKeyPress={handleFinishEditing}
          />
        </FormGroup>
      )
    }

    const renderInsertPeer = () => {
      const shouldRenderInsertChild =
        (timelineViewIsTabbed || timelineViewIsDefault) && !atMaximumDepth

      return (
        <div className="insert-beat-wrapper" ref={insertPeerRef}>
          <ButtonGroup vertical>
            <Button bsSize="xs" title="Insert peer" onClick={handleAddBeat}>
              <Glyphicon glyph="plus" />
            </Button>
            {shouldRenderInsertChild ? (
              <div title={t(`Insert ${hierarchyChildLevelName}`)} onClick={handleAddChild}>
                <Button bsSize="xs">
                  <IoIosReturnRight size={25} style={{ margin: '-1px -5px -6px -5px' }} />
                </Button>
              </div>
            ) : null}
          </ButtonGroup>
        </div>
      )
    }

    const renderControls = () => {
      const showExpandCollapse =
        !timelineViewIsTabbed && hierarchyLevels.length - hierarchyLevel.level > 1

      return (
        <ButtonGroup>
          <Button title={`Edit ${beatTitle}`} bsSize="small" onClick={startEditing}>
            <Glyphicon glyph="edit" />
          </Button>
          <Button title={`Delete ${beatTitle}`} bsSize="small" onClick={handleDelete}>
            <Glyphicon glyph="trash" />
          </Button>
          {showExpandCollapse ? (
            <Button
              title={`Expand/Collapse ${beatTitle}`}
              bsSize="small"
              onClick={handleToggleExpanded}
            >
              {beat.expanded ? <FaCompressAlt /> : <FaExpandAlt />}
            </Button>
          ) : null}
        </ButtonGroup>
      )
    }

    window.SCROLLWITHKEYS = !editing
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
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {renderHoverOptions()}
          {renderDelete()}
          {renderEditInput()}
          <div
            title={beatTitle}
            onClick={hovering ? stopHovering : startHovering}
            draggable={!readOnly}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <span>{truncateTitle(beatTitle, 50)}</span>
          </div>
        </th>
      )
    } else {
      return (
        <MousePositionContext.Consumer>
          {(mouseCoord) => {
            const isHovering =
              hovering ||
              (mouseCoord.x !== null && mouseCoord.y !== null && rightButtonsContain(mouseCoord))
            return (
              <Cell
                className="beat-table-cell"
                ref={(ref) => {
                  container.current = ref
                }}
              >
                <Floater
                  hideArrow={true}
                  open={isHovering}
                  contentLocation={() => {
                    if (container.current) {
                      const { top, right } = container.current.getBoundingClientRect()
                      return { top: top + padding(), left: right }
                    }
                    return { top: 0, left: 0 }
                  }}
                  component={renderInsertPeer}
                >
                  <div
                    className={beatKlass}
                    title={beatTitle}
                    onMouseEnter={startHovering}
                    onMouseLeave={stopHovering}
                    onDrop={handleDrop}
                  >
                    {renderDelete()}
                    <Floater
                      hideArrow={true}
                      open={isHovering}
                      placement="bottom"
                      align="start"
                      component={renderControls}
                    >
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
                        onClick={startEditing}
                        draggable={!readOnly}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onDragEnter={handleDragEnter}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                      >
                        {renderTitle()}
                      </div>
                    </Floater>
                  </div>
                </Floater>
              </Cell>
            )
          }}
        </MousePositionContext.Consumer>
      )
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
    hierarchyLevel: PropTypes.object.isRequired,
    beatTitle: PropTypes.string.isRequired,
    positionOffset: PropTypes.number.isRequired,
    isSmall: PropTypes.bool.isRequired,
    isMedium: PropTypes.bool.isRequired,
    isLarge: PropTypes.bool.isRequired,
    hierarchyEnabled: PropTypes.bool.isRequired,
    isSeries: PropTypes.bool.isRequired,
    onMouseLeave: PropTypes.func.isRequired,
    onMouseEnter: PropTypes.func.isRequired,
    readOnly: PropTypes.bool,
    featureFlags: PropTypes.object.isRequired,
    timelineViewIsStacked: PropTypes.bool,
    timelineViewIsTabbed: PropTypes.bool,
    atMaximumDepth: PropTypes.bool,
    hierarchyChildLevelName: PropTypes.string,
    timelineViewIsDefault: PropTypes.bool,
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
          isLarge: selectors.isLargeSelector(state.present),
          hierarchyEnabled: selectors.beatHierarchyIsOn(state.present),
          isSeries: selectors.isSeriesSelector(state.present),
          readOnly: !selectors.canWriteSelector(state.present),
          featureFlags: selectors.featureFlags(state.present),
          timelineViewIsStacked: selectors.timelineViewIsStackedSelector(state.present),
          timelineViewIsTabbed: selectors.timelineViewIsTabbedSelector(state.present),
          timelineViewIsDefault: selectors.timelineViewIsDefaultSelector(state.present),
          atMaximumDepth: selectors.atMaximumHierarchyDepthSelector(state.present, ownProps.beatId),
          hierarchyChildLevelName: selectors.hierarchyChildLevelNameSelector(
            state.present,
            ownProps.beatId
          ),
        }
      }
    }

    const mapDispatchToProps = (dispatch) => {
      return {
        actions: bindActionCreators(actions.beat, dispatch),
      }
    }

    return connect(makeMapState, mapDispatchToProps)(BeatTitleCell)
  }

  throw new Error('Could not connect BeatTtileCell')
}

export default BeatTitleCellConnector
