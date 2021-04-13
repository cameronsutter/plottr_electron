import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { t as i18n } from 'plottr_locales'
import GenericFilterList from './GenericFilterList'

class CardColorFilterList extends Component {
  updateItems = (color) => {
    this.props.updateItems('color', color)
  }

  render() {
    let colorObjects = this.props.colors.map((color, idx) => {
      //switch to ensure the names (not the hex values) of the default colors display
      switch (color) {
        case '#6cace4':
          return {
            id: color,
            name: 'Blue (default)',
          }
        case '#78be20':
          return {
            id: color,
            name: 'Green (default)',
          }
        case '#e5554f':
          return {
            id: color,
            name: 'Red (default)',
          }
        case '#ff7f32':
          return {
            id: color,
            name: 'Orange (default)',
          }
        case '#ffc72c':
          return {
            id: color,
            name: 'Yellow (default)',
          }
        case '#0b1117':
          return {
            id: color,
            name: 'Black (default)',
          }
        case '#f1f5f8':
          return {
            id: color,
            name: 'White (default)',
          }
        default:
          return {
            id: color,
            name: color,
          }
      }
    })
    return (
      <GenericFilterList
        items={colorObjects}
        title={i18n('Colors')}
        displayAttribute={'name'}
        updateItems={this.updateItems}
        filteredItems={this.props.filteredItems}
      />
    )
  }
}

CardColorFilterList.propTypes = {
  colors: PropTypes.array.isRequired,
  updateItems: PropTypes.func.isRequired,
  filteredItems: PropTypes.array,
}

export default CardColorFilterList
