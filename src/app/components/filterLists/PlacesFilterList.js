import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { t as i18n } from 'plottr_locales'
import GenericFilterList from './GenericFilterList'
import { selectors } from 'pltr/v2'

const { placesSortedAtoZSelector } = selectors

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
