import _ from 'lodash'
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Glyphicon } from 'react-bootstrap'
import * as TagActions from 'actions/tags'
import TagView from 'components/tag/tagView'

class TagListView extends Component {

  handleCreateNewTag = () => {
    this.props.actions.addTag()
  }

  renderTags () {
    const sortedTags = _.sortBy(this.props.tags, ['title', 'id'])
    return sortedTags.map(t =>
      <TagView key={t.id} tag={t} />
    )
  }

  render () {
    let klasses = 'secondary-text'
    let newKlasses = 'tag-list__new'
    if (this.props.ui.darkMode) {
      klasses += ' darkmode'
      newKlasses += ' darkmode'
    }
    return (
      <div className='tag-list__container'>
        <h3 className={klasses}>Tags</h3>
        <div className='tag-list__tags'>
          {this.renderTags()}
        </div>
        <div className={newKlasses} onClick={this.handleCreateNewTag} >
          <Glyphicon glyph='plus' />
        </div>
      </div>
    )
  }
}

TagListView.propTypes = {
  tags: PropTypes.array.isRequired,
  actions: PropTypes.object.isRequired,
  ui: PropTypes.object.isRequired,
}

function mapStateToProps (state) {
  return {
    tags: state.tags,
    ui: state.ui,
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
