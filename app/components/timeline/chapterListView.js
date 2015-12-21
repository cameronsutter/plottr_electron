import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import ChapterView from 'components/timeline/chapterView'
import 'style!css!sass!css/chapter_list_block.css.scss'

class ChapterListView extends Component {
  render () {
    var chapters = this.renderChapters()
    return (
      <ul className='chapter-list'>
        <li className='chapter-list__placeholder' />
        {chapters}
        <li className='chapter-list__new' />
      </ul>
    )
  }

  renderChapters () {
    return this.props.chapters.map((chapter) => {
      return (
        <ChapterView key={'chapterId-' + chapter.id} chapter={chapter} />
      )
    })
  }
}

ChapterListView.propTypes = {
  chapters: PropTypes.array.isRequired
}

function mapStateToProps (state) {
  return {
    chapters: state.chapters
  }
}

function mapDispatchToProps (dispatch) {
  return {}
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ChapterListView)
