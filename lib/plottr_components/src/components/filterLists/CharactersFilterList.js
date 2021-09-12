import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { t as i18n } from 'plottr_locales'
import GenericFilterList from './GenericFilterList'

import { checkDependencies } from '../checkDependencies'

const CharacterFilterListConnector = (connector) => {
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

  const {
    redux,
    pltr: {
      selectors: { charactersSortedAtoZSelector },
    },
  } = connector
  checkDependencies({ redux, charactersSortedAtoZSelector })

  if (redux) {
    const { connect } = redux

    return connect((state) => {
      return {
        characters: charactersSortedAtoZSelector(state.present),
      }
    })(CharacterFilterList)
  }

  throw new Error('Could not connect CharacterFilterList.js')
}

export default CharacterFilterListConnector
