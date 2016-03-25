import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import TagListView from 'components/tag/tagListView'

class TagsView extends Component {

  render () {
    return (
      <div className='tags-view'>
        <TagListView />
      </div>
    )
  }
}

TagsView.propTypes = {}

function mapStateToProps (state) {
  return {}
}

function mapDispatchToProps (dispatch) {
  return {}
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TagsView)
