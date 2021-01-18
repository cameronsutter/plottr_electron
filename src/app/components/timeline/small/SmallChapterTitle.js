import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import cx from 'classnames'
import * as SceneActions from 'actions/scenes'
import * as BeatActions from 'actions/beats'
import orientedClassName from 'helpers/orientedClassName'
import { editingChapterLabel, chapterPositionTitle } from '../../../helpers/chapters'
import { isSeriesSelector, isSmallSelector, isMediumSelector } from '../../../selectors/ui'
import { makeChapterTitleSelector, makeChapterSelector, positionOffsetSelector } from '../../../selectors/chapters'
import DeleteConfirmModal from '../../dialogs/DeleteConfirmModal'
import { truncateTitle } from 'helpers/cards'

function SmallChapterTitle (props) {
  return <th className='rotate-45'>
    <div>
      <span>{ truncateTitle(props.chapterTitle, 50) }</span>
    </div>
  </th>
}

const makeMapState = (state) => {
  const uniqueChapterSelector = makeChapterSelector()
  const uniqueChapterTitleSelector = makeChapterTitleSelector()

  return function mapStateToProps (state, ownProps) {
    return {
      chapters: state.present.chapters,
      chapter: uniqueChapterSelector(state.present, ownProps.chapterId),
      ui: state.present.ui,
      isSeries: isSeriesSelector(state.present),
      chapterTitle: uniqueChapterTitleSelector(state.present, ownProps.chapterId),
      positionOffset: positionOffsetSelector(state.present),
      isSmall: isSmallSelector(state.present),
      isMedium: isMediumSelector(state.present),
    }
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(SceneActions, dispatch),
    beatActions: bindActionCreators(BeatActions, dispatch),
  }
}

export default connect(
  makeMapState,
  mapDispatchToProps
)(SmallChapterTitle)