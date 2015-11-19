import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import SceneView from 'components/sceneView'
import _ from 'lodash'

class ChapterView extends Component {
  render () {
    return (<li className='chapter-list__item'>
      {this.props.chapter.title}
      <ul className='scene-list'>
        {this.renderScenes()}
      </ul>
    </li>)
  }

  getScenes () {
    return _.filter(this.props.scenes, (s) => {
      return s.chapterId === this.props.chapter.id
    })
  }

  renderScenes () {
    var scenes = this.getScenes()
    return scenes.map((s) => {
      return <SceneView key={'sceneId-' + s.id} scene={s} />
    })
  }
}

ChapterView.propTypes = {
  chapter: PropTypes.object.isRequired,
  scenes: PropTypes.array.isRequired
}

function mapStateToProps (state) {
  return {
    scenes: state.scenes
  }
}

function mapDispatchToProps (dispatch) {
  return {}
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ChapterView)
