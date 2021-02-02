import React, { PureComponent } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import cx from 'classnames'
import { Cell } from 'react-sticky-table'
import { Glyphicon } from 'react-bootstrap'
import i18n from 'format-message'
import { selectors, helpers } from 'pltr/v2'
import VisualLine from './VisualLine'

const {
  orientedClassName: { orientedClassName },
} = helpers

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
    const { tableLength, orientation, color } = this.props
    return <VisualLine tableLength={tableLength} orientation={orientation} color={color} />
  }

  render() {
    const { isInChapterList, showLine, orientation, isLast, isSmall } = this.props
    let wrapperKlass = orientedClassName('insert-chapter-wrapper', orientation)
    let chapterKlass = 'chapter-list__insert'
    let titleText = i18n('Insert Chapter')
    if (showLine) wrapperKlass += ' insert-chapter-spacer'
    if (isLast) {
      titleText = i18n('Add Chapter')
      wrapperKlass += ' append-chapter'
      chapterKlass += ' append-chapter'
    }
    if (!isInChapterList) titleText = i18n('Insert Chapter and a Card')
    let insideDiv = (
      <div
        title={titleText}
        className={orientedClassName(
          isInChapterList ? chapterKlass : 'line-list__insert-chapter',
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
    isSmall: selectors.isSmallSelector(state.present),
  }
}

function mapDispatchToProps(dispatch) {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(ChapterInsertCell)
