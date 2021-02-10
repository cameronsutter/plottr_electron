import React, { PureComponent } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { Cell } from 'react-sticky-table'
import { Glyphicon } from 'react-bootstrap'
import i18n from 'format-message'
import cx from 'classnames'
import { selectors, helpers } from 'pltr/v2'
import VisualLine from './VisualLine'

const {
  orientedClassName: { orientedClassName },
} = helpers

class BeatInsertCell extends PureComponent {
  insert = () => {
    const { beatPosition, lineId, handleInsert } = this.props
    handleInsert(beatPosition, lineId)
  }

  renderLine() {
    const { tableLength, orientation, color } = this.props
    return <VisualLine tableLength={tableLength} orientation={orientation} color={color} />
  }

  render() {
    const { isInBeatList, showLine, orientation, isLast, isSmall } = this.props
    let wrapperKlass = orientedClassName('insert-beat-wrapper', orientation)
    let beatKlass = 'beat-list__insert'
    let titleText = i18n('Insert Beat')
    if (showLine) wrapperKlass += ' insert-beat-spacer'
    if (isLast) {
      titleText = i18n('Add Chapter')
      wrapperKlass += ' append-beat'
      beatKlass += ' append-beat'
    }
    if (!isInBeatList) titleText = i18n('Insert Chapter and a Card')
    let insideDiv = (
      <div
        title={titleText}
        className={orientedClassName(
          isInBeatList ? beatKlass : 'line-list__insert-beat',
          orientation
        )}
        onClick={this.insert}
      >
        <div className={wrapperKlass}>
          <Glyphicon glyph="plus" />
        </div>
      </div>
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
    handleInsert: PropTypes.func.isRequired,
    isInBeatList: PropTypes.bool.isRequired,
    beatPosition: PropTypes.number,
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
  }
}

function mapDispatchToProps(dispatch) {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(BeatInsertCell)
