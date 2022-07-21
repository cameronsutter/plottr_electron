import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Cell } from 'react-sticky-table'
import cx from 'classnames'

import { helpers } from 'pltr/v2'

import UnconnectedFloater from '../PlottrFloater'
import Glyphicon from '../Glyphicon'
import Button from '../Button'

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
    const [hovering, setHovering] = useState(false)
    const [width, setWidth] = useState(null)
    const [headingCellWidth, setHeadingCellWidth] = useState(null)

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

    const startHovering = (_event) => {
      setHovering(true)
    }

    const stopHovering = (_event) => {
      setHovering(false)
    }

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
        <div>
          <Button>
            <Glyphicon glyph="plus" />
          </Button>
        </div>
      )
    }

    const renderAddPeer = () => {
      return (
        <div>
          <Button>
            <Glyphicon glyph="plus" />
          </Button>
        </div>
      )
    }

    return (
      <Cell onMouseEnter={startHovering} onMouseLeave={stopHovering}>
        <Floater hideArrow={true} open={hovering} placement="right" component={renderAddPeer}>
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
                  ...(!isMedium && width
                    ? {
                        width: width - 34,
                      }
                    : isMedium && width
                    ? {
                        width: width - 6,
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
