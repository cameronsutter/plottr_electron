import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { t as i18n } from 'plottr_locales'
import GenericFilterList from './GenericFilterList'

import { checkDependencies } from '../checkDependencies'

const PlaceFilterListConnector = (connector) => {
  class PlaceFilterList extends Component {
    updateItems = (ids) => {
      this.props.updateItems('place', ids)
    }

    render() {
      return (
        <GenericFilterList
          items={this.props.places}
          title={i18n('Places')}
          displayAttribute={'name'}
          updateItems={this.updateItems}
          filteredItems={this.props.filteredItems}
        />
      )
    }
  }

  PlaceFilterList.propTypes = {
    places: PropTypes.array.isRequired,
    updateItems: PropTypes.func.isRequired,
    filteredItems: PropTypes.array,
  }

  const {
    redux,
    pltr: {
      selectors: { placesSortedAtoZSelector },
    },
  } = connector
  checkDependencies({ redux, placesSortedAtoZSelector })

  if (redux) {
    const { connect } = redux

    return connect((state) => {
      return {
        places: placesSortedAtoZSelector(state.present),
      }
    })(PlaceFilterList)
  }

  throw new Error('Could not connect PlaceFilterListConnector')
}

export default PlaceFilterListConnector
