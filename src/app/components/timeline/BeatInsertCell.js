import React, { PureComponent } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { Cell } from 'react-sticky-table'
import { Glyphicon } from 'react-bootstrap'
import { t as i18n } from 'plottr_locales'
import { TiFlowChildren } from 'react-icons/ti'
import { FaExpandAlt, FaCompressAlt } from 'react-icons/fa'
import cx from 'classnames'
import { selectors, helpers } from 'pltr/v2'
import VisualLine from './VisualLine'

const {
  orientedClassName: { orientedClassName },
} = helpers
class BeatInsertCell extends PureComponent {
  insert = () => {
    const { beatToRight, lineId, handleInsert } = this.props
    handleInsert(beatToRight && beatToRight.id, lineId)
  }

  insertChild = () => {
    const { beatToRight, handleInsertChild } = this.props
    handleInsertChild(beatToRight && beatToRight.id)
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

  render() {
    const {
      isFirst,
      handleInsertChild,
      isInBeatList,
      showLine,
      orientation,
      isLast,
      isSmall,
      isMedium,
      expanded,
      toggleExpanded,
      hierarchyLevelName,
      hierarchyChildLevelName,
    } = this.props
    const wrapperKlass = cx(orientedClassName('insert-beat-wrapper', orientation), {
      'insert-beat-spacer': showLine,
      'append-beat': isLast,
    })
    const beatKlass = cx('beat-list__insert', {
      'append-beat': isLast,
      'medium-timeline': isInBeatList && isMedium,
    })
    const insertBeatKlass = cx('line-list__insert-beat', {
      'medium-timeline': isMedium,
    })
    const orientedClass = orientedClassName(isInBeatList ? beatKlass : insertBeatKlass, orientation)
    let titleText = isLast
      ? i18n(`Add ${hierarchyLevelName}`)
      : i18n(`Insert ${hierarchyLevelName}`)
    let childTitleText = isLast
      ? i18n(`Add ${hierarchyChildLevelName}`)
      : i18n(`Insert ${hierarchyChildLevelName}`)
    if (!isInBeatList) titleText = i18n(`Insert ${hierarchyLevelName} and a Card`)
    let insideDiv = (
      <>
        <div title={titleText} className={orientedClass} onClick={this.insert}>
          <div className={wrapperKlass}>
            <Glyphicon glyph="plus" />
          </div>
        </div>
        {handleInsertChild && !isFirst ? (
          <div title={childTitleText} className={orientedClass} onClick={this.insertChild}>
            <div className={wrapperKlass}>
              <TiFlowChildren size={25} />
            </div>
          </div>
        ) : null}
        {!handleInsertChild && toggleExpanded ? (
          <div
            onClick={toggleExpanded}
            className={cx(
              orientedClass,
              expanded === false ? 'beat-list__insert--always-visible' : {}
            )}
          >
            <div className={wrapperKlass}>{expanded ? <FaCompressAlt /> : <FaExpandAlt />}</div>
          </div>
        ) : null}
      </>
    )

    if (isSmall) {
      const isHorizontal = orientation == 'horizontal'
      const klasses = { 'rotate-45': isHorizontal, 'row-header': !isHorizontal }
      return <th className={cx(klasses)}>{insideDiv}</th>
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
    orientation: PropTypes.string,
    isSmall: PropTypes.bool,
    isMedium: PropTypes.bool,
    handleInsert: PropTypes.func.isRequired,
    handleInsertChild: PropTypes.func,
    isInBeatList: PropTypes.bool.isRequired,
    beatToRight: PropTypes.object,
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
  }
}

function mapStateToProps(state, ownProps) {
  const beatToRightId = ownProps.beatToRight && ownProps.beatToRight.id

  return {
    orientation: state.present.ui.orientation,
    isSmall: selectors.isSmallSelector(state.present),
    isMedium: selectors.isMediumSelector(state.present),
    hierarchyLevelName: selectors.hierarchyLevelNameSelector(state.present, beatToRightId),
    hierarchyChildLevelName: selectors.hierarchyChildLevelNameSelector(
      state.present,
      beatToRightId
    ),
  }
}

export default connect(mapStateToProps, null)(BeatInsertCell)
