import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import TagListView from 'components/tag/tagListView'

class TagsView extends Component {

  render () {
    return (
      <div className='tag-list'>
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
