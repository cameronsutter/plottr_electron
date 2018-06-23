import _ from 'lodash'
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Glyphicon } from 'react-bootstrap'
import * as UIActions from 'actions/ui'

class CustomAttrFilterList extends Component {
  constructor (props) {
    super(props)
    let filteredItems = props.filteredItems
    if (!filteredItems) {
      filteredItems = this.defaultFilteredItemsObj()
    }
    this.state = {
      filteredItems,
    }
  }

  defaultFilteredItemsObj () {
    return this.props.customAttributes.reduce((result, attr) => {
      result[attr] = []
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

  isChecked (value, attr) {
    return this.state.filteredItems[attr].indexOf(value) !== -1
  }

  values (attr) {
    let values = this.props.items.map((item) => item[attr])
    return _.uniq(values.filter((v) => v && v != ''))
  }

  renderFilterList (array, attr) {
    var items = array.map((i) => this.renderFilterItem(i, attr))
    return (
      <ul className='filter-list__list'>
        {items}
        {this.renderBlank(attr)}
      </ul>
    )
  }

  renderFilterItem (value, attr) {
    var checked = 'unchecked'
    if (this.isChecked(value, attr)) {
      checked = 'eye-open'
    }
    return (<li key={`${value}-${attr}`} onMouseDown={() => this.filterItem(value, attr)}>
        <Glyphicon glyph={checked} /> {value}
      </li>
    )
  }

  renderBlank (attr) {
    var checked = 'unchecked'
    if (this.isChecked('', attr)) {
      checked = 'eye-open'
    }
    return <li onMouseDown={() => this.filterItem('', attr)}>
      <Glyphicon glyph={checked} /> <em>[blank]</em>
    </li>
  }

  renderList = (attr) => {
    return [
      <p onClick={() => this.filterList(attr)}><em>{attr}</em></p>,
      this.renderFilterList(this.values(attr), attr),
    ]
  }

  render () {
    let lists = this.props.customAttributes.map(this.renderList)
    return (
      <div className='filter-list'>
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
