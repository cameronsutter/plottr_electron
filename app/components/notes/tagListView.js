import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Glyphicon } from 'react-bootstrap'
import * as TagActions from 'actions/tags'
import TagView from 'components/notes/tagView'
import 'style!css!sass!css/tag_list_block.css.scss'

class TagListView extends Component {

  handleCreateNewTag () {
    this.props.actions.addTag()
  }

  renderTags () {
    return this.props.tags.map(t =>
      <TagView key={t.id} tag={t} />
    )
  }

  render () {
    return (
      <div className='tag-list'>
        <h3>Tags</h3>
        {this.renderTags()}
        <div className='tag-list__new' onClick={this.handleCreateNewTag.bind(this)} >
          <Glyphicon glyph='plus' />
        </div>
      </div>
    )
  }
}

TagListView.propTypes = {
  tags: PropTypes.array.isRequired,
  actions: PropTypes.object.isRequired
}

function mapStateToProps (state) {
  return {
    tags: state.tags
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(TagActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TagListView)
