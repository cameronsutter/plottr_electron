import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import i18n from 'format-message'
import { sortedTagsSelector } from '../../selectors/tags'
import GenericFilterList from './GenericFilterList'

class TagFilterList extends Component {
  updateItems = (ids) => {
    this.props.updateItems('tag', ids)
  }

  render() {
    return (
      <GenericFilterList
        items={this.props.tags}
        title={i18n('Tags')}
        displayAttribute={'title'}
        updateItems={this.updateItems}
        filteredItems={this.props.filteredItems}
      />
    )
  }
}

TagFilterList.propTypes = {
  tags: PropTypes.array.isRequired,
  updateItems: PropTypes.func.isRequired,
  filteredItems: PropTypes.array,
}

function mapStateToProps(state) {
  return {
    tags: sortedTagsSelector(state.present),
  }
}

function mapDispatchToProps(dispatch) {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(TagFilterList)
