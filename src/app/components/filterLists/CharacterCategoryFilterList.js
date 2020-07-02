import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import i18n from 'format-message'
import GenericFilterList from './GenericFilterList'
import { sortedCharacterCategoriesSelector } from '../../selectors/categories'

class CharacterCategoryFilterList extends Component {
  updateItems = (ids) => {
    this.props.updateItems('category', ids)
  }

  render () {
    return <GenericFilterList
      items={this.props.categories}
      title={i18n('Categories')}
      displayAttribute={'name'}
      updateItems={this.updateItems}
      filteredItems={this.props.filteredItems}
    />
  }
}


CharacterCategoryFilterList.propTypes = {
  categories: PropTypes.array.isRequired,
  updateItems: PropTypes.func.isRequired,
  filteredItems: PropTypes.array,
}

function mapStateToProps (state) {
  return {
    categories: sortedCharacterCategoriesSelector(state.present),
  }
}

function mapDispatchToProps (dispatch) {
  return {}
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CharacterCategoryFilterList)
