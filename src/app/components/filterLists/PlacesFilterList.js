import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import i18n from 'format-message'
import { placesSortedAtoZSelector } from '../../selectors/places'
import GenericFilterList from './GenericFilterList'

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

function mapStateToProps(state) {
  return {
    places: placesSortedAtoZSelector(state.present),
  }
}

function mapDispatchToProps(dispatch) {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(PlaceFilterList)
