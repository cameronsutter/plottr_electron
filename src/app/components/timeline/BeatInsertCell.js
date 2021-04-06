import React, { PureComponent } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { Cell } from 'react-sticky-table'
import { Glyphicon } from 'react-bootstrap'
import { t as i18n } from 'plottr_locales'
import { TiFlowChildren } from 'react-icons/ti'
import { FaExpandAlt, FaCompressAlt } from 'react-icons/fa'
import cx from 'classnames'
import { selectors, helpers, actions } from 'pltr/v2'
import VisualLine from './VisualLine'
import { bindActionCreators } from 'redux'

const {
  orientedClassName: { orientedClassName },
} = helpers

class BeatInsertCell extends PureComponent {
  insert = () => {
    const { beatToLeft, handleInsert } = this.props
    handleInsert(beatToLeft && beatToLeft.id)
    if(this.props.tour.run)this.props.tourActions.tourNext('next')
  }

  insertChild = () => {
    const { beatToLeft, handleInsertChild } = this.props
    handleInsertChild(beatToLeft && beatToLeft.id)
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
    const { showLine, orientation } = this.props

    return cx(orientedClassName('insert-beat-wrapper', orientation), {
      'insert-beat-spacer': showLine,
    })
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

    return orientedClassName(isInBeatList ? this.beatClass() : this.insertBeatClass(), orientation)
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
    const { isMedium, isInBeatList } = this.props

    return cx('beat-list__insert', {
      'medium-timeline': isInBeatList && isMedium,
    })
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
    const { isInBeatList, isMedium } = this.props

    return cx('beat-list__insert', {
      'medium-timeline': isInBeatList && isMedium,
    })
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
    const { handleInsertChild, toggleExpanded, expanded } = this.props

    return !handleInsertChild && toggleExpanded ? (
      <div
        onClick={toggleExpanded}
        className={cx(
          this.orientedClassSubIcon(),
          expanded === false ? 'beat-list__insert--always-visible' : {}
        )}
      >
        <div className={this.wrapperClassSubIcon()}>
          {expanded ? <FaCompressAlt /> : <FaExpandAlt />}
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
        <div className={this.wrapperClassSubIcon()}>
          <TiFlowChildren size={25} className="acts-tour-step7" />
        </div>
      </div>
    ) : null
  }

  renderInsertBeat() {
    const { isFirst } = this.props

    return (
      <div title={this.titleText()} className={this.orientedClass()} onClick={this.insert}>
        <div className={this.wrapperClass()}>
          <Glyphicon glyph="plus" className={!isFirst && "acts-tour-step6"}/>
        </div>
      </div>
    )
  }

  renderLastInsertBeat() {
    return (
      <div title={this.lastTitleText()} className={this.lastOrientedClass()} onClick={this.insert}>
        <div className={this.lastWrapperClass()}>
          <Glyphicon glyph="plus" />
        </div>
      </div>
    )
  }

  render() {
    const { showLine, orientation, isSmall, isLast } = this.props
    let insideDiv = null
    if (isLast) {
      insideDiv = this.renderLastInsertBeat()
    } else if (orientation === 'vertical') {
      insideDiv = (
        <div className="beat-list__interstitial-controls">
          {this.renderInsertBeat()}
          {this.renderInsertChild()}
          {this.renderToggleCollapse()}
        </div>
      )
    } else {
      insideDiv = (
        <>
          {this.renderInsertBeat()}
          {this.renderInsertChild()}
          {this.renderToggleCollapse()}
        </>
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
    bookId: PropTypes.number.isRequired,
    orientation: PropTypes.string,
    isSmall: PropTypes.bool,
    isMedium: PropTypes.bool,
    isLarge: PropTypes.bool,
    handleInsert: PropTypes.func.isRequired,
    handleInsertChild: PropTypes.func,
    isInBeatList: PropTypes.bool.isRequired,
    beatToLeft: PropTypes.object,
    lineId: PropTypes.number,
    showLine: PropTypes.bool,
    color: PropTypes.string,
    isLast: PropTypes.bool,
    isFirst: PropTypes.bool,
    tableLength: PropTypes.number,
    expanded: PropTypes.bool,
    toggleExpanded: PropTypes.func,
    hierarchyChildLevelName: PropTypes.string,
    hierarchyLevelName: PropTypes.string,
    atMaximumDepth: PropTypes.bool,
  }
}

function mapStateToProps(state, ownProps) {
  const beatToLeftId = ownProps.beatToLeft && ownProps.beatToLeft.id

  return {
    bookId: state.present.ui.currentTimeline,
    orientation: state.present.ui.orientation,
    isSmall: selectors.isSmallSelector(state.present),
    isMedium: selectors.isMediumSelector(state.present),
    isLarge: selectors.isLargeSelector(state.present),
    hierarchyLevelName: selectors.hierarchyLevelNameSelector(state.present, beatToLeftId),
    hierarchyChildLevelName: selectors.hierarchyChildLevelNameSelector(state.present, beatToLeftId),
    atMaximumDepth: selectors.atMaximumHierarchyDepthSelector(state.present, beatToLeftId),
    tour: selectors.tourSelector(state.present),
  }
}

function mapDispatchToProps(dispatch){
  return {
    tourActions:bindActionCreators(actions.tour,dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(BeatInsertCell)
