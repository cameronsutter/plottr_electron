import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { t as i18n } from 'plottr_locales'
import GenericFilterList from './GenericFilterList'

import { checkDependencies } from '../checkDependencies'

const TagFilterListConnector = (connector) => {
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

  const {
    redux,
    pltr: {
      selectors: { sortedTagsSelector },
    },
  } = connector
  checkDependencies({ redux, sortedTagsSelector })

  if (redux) {
    const { connect } = redux

    return connect((state) => {
      return {
        tags: sortedTagsSelector(state.present),
      }
    })(TagFilterList)
  }

  throw new Error('Could not connect TagFilterList.js')
}

export default TagFilterListConnector
