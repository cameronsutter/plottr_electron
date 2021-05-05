import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { t } from 'plottr_locales'
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
            name: t('Blue (default)'),
          }
        case '#78be20':
          return {
            id: color,
            name: t('Green (default)'),
          }
        case '#e5554f':
          return {
            id: color,
            name: t('Red (default)'),
          }
        case '#ff7f32':
          return {
            id: color,
            name: t('Orange (default)'),
          }
        case '#ffc72c':
          return {
            id: color,
            name: t('Yellow (default)'),
          }
        case '#0b1117':
          return {
            id: color,
            name: t('Black (default)'),
          }
        case '#f1f5f8':
          return {
            id: color,
            name: t('White (default)'),
          }
        case null:
          return {
            id: null,
            name: t('[Blank]'),
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
        title={t('Colors')}
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
