import React, { useEffect, useState, useRef } from 'react'
import PropTypes from 'prop-types'
import { Cell } from 'react-sticky-table'
import cx from 'classnames'

import { t } from 'plottr_locales'
import { helpers } from 'pltr/v2'

import UnconnectedFloater from '../PlottrFloater'
import Glyphicon from '../Glyphicon'
import Button from '../Button'
import ButtonGroup from '../ButtonGroup'
import FormGroup from '../FormGroup'
import ControlLabel from '../ControlLabel'
import FormControl from '../FormControl'
import DeleteConfirmModal from '../dialogs/DeleteConfirmModal'
import MousePositionContext from './MousePositionContext'
import { boundingRectContains } from '../domHelpers'

const {
  card: { truncateTitle },
  hierarchyLevels: { hierarchyToStyles },
} = helpers

const BeatHeadingCellConnector = (connector) => {
  const Floater = UnconnectedFloater(connector)

  const BeatHeadingCell = ({
    span,
    beatId,
    beatTitle,
    isMedium,
    hierarchyLevel,
    inDropZone,
    darkMode,
    timelineSize,
    featureFlags,
    readOnly,
    beats,
    hierarchyLevelName,
    currentTimeline,
    insertBeat,
    editBeatTitle,
    beat,
    hierarchyLevels,
    deleteBeat,
  }) => {
    const [width, setWidth] = useState(null)
    const [headingCellWidth, setHeadingCellWidth] = useState(null)
    const [editing, setEditing] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const container = useRef(null)
    const bottomButtons = useRef(null)
    const rightButtons = useRef(null)

    useEffect(() => {
      const aBeatTitleCell = document.querySelector('.beat-table-cell')
      if (aBeatTitleCell) {
        const aSpacerCell = document.querySelector('.beat__heading-spacer')
        const thisHeadingCellWidth = aBeatTitleCell.getBoundingClientRect().width
        setHeadingCellWidth(thisHeadingCellWidth)
        if (isMedium) {
          const spanIncludingThisBeat = Math.max(1, span)
          setWidth(thisHeadingCellWidth * spanIncludingThisBeat)
        } else if (aSpacerCell) {
          const spanIncludingThisBeat = Math.max(1, span)
          const widthWithSpacer = thisHeadingCellWidth + aSpacerCell.getBoundingClientRect().width
          setWidth(widthWithSpacer * spanIncludingThisBeat)
        }
      }
    }, [setWidth, setHeadingCellWidth, beats])

    const handleDrop = (_event) => {
      // TODO
    }

    const startEditing = (event) => {
      event.stopPropagation()
      setEditing(true)
    }

    const stopEditing = () => {
      if (beat.title === '') {
        editBeatTitle(beatId, currentTimeline, 'auto')
      }
      setEditing(false)
    }

    const startDeleting = (event) => {
      event.stopPropagation()
      setDeleting(true)
    }

    const stopDeleting = () => {
      setDeleting(false)
    }

    const handleDragEnd = (_event) => {
      // TODO
    }

    const handleDragStart = (_event) => {
      // TODO
    }

    const handleDragEnter = (_event) => {
      // TODO
    }

    const handleDragOver = (_event) => {
      // TODO
    }

    const handleDragLeave = (_event) => {
      // TODO
    }

    const deleteThisBeat = (event) => {
      event.stopPropagation()
      deleteBeat(beatId, currentTimeline)
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
          onDelete={deleteThisBeat}
          onCancel={stopDeleting}
        />
      )
    }

    const renderTitle = () => {
      return <span>{truncateTitle(beatTitle, 50)}</span>
    }

    const renderControls = () => {
      return (
        <div ref={bottomButtons}>
          <ButtonGroup>
            <Button title={`Edit ${beatTitle}`} bsSize="small" onClick={startEditing}>
              <Glyphicon glyph="edit" />
            </Button>
            <Button title={`Delete ${beatTitle}`} bsSize="small" onClick={startDeleting}>
              <Glyphicon glyph="trash" />
            </Button>
          </ButtonGroup>
        </div>
      )
    }

    const insert = () => {
      if (readOnly) return
      insertBeat(currentTimeline, beatId)
    }

    const renderAddPeer = () => {
      return (
        <div className="insert-beat-wrapper" ref={rightButtons}>
          <Button bsSize="xs" title={t(`Insert ${hierarchyLevelName}`)} onClick={insert}>
            <Glyphicon glyph="plus" />
          </Button>
        </div>
      )
    }

    const extend = (boundingClientRect) => {
      return {
        left: boundingClientRect.left,
        top: boundingClientRect.top,
        bottom: boundingClientRect.bottom,
        right: boundingClientRect.left + adjustedWidth(),
      }
    }

    const headingContains = (mouseCoord) => {
      return boundingRectContains(extend(container.current.getBoundingClientRect()), mouseCoord)
    }

    const bottomButtonsContain = (mouseCoord) => {
      return (
        bottomButtons.current &&
        boundingRectContains(bottomButtons.current.getBoundingClientRect(), mouseCoord)
      )
    }

    const rightButtonsContain = (mouseCoord) => {
      return (
        rightButtons.current &&
        boundingRectContains(rightButtons.current.getBoundingClientRect(), mouseCoord)
      )
    }

    const adjustedWidth = () => {
      return width - (isMedium ? 10 : 34)
    }

    const handleEsc = (event) => {
      if (event.which === 27 || event.which === 13) {
        setEditing(false)
      }
    }

    if (editing) {
      return (
        <FormGroup>
          <ControlLabel className={cx({ darkmode: darkMode })}>{beatTitle}</ControlLabel>
          <FormControl
            type="text"
            onChange={(event) => {
              editBeatTitle(beatId, currentTimeline, event.target.value)
            }}
            value={beat.title}
            autoFocus
            onKeyDown={handleEsc}
            onBlur={stopEditing}
          />
        </FormGroup>
      )
    }

    return (
      <>
        {renderDelete()}
        <MousePositionContext.Consumer>
          {(mouseCoord) => {
            // TODO: postiion the buttons at the right edge
            const hovering =
              container.current && mouseCoord.x !== null && mouseCoord.y !== null
                ? headingContains(mouseCoord) ||
                  bottomButtonsContain(mouseCoord) ||
                  rightButtonsContain(mouseCoord)
                : false
            return (
              <Cell
                ref={(ref) => {
                  container.current = ref
                }}
              >
                <Floater
                  hideArrow={true}
                  open={hovering}
                  contentLocation={() => {
                    if (container.current) {
                      const { top, left } = container.current.getBoundingClientRect()
                      return { top: top + 5, left: left + adjustedWidth() }
                    }
                    return { top: 0, left: 0 }
                  }}
                  component={renderAddPeer}
                >
                  <div
                    className={cx('beat__heading-wrapper', {
                      'medium-timeline': isMedium,
                    })}
                    style={{ width: headingCellWidth, overflow: 'visible' }}
                    title={beatTitle}
                    onDrop={handleDrop}
                  >
                    <Floater
                      hideArrow={true}
                      open={hovering}
                      placement="bottom"
                      align="start"
                      component={renderControls}
                    >
                      <div
                        style={{
                          ...hierarchyToStyles(
                            hierarchyLevel,
                            timelineSize,
                            hovering === beatId || inDropZone,
                            darkMode === true ? hierarchyLevel.dark : hierarchyLevel.light,
                            darkMode,
                            featureFlags
                          ),
                          ...(isMedium ? {} : { padding: '10px 10px' }),
                          ...(width
                            ? {
                                width: adjustedWidth(),
                              }
                            : {}),
                        }}
                        className={cx('beat__heading', {
                          'medium-timeline': isMedium,
                        })}
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
      </>
    )
  }

  BeatHeadingCell.propTypes = {
    span: PropTypes.number.isRequired,
    beatId: PropTypes.number.isRequired,
    beatTitle: PropTypes.string.isRequired,
    isMedium: PropTypes.bool,
    hierarchyLevel: PropTypes.object.isRequired,
    inDropZone: PropTypes.bool,
    darkMode: PropTypes.bool,
    timelineSize: PropTypes.string.isRequired,
    featureFlags: PropTypes.object.isRequired,
    readOnly: PropTypes.bool,
    beats: PropTypes.array.isRequired,
    hierarchyLevelName: PropTypes.string.isRequired,
    currentTimeline: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    insertBeat: PropTypes.func.isRequired,
    editBeatTitle: PropTypes.func.isRequired,
    beat: PropTypes.object.isRequired,
    hierarchyLevels: PropTypes.array.isRequired,
    deleteBeat: PropTypes.func.isRequired,
  }

  const {
    redux,
    pltr: { selectors, actions },
  } = connector

  if (redux) {
    const { connect } = redux

    const uniqueBeatTitleSelector = selectors.makeBeatTitleSelector()
    const uniqueBeatsSelector = selectors.makeBeatSelector()

    return connect(
      (state, ownProps) => {
        return {
          beatTitle: uniqueBeatTitleSelector(state.present, ownProps.beatId),
          isMedium: selectors.isMediumSelector(state.present),
          hierarchyLevel: selectors.hierarchyLevelSelector(state.present, ownProps.beatId),
          darkMode: selectors.isDarkModeSelector(state.present),
          timelineSize: selectors.timelineSizeSelector(state.present),
          featureFlags: selectors.featureFlags(state.present),
          readOnly: !selectors.canWriteSelector(state.present),
          beats: selectors.visibleSortedBeatsForTimelineByBookSelector(state.present),
          hierarchyLevelName: selectors.beatInsertControlHierarchyLevelNameSelector(
            state.present,
            ownProps.beatId
          ),
          currentTimeline: selectors.currentTimelineSelector(state.present),
          beat: uniqueBeatsSelector(state.present, ownProps.beatId),
          hierarchyLevels: selectors.sortedHierarchyLevels(state.present),
        }
      },
      {
        insertBeat: actions.beat.insertBeat,
        editBeatTitle: actions.beat.editBeatTitle,
        deleteBeat: actions.beat.deleteBeat,
      }
    )(BeatHeadingCell)
  }

  throw new Error('Could not connect BeatHeadingCell!')
}

export default BeatHeadingCellConnector
