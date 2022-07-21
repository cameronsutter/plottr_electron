import React, { useEffect, useState, useRef } from 'react'
import PropTypes from 'prop-types'
import { Cell } from 'react-sticky-table'
import cx from 'classnames'

import { helpers } from 'pltr/v2'

import UnconnectedFloater from '../PlottrFloater'
import Glyphicon from '../Glyphicon'
import Button from '../Button'
import ButtonGroup from '../ButtonGroup'
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
  }) => {
    const [width, setWidth] = useState(null)
    const [headingCellWidth, setHeadingCellWidth] = useState(null)

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

    const startEditing = (_event) => {
      // TODO
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

    const renderTitle = () => {
      return <span>{truncateTitle(beatTitle, 50)}</span>
    }

    const renderControls = () => {
      return (
        <div ref={bottomButtons}>
          <ButtonGroup>
            <Button bsSize="small">
              <Glyphicon glyph="plus" />
            </Button>
          </ButtonGroup>
        </div>
      )
    }

    const renderAddPeer = () => {
      return (
        <div className="insert-beat-wrapper" ref={rightButtons}>
          <Button bsSize="xs">
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

    return (
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
  }

  const {
    redux,
    pltr: { selectors },
  } = connector

  if (redux) {
    const { connect } = redux

    const uniqueBeatTitleSelector = selectors.makeBeatTitleSelector()

    return connect((state, ownProps) => {
      return {
        beatTitle: uniqueBeatTitleSelector(state.present, ownProps.beatId),
        isMedium: selectors.isMediumSelector(state.present),
        hierarchyLevel: selectors.hierarchyLevelSelector(state.present, ownProps.beatId),
        darkMode: selectors.isDarkModeSelector(state.present),
        timelineSize: selectors.timelineSizeSelector(state.present),
        featureFlags: selectors.featureFlags(state.present),
        readOnly: !selectors.canWriteSelector(state.present),
        beats: selectors.visibleSortedBeatsForTimelineByBookSelector(state.present),
      }
    })(BeatHeadingCell)
  }

  throw new Error('Could not connect BeatHeadingCell!')
}

export default BeatHeadingCellConnector
