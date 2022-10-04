import React, { useState } from 'react'
import PropTypes from 'react-proptypes'
import { Cell } from 'react-sticky-table'
import cx from 'classnames'

import { t as i18n } from 'plottr_locales'

import Glyphicon from '../Glyphicon'
import Button from '../Button'
import { helpers } from 'pltr/v2'
import VisualLine from './VisualLine'
import { checkDependencies } from '../checkDependencies'

const {
  orientedClassName: { orientedClassName },
} = helpers

const BeatInsertCellConnector = (connector) => {
  const BeatInsertCell = (props) => {
    const {
      orientation,
      isSmall,
      isMedium,
      isLarge,
      handleInsert,
      isInBeatList,
      beatToLeft,
      showLine,
      color,
      isLast,
      isInsertChildCell,
      tableLength,
      hierarchyChildLevelName,
      hierarchyLevelName,
      hierarchyLevels,
      readOnly,
      isEmpty,
    } = props

    const [hovering, setHovering] = useState(false)

    const insert = () => {
      if (readOnly) return
      handleInsert(beatToLeft && beatToLeft.id)
    }

    const lastTitleText = () => {
      return i18n(`Add ${hierarchyLevelName}`)
    }

    const titleText = () => {
      return i18n(`Insert ${hierarchyLevelName}`)
    }

    const childTitleText = () => {
      return i18n(`Insert ${hierarchyChildLevelName}`)
    }

    const wrapperClass = () => {
      return cx(orientedClassName('insert-beat-wrapper', orientation), {
        'insert-beat-spacer': showLine,
        transparent: !hovering,
      })
    }

    const lastWrapperClass = () => {
      return cx(orientedClassName('insert-beat-wrapper', orientation), 'append-beat', {
        'insert-beat-spacer': showLine,
        'small-timeline': isSmall,
        'medium-timeline': isMedium,
        'large-timeline': isLarge,
      })
    }

    const orientedClass = () => {
      return orientedClassName(isInBeatList ? beatClass() : insertBeatClass(), orientation)
    }

    const lastOrientedClass = () => {
      return orientedClassName(lastBeatClass(), orientation)
    }

    const insertBeatClass = (withoutMargin = false) => {
      return cx({
        'line-list__insert-beat': !withoutMargin,
        'line-list__insert-child-beat': withoutMargin,
        'medium-timeline': isMedium,
      })
    }

    const lastBeatClass = () => {
      return cx('beat-list__insert', 'append-beat', {
        'medium-timeline': isInBeatList && isMedium,
        'small-timeline': isInBeatList && isSmall,
      })
    }

    const beatClass = () => {
      return cx('beat-list__insert', {
        'medium-timeline': isInBeatList && isMedium,
        transparent: !hovering,
      })
    }

    const renderLine = () => {
      return (
        <VisualLine
          tableLength={tableLength}
          orientation={orientation}
          color={color}
          isMedium={isMedium}
        />
      )
    }

    const renderInsertBeat = () => {
      let actualHierarchyLevel = hierarchyLevels.find((level) =>
        level.name == hierarchyLevelName ? true : null
      )
      const isHigherLevel = hierarchyLevels.length - actualHierarchyLevel.level > 1

      return (
        <div
          title={titleText()}
          className={orientedClass()}
          onClick={insert}
          style={orientation == 'vertical' ? (isHigherLevel ? null : { marginTop: '10px' }) : null}
        >
          <div className={wrapperClass()}>
            <Button bsSize="xs" block>
              <Glyphicon glyph="plus" />
            </Button>
          </div>
        </div>
      )
    }

    const renderLastInsertBeat = () => {
      return (
        <div title={lastTitleText()} className={lastOrientedClass()} onClick={insert}>
          <div className={lastWrapperClass()}>
            <Glyphicon glyph="plus" />
          </div>
        </div>
      )
    }

    const renderInsertMissingChildBeat = () => {
      return (
        <div
          title={childTitleText()}
          className={cx('beat-list__insert insert-beat', {
            'medium-timeline': isMedium,
            'large-timeline': isLarge,
          })}
          onClick={insert}
        >
          <div
            className={cx('insert-missing-beat-wrapper insert-beat', {
              'medium-timeline': isMedium,
              'large-timeline': isLarge,
            })}
          >
            <Glyphicon glyph="plus" />
          </div>
        </div>
      )
    }

    const handleMouseEnter = () => {
      if (readOnly) return
      setHovering(true)
    }

    const handleMouseLeave = () => {
      if (readOnly) return
      setHovering(false)
    }

    let insideDiv = null
    // Style for last beat is off, it's too wide...
    if (isInsertChildCell) {
      insideDiv = renderInsertMissingChildBeat()
    } else if (isLast || (orientation === 'vertical' && isEmpty)) {
      insideDiv = renderLastInsertBeat()
    } else if (orientation === 'vertical') {
      insideDiv = (
        <div
          className={cx('vertical-beat-list__insert', { 'medium-timeline': isMedium })}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {renderInsertBeat()}
        </div>
      )
    } else {
      insideDiv = (
        <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          {renderInsertBeat()}
        </div>
      )
    }

    if (isSmall) {
      const isHorizontal = orientation == 'horizontal'
      const classes = { 'rotate-45': isHorizontal, 'row-header': !isHorizontal }
      return <th className={cx(classes)}>{insideDiv}</th>
    } else {
      return (
        <Cell>
          {insideDiv}
          {showLine ? renderLine() : null}
        </Cell>
      )
    }
  }

  BeatInsertCell.propTypes = {
    orientation: PropTypes.string,
    isSmall: PropTypes.bool,
    isMedium: PropTypes.bool,
    isLarge: PropTypes.bool,
    handleInsert: PropTypes.func.isRequired,
    isInBeatList: PropTypes.bool.isRequired,
    beatToLeft: PropTypes.object,
    showLine: PropTypes.bool,
    color: PropTypes.string,
    isLast: PropTypes.bool,
    isInsertChildCell: PropTypes.bool,
    tableLength: PropTypes.number,
    hierarchyChildLevelName: PropTypes.string,
    hierarchyLevelName: PropTypes.string,
    hierarchyLevels: PropTypes.array.isRequired,
    readOnly: PropTypes.bool,
    isEmpty: PropTypes.bool,
  }

  const {
    redux,
    pltr: { selectors, actions },
  } = connector
  checkDependencies({ redux, selectors, actions })

  if (redux) {
    const { connect } = redux

    return connect((state, ownProps) => {
      const beatToLeftId = ownProps.beatToLeft && ownProps.beatToLeft.id

      return {
        orientation: selectors.orientationSelector(state.present),
        isSmall: selectors.isSmallSelector(state.present),
        isMedium: selectors.isMediumSelector(state.present),
        isLarge: selectors.isLargeSelector(state.present),
        hierarchyLevels: selectors.sortedHierarchyLevels(state.present),
        hierarchyLevelName: selectors.beatInsertControlHierarchyLevelNameSelector(
          state.present,
          beatToLeftId
        ),
        hierarchyChildLevelName: selectors.hierarchyChildLevelNameSelector(
          state.present,
          beatToLeftId
        ),
        readOnly: !selectors.canWriteSelector(state.present),
      }
    })(BeatInsertCell)
  }

  throw new Error('Could not connect BeatInsertCell')
}

export default BeatInsertCellConnector
