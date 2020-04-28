import React, { PureComponent } from 'react'
import PropTypes from 'react-proptypes'
import { Cell } from 'react-sticky-table'
import { Glyphicon } from 'react-bootstrap'
import orientedClassName from 'helpers/orientedClassName'
import i18n from 'format-message'

const FIRST_CELL = 200
const LAST_CELL = 161 + 50

export default class ChapterInsertCell extends PureComponent {
  renderLine () {
    const lineStyle = {
      borderColor: this.props.color,
      width: `${this.props.tableWidth - FIRST_CELL - LAST_CELL}px`,
    }
    return <div className='line-title__line-line' style={lineStyle}></div>
  }

  render () {
    const { chapterPosition, lineId, isInChapterList, handleInsert, needsSVGline, color, orientation, isLast } = this.props
    let wrapperKlass = orientedClassName('insert-scene-wrapper', orientation)
    let chapterKlass = 'scene-list__insert'
    let titleText = i18n('Insert Chapter')
    if (needsSVGline) wrapperKlass += ' insert-scene-spacer'
    if (isLast) {
      titleText = i18n('Add Chapter')
      wrapperKlass += ' append-scene'
      chapterKlass += ' append-scene'
    }
    if (!isInChapterList) titleText = i18n('Insert Chapter and a Card')
    return <Cell>
      <div
        title={titleText}
        className={orientedClassName(isInChapterList ? chapterKlass : 'line-list__insert-scene', orientation)}
        onClick={() => handleInsert(chapterPosition, lineId)}
        >
        <div className={wrapperKlass}>
          <Glyphicon glyph='plus' />
        </div>
      </div>
      {needsSVGline ? this.renderLine() : null}
    </Cell>
  }

  static propTypes = {
    handleInsert: PropTypes.func.isRequired,
    isInChapterList: PropTypes.bool.isRequired,
    chapterPosition: PropTypes.number,
    lineId: PropTypes.number,
    needsSVGline: PropTypes.bool,
    orientation: PropTypes.string,
    color: PropTypes.string,
    isLast: PropTypes.bool,
    tableWidth: PropTypes.number,
  }
}
