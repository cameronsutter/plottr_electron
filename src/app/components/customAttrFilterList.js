import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Glyphicon } from 'react-bootstrap'
import * as UIActions from 'actions/ui'
import cx from 'classnames'

class CustomAttrFilterList extends Component {
  constructor (props) {
    super(props)
    let filteredItems = props.filteredItems
    if (!filteredItems || !Object.keys(filteredItems).length) {
      filteredItems = this.defaultFilteredItemsObj()
    }
    this.state = {
      filteredItems,
    }
  }

  defaultFilteredItemsObj () {
    // TODO: this should be a selector
    return this.props.customAttributes.reduce((result, attr) => {
      if (attr.type == 'text') result[attr.name] = []
      return result
    }, {})
  }

  filterItem (value, attr) {
    var filteredItems = this.state.filteredItems
    if (!filteredItems[attr].includes(value)) {
      filteredItems[attr].push(value)
    } else {
      var index = filteredItems[attr].indexOf(value)
      if (index !== -1) filteredItems[attr].splice(index, 1)
    }
    this.props.update(filteredItems)
    this.setState({ filteredItems })
  }

  filterList (attr) {
    var filteredItems = this.state.filteredItems
    if (filteredItems[attr].length > 0) {
      filteredItems[attr] = []
    } else {
      filteredItems[attr] = this.values(attr)
    }
    this.props.update(filteredItems)
    this.setState({filteredItems: filteredItems})
  }

  isChecked (value, attrName) {
    return this.state.filteredItems[attrName].indexOf(value) !== -1
  }

  values (attrName) {
    // TODO: this should be a selector
    let values = this.props.items.map((item) => item[attrName])
    return _.uniq(values.filter((v) => v && v != ''))
  }

  renderFilterList (array, attr) {
    var items = array.map((i) => this.renderFilterItem(i, attr))
    return (
      <ul key={`${attr.name}-${items}`} className='filter-list__list'>
        {items}
        {this.renderBlank(attr)}
      </ul>
    )
  }

  renderFilterItem (value, attr) {
    var checked = 'unchecked'
    if (this.isChecked(value, attr.name)) {
      checked = 'eye-open'
    }
    return <li key={`${value}-${attr.name}`} onMouseDown={() => this.filterItem(value, attr.name)}>
      <Glyphicon glyph={checked} /> {value.substr(0, 18)}
    </li>
  }

  renderBlank (attr) {
    var checked = 'unchecked'
    if (this.isChecked('', attr.name)) {
      checked = 'eye-open'
    }
    return <li onMouseDown={() => this.filterItem('', attr.name)}>
      <Glyphicon glyph={checked} /> <em>--</em>
    </li>
  }

  renderList = (attr) => {
    const {name, type} = attr
    if (type != 'text') return null

    return <div key={name}>
      <p onClick={() => this.filterList(attr.name)}><em>{name}</em></p>
      { this.renderFilterList(this.values(attr.name), attr) }
    </div>
  }

  render () {
    let lists = this.props.customAttributes.map(this.renderList)
    return (
      <div className='filter-list flex'>
        { lists }
      </div>
    )
  }
}


CustomAttrFilterList.propTypes = {
  type: PropTypes.string.isRequired,
  update: PropTypes.func.isRequired,
  customAttributes: PropTypes.array.isRequired,
  items: PropTypes.array.isRequired,
  filteredItems: PropTypes.object,
}

function mapStateToProps (state, props) {
  let filteredItems = state.ui.characterFilter
  if (props.type == 'places') filteredItems = state.ui.placeFilter
  return {
    customAttributes: state.customAttributes[props.type],
    items: props.type == 'characters' ? state.characters : state.places,
    filteredItems,
  }
}

function mapDispatchToProps (dispatch, props) {
  let actions = bindActionCreators(UIActions, dispatch)
  return {
    update: props.type == 'characters' ? actions.setCharacterFilter : actions.setPlaceFilter
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CustomAttrFilterList)
