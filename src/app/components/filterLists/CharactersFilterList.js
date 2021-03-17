import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { t as i18n } from 'plottr_locales'
import GenericFilterList from './GenericFilterList'
import { selectors } from 'pltr/v2'

const { charactersSortedAtoZSelector } = selectors

class CharacterFilterList extends Component {
  updateItems = (ids) => {
    this.props.updateItems('character', ids)
  }

  render() {
    return (
      <GenericFilterList
        items={this.props.characters}
        title={i18n('Characters')}
        displayAttribute={'name'}
        updateItems={this.updateItems}
        filteredItems={this.props.filteredItems}
      />
    )
  }
}

CharacterFilterList.propTypes = {
  characters: PropTypes.array.isRequired,
  updateItems: PropTypes.func.isRequired,
  filteredItems: PropTypes.array,
}

function mapStateToProps(state) {
  return {
    characters: charactersSortedAtoZSelector(state.present),
  }
}

function mapDispatchToProps(dispatch) {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(CharacterFilterList)
