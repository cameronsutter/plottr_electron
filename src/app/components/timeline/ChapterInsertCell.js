import React, { PureComponent } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { Cell } from 'react-sticky-table'
import { Glyphicon } from 'react-bootstrap'
import orientedClassName from 'helpers/orientedClassName'
import i18n from 'format-message'
import {
  isZoomed,
  isZoomedOut,
  computeZoomMultiplier,
  computeZoomOutMultiplier,
} from 'helpers/zoom'

const Horizontal = {
  first: 150,
  last: 161 + 50,
}

const Vertical = {
  first: 100,
  last: 70 + 40,
}

class ChapterInsertCell extends PureComponent {
  insert = () => {
    const { chapterPosition, lineId, handleInsert } = this.props
    handleInsert(chapterPosition, lineId)
  }

  renderLine() {
    const { tableLength, orientation, color, zoom } = this.props

    let length = tableLength
    if (isZoomed(zoom)) length = tableLength * computeZoomMultiplier(orientation, zoom)
    if (isZoomedOut(zoom)) length = tableLength * computeZoomOutMultiplier(orientation, zoom)

    let lineStyle = {
      borderColor: color,
    }
    if (orientation == 'horizontal') {
      lineStyle.width = `${length - Horizontal.first - Horizontal.last}px`
    } else {
      lineStyle.height = `${length - Vertical.first - Vertical.last}px`
    }
    return (
      <div
        className={orientedClassName('line-title__line-line', orientation)}
        style={lineStyle}
      ></div>
    )
  }

  render() {
    const { isInChapterList, showLine, orientation, isLast } = this.props
    let wrapperKlass = orientedClassName('insert-scene-wrapper', orientation)
    let chapterKlass = 'scene-list__insert'
    let titleText = i18n('Insert Chapter')
    if (showLine) wrapperKlass += ' insert-scene-spacer'
    if (isLast) {
      titleText = i18n('Add Chapter')
      wrapperKlass += ' append-scene'
      chapterKlass += ' append-scene'
    }
    if (!isInChapterList) titleText = i18n('Insert Chapter and a Card')
    return (
      <Cell>
        <div
          title={titleText}
          className={orientedClassName(
            isInChapterList ? chapterKlass : 'line-list__insert-scene',
            orientation
          )}
          onClick={this.insert}
        >
          <div className={wrapperKlass}>
            <Glyphicon glyph="plus" />
          </div>
        </div>
        {showLine ? this.renderLine() : null}
      </Cell>
    )
  }

  static propTypes = {
    orientation: PropTypes.string,
    zoom: PropTypes.object,
    handleInsert: PropTypes.func.isRequired,
    isInChapterList: PropTypes.bool.isRequired,
    chapterPosition: PropTypes.number,
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
    zoom: { zoomState: state.present.ui.zoomState, zoomIndex: state.present.ui.zoomIndex },
  }
}

function mapDispatchToProps(dispatch) {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(ChapterInsertCell)
