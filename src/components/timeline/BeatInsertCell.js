import React, { PureComponent } from 'react'
import PropTypes from 'react-proptypes'
import { Cell } from 'react-sticky-table'
import { Glyphicon, Button } from 'react-bootstrap'
import { t as i18n } from 'plottr_locales'
import { IoIosReturnRight } from 'react-icons/io'
import { FaExpandAlt, FaCompressAlt } from 'react-icons/fa'
import cx from 'classnames'
import { helpers } from 'pltr/v2'
import VisualLine from './VisualLine'

import { checkDependencies } from '../checkDependencies'

const {
  orientedClassName: { orientedClassName },
} = helpers

const BeatInsertCellConnector = (connector) => {
  class BeatInsertCell extends PureComponent {
    constructor(props) {
      super(props)
      this.state = {
        hovering: this.props.hovering,
        localHovering: false,
      }
    }

    insert = () => {
      if (this.props.readOnly) return
      const { beatToLeft, handleInsert } = this.props
      handleInsert(beatToLeft && beatToLeft.id)
    }

    insertChild = () => {
      if (this.props.readOnly) return
      const { beatToLeft, handleInsertChild, bookId } = this.props
      handleInsertChild(beatToLeft && beatToLeft.id, bookId)
    }

    lastTitleText = () => {
      const { hierarchyLevelName } = this.props

      return i18n(`Add ${hierarchyLevelName}`)
    }

    titleText = () => {
      const { hierarchyLevelName } = this.props

      return i18n(`Insert ${hierarchyLevelName}`)
    }

    lastChildText = () => {
      const { hierarchyChildLevelName } = this.props

      return i18n(`Add ${hierarchyChildLevelName}`)
    }

    childTitleText = () => {
      const { hierarchyChildLevelName } = this.props

      return i18n(`Insert ${hierarchyChildLevelName}`)
    }

    wrapperClass = () => {
      const { showLine, orientation, beatToLeft, hovering } = this.props
      const { localHovering } = this.state

      //if the value of 'hovering' (integer of the card's id passed down from parent) !== the current card's id, add a class that makes the icon transparent, \/ if !beatToLeft then make the first plus icon transparent
      return cx(
        orientedClassName('insert-beat-wrapper', orientation),
        beatToLeft && hovering !== beatToLeft.id && !localHovering && 'transparent',
        !beatToLeft && !localHovering && 'transparent',
        {
          'insert-beat-spacer': showLine,
        }
      )
    }

    lastWrapperClass = () => {
      const { showLine, orientation, isSmall, isMedium, isLarge } = this.props

      return cx(orientedClassName('insert-beat-wrapper', orientation), 'append-beat', {
        'insert-beat-spacer': showLine,
        'small-timeline': isSmall,
        'medium-timeline': isMedium,
        'large-timeline': isLarge,
      })
    }

    orientedClassSubIcon = () => {
      const { isInBeatList, orientation } = this.props

      return orientedClassName(
        isInBeatList ? this.beatClassSubIcon() : this.insertBeatClass(),
        orientation
      )
    }

    orientedClass = () => {
      const { isInBeatList, orientation } = this.props

      return orientedClassName(
        isInBeatList ? this.beatClass() : this.insertBeatClass(),
        orientation
      )
    }

    lastOrientedClass = () => {
      const { orientation } = this.props

      return orientedClassName(this.lastBeatClass(), orientation)
    }

    insertBeatClass = () => {
      const { isMedium } = this.props

      return cx('line-list__insert-beat', {
        'medium-timeline': isMedium,
      })
    }

    beatClassSubIcon = () => {
      const { isMedium, isInBeatList, beatToLeft, hovering } = this.props
      const { localHovering } = this.state

      return cx(
        'beat-list__insert',
        beatToLeft && hovering !== beatToLeft.id && !localHovering && 'transparent',
        {
          'medium-timeline': isInBeatList && isMedium,
        }
      )
    }

    wrapperClassSubIcon = () => {
      const { showLine, orientation } = this.props

      return cx(orientedClassName('insert-beat-wrapper', orientation), {
        'insert-beat-spacer': showLine,
      })
    }

    lastBeatClass = () => {
      const { isInBeatList, isMedium, isSmall } = this.props

      return cx('beat-list__insert', 'append-beat', {
        'medium-timeline': isInBeatList && isMedium,
        'small-timeline': isInBeatList && isSmall,
      })
    }

    beatClass = () => {
      const { isInBeatList, isMedium, hovering, beatToLeft } = this.props
      const { localHovering } = this.state

      return cx(
        'beat-list__insert',
        beatToLeft && hovering !== beatToLeft.id && !localHovering && 'transparent',
        {
          'medium-timeline': isInBeatList && isMedium,
        }
      )
    }

    renderLine() {
      const { tableLength, orientation, color, isMedium } = this.props
      return (
        <VisualLine
          tableLength={tableLength}
          orientation={orientation}
          color={color}
          isMedium={isMedium}
        />
      )
    }

    renderToggleCollapse() {
      const { handleInsertChild, toggleExpanded, expanded, tour, isFirst } = this.props

      return !handleInsertChild && toggleExpanded ? (
        <div
          onClick={toggleExpanded}
          className={cx(
            this.orientedClassSubIcon(),
            expanded === false ? 'beat-list__insert--always-visible' : {}
          )}
        >
          <div className={this.wrapperClassSubIcon()}>
            <div
              onClick={() =>
                !isFirst && expanded === true && tour.run && this.props.tourActions.tourNext('next')
              }
            >
              {expanded ? <FaCompressAlt /> : <FaExpandAlt />}
            </div>
          </div>
        </div>
      ) : null
    }

    renderInsertChild() {
      const { handleInsertChild, isFirst, atMaximumDepth } = this.props

      if (atMaximumDepth) return null

      return handleInsertChild && !isFirst ? (
        <div
          title={this.childTitleText()}
          className={this.orientedClassSubIcon()}
          onClick={this.insertChild}
        >
          <Button className={this.wrapperClassSubIcon()} bsSize="xs" block>
            <IoIosReturnRight
              size={25}
              style={{ margin: '-1px -5px -6px -5px' }}
              className={'acts-tour-step8'}
            />
          </Button>
        </div>
      ) : null
    }

    renderInsertBeat() {
      const { isFirst, hierarchyLevels, orientation, hierarchyLevelName } = this.props

      let actualHierarchyLevel = hierarchyLevels.find((level) =>
        level.name == hierarchyLevelName ? true : null
      )
      const isHigherLevel = hierarchyLevels.length - actualHierarchyLevel.level > 1

      return (
        <div
          title={this.titleText()}
          className={this.orientedClass()}
          onClick={this.insert}
          style={orientation == 'vertical' ? (isHigherLevel ? null : { marginTop: '10px' }) : null}
        >
          <div className={this.wrapperClass()}>
            <Button className={!isFirst ? 'acts-tour-step6' : null} bsSize="xs" block>
              <Glyphicon glyph="plus" />
            </Button>
          </div>
        </div>
      )
    }

    renderLastInsertBeat() {
      return (
        <div
          title={this.lastTitleText()}
          className={this.lastOrientedClass()}
          onClick={this.insert}
        >
          <div className={this.lastWrapperClass()}>
            <Glyphicon glyph="plus" />
          </div>
        </div>
      )
    }

    handleMouseEnter = () => {
      if (this.props.readOnly) return
      this.setState({ localHovering: true })
    }

    handleMouseLeave = () => {
      if (this.props.readOnly) return
      this.setState({ localHovering: false })
    }

    render() {
      const { showLine, orientation, isSmall, isLast, isEmpty } = this.props
      let insideDiv = null
      if (isLast || (orientation === 'vertical' && isEmpty)) {
        insideDiv = this.renderLastInsertBeat()
      } else if (orientation === 'vertical') {
        insideDiv = (
          <div
            className="vertical-beat-list__insert"
            onMouseEnter={this.handleMouseEnter}
            onMouseLeave={this.handleMouseLeave}
          >
            {this.renderInsertBeat()}
            {this.renderInsertChild()}
          </div>
        )
      } else {
        insideDiv = (
          <div onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
            {this.renderInsertBeat()}
            {this.renderInsertChild()}
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
            {showLine ? this.renderLine() : null}
          </Cell>
        )
      }
    }

    static propTypes = {
      bookId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      beats: PropTypes.object.isRequired,
      orientation: PropTypes.string,
      isSmall: PropTypes.bool,
      isMedium: PropTypes.bool,
      isLarge: PropTypes.bool,
      handleInsert: PropTypes.func.isRequired,
      handleInsertChild: PropTypes.func,
      isInBeatList: PropTypes.bool.isRequired,
      actions: PropTypes.object.isRequired,
      hovering: PropTypes.number,
      tour: PropTypes.object.isRequired,
      tourActions: PropTypes.object.isRequired,
      beatToLeft: PropTypes.object,
      lineId: PropTypes.number,
      showLine: PropTypes.bool,
      color: PropTypes.string,
      isLast: PropTypes.bool,
      isFirst: PropTypes.bool,
      tableLength: PropTypes.number,
      expanded: PropTypes.bool,
      toggleExpanded: PropTypes.func,
      scrollTo: PropTypes.func,
      hierarchyChildLevelName: PropTypes.string,
      hierarchyLevelName: PropTypes.string,
      hierarchyLevels: PropTypes.array.isRequired,
      hierarchyLevel: PropTypes.object.isRequired,
      atMaximumDepth: PropTypes.bool,
      readOnly: PropTypes.bool,
      isEmpty: PropTypes.bool,
    }
  }

  const {
    redux,
    pltr: { selectors, actions },
  } = connector
  checkDependencies({ redux, selectors, actions })

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(
      (state, ownProps) => {
        const beatToLeftId = ownProps.beatToLeft && ownProps.beatToLeft.id

        return {
          bookId: selectors.currentTimelineSelector(state.present),
          beats: selectors.beatsByBookSelector(state.present),
          orientation: selectors.orientationSelector(state.present),
          isSmall: selectors.isSmallSelector(state.present),
          isMedium: selectors.isMediumSelector(state.present),
          isLarge: selectors.isLargeSelector(state.present),
          hierarchyLevels: selectors.sortedHierarchyLevels(state.present),
          hierarchyLevel: selectors.hierarchyLevelSelector(state.present, ownProps.beatId),
          hierarchyLevelName: selectors.hierarchyLevelNameSelector(state.present, beatToLeftId),
          hierarchyChildLevelName: selectors.hierarchyChildLevelNameSelector(
            state.present,
            beatToLeftId
          ),
          atMaximumDepth: selectors.atMaximumHierarchyDepthSelector(state.present, beatToLeftId),
          tour: selectors.tourSelector(state.present),
          readOnly: !selectors.canWriteSelector(state.present),
        }
      },
      (dispatch) => {
        return {
          actions: bindActionCreators(actions.beat, dispatch),
          tourActions: bindActionCreators(actions.tour, dispatch),
        }
      }
    )(BeatInsertCell)
  }

  throw new Error('Could not connect BeatInsertCell')
}

export default BeatInsertCellConnector
