import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Glyphicon } from 'react-bootstrap'
import * as UIActions from 'actions/ui'
import i18n from 'format-message'
import { characterSortCAnamesSelector, placeSortCAnamesSelector } from '../selectors/customAttributes'

class SortList extends Component {
  toggle = (attr) => {
    let sort = this.props.sortAttr.split('~')
    let current = sort[0]
    let direction = sort[1]
    if (attr === current) {
      let newDirection = direction === 'asc' ? 'desc' : 'asc'
      this.props.update(attr, newDirection)
    } else {
      this.props.update(attr, 'asc')
    }
  }

  renderList () {
    let sort = this.props.sortAttr.split('~')
    let attrName = sort[0]
    let direction = sort[1]
    return this.props.items.map(i => {
      let arrow = null
      let item = <span className='not-active'>{i}</span>
      if (i === attrName) {
        item = <em>{i}</em>
        arrow = direction === 'asc' ?
          <Glyphicon glyph='arrow-up' /> :
          <Glyphicon glyph='arrow-down' />
      }
      return <li key={`attr-${i}`} onClick={() => this.toggle(i)}>
        {arrow} {item}
      </li>
    })
  }

  render () {
    return (
      <ul className='sort-list'>
        { this.renderList() }
      </ul>
    )
  }
}

SortList.propTypes = {
  type: PropTypes.string.isRequired,
  items: PropTypes.array.isRequired,
  sortAttr: PropTypes.string.isRequired,
  update: PropTypes.func.isRequired,
}

function mapStateToProps (state, props) {
  let attr, customAttributes
  if (props.type == 'characters') {
    customAttributes = characterSortCAnamesSelector(state.present)
    attr = state.present.ui.characterSort
  } else {
    customAttributes = placeSortCAnamesSelector(state.present)
    attr = state.present.ui.placeSort
  }
  let items = [i18n('name'), i18n('description'), ...customAttributes]
  return {
    customAttributes,
    sortAttr: attr,
    items,
  }
}

function mapDispatchToProps (dispatch, props) {
  let actions = bindActionCreators(UIActions, dispatch)
  return {
    update: props.type == 'characters' ? actions.setCharacterSort : actions.setPlaceSort
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SortList)
