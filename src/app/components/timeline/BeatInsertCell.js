import React, { PureComponent } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { Cell } from 'react-sticky-table'
import { Glyphicon } from 'react-bootstrap'
import { t as i18n } from 'plottr_locales'
import cx from 'classnames'
import { selectors, helpers } from 'pltr/v2'
import VisualLine from './VisualLine'

const {
  orientedClassName: { orientedClassName },
} = helpers

class BeatInsertCell extends PureComponent {
  insert = () => {
    const { beatToLeft, lineId, handleInsert } = this.props
    handleInsert(beatToLeft.id, lineId)
  }

  insertChild = () => {
    const { beatToLeft, handleInsertChild } = this.props
    handleInsertChild(beatToLeft.id)
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
      handleInsertChild,
      isInBeatList,
      showLine,
      orientation,
      isLast,
      isSmall,
      isMedium,
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
    let titleText = isLast ? i18n('Add Chapter') : i18n('Insert Chapter')
    if (!isInBeatList) titleText = i18n('Insert Chapter and a Card')
    let insideDiv = (
      <>
        <div
          title={titleText}
          className={orientedClassName(isInBeatList ? beatKlass : insertBeatKlass, orientation)}
          onClick={this.insert}
        >
          <div className={wrapperKlass}>
            <Glyphicon glyph="plus" />
          </div>
        </div>
        {handleInsertChild ? (
          <div
            title={titleText}
            className={orientedClassName(isInBeatList ? beatKlass : insertBeatKlass, orientation)}
            onClick={this.insertChild}
          >
            <div className={wrapperKlass}>
              <Glyphicon glyph="plus" />
            </div>
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
    beatToLeft: PropTypes.object,
    lineId: PropTypes.number,
    showLine: PropTypes.bool,
    color: PropTypes.string,
    isLast: PropTypes.bool,
    tableLength: PropTypes.number,
  }
}

function mapStateToProps(state) {
  return {
    orientation: state.present.ui.orientation,
    isSmall: selectors.isSmallSelector(state.present),
    isMedium: selectors.isMediumSelector(state.present),
  }
}

function mapDispatchToProps(dispatch) {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(BeatInsertCell)
