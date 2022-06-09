import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { t } from 'plottr_locales'

import Glyphicon from './Glyphicon'
import { checkDependencies } from './checkDependencies'

const SortListConnector = (connector) => {
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

    renderList() {
      let sort = this.props.sortAttr.split('~')
      let attrName = sort[0]
      let direction = sort[1]
      return this.props.items.map((i) => {
        let arrow = null
        let item = <span className="not-active">{i}</span>
        if (i === attrName) {
          item = <em>{i}</em>
          arrow =
            direction === 'asc' ? <Glyphicon glyph="arrow-up" /> : <Glyphicon glyph="arrow-down" />
        }
        return (
          <li key={`attr-${i}`} onClick={() => this.toggle(i)}>
            {arrow} {item}
          </li>
        )
      })
    }

    render() {
      return <ul className="sort-list">{this.renderList()}</ul>
    }
  }

  SortList.propTypes = {
    items: PropTypes.array.isRequired,
    sortAttr: PropTypes.string.isRequired,
    update: PropTypes.func.isRequired,
  }

  const {
    redux,
    pltr: {
      actions,
      selectors: {
        characterSortCAnamesSelector,
        placeSortCAnamesSelector,
        noteSortCAnamesSelector,
      },
    },
  } = connector

  checkDependencies({
    redux,
    actions,
    characterSortCAnamesSelector,
    placeSortCAnamesSelector,
    noteSortCAnamesSelector,
  })

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(
      (state, props) => {
        let attr, customAttributes, items
        if (props.type == 'characters') {
          customAttributes = characterSortCAnamesSelector(state.present)
          attr = state.present.ui.characterSort
          items = [t('name'), t('description'), ...customAttributes]
        } else if (props.type == 'places') {
          customAttributes = placeSortCAnamesSelector(state.present)
          attr = state.present.ui.placeSort
          items = [t('name'), t('description'), ...customAttributes]
        } else {
          customAttributes = noteSortCAnamesSelector(state.present)
          attr = state.present.ui.noteSort
          items = [t('title'), t('last edited'), ...customAttributes]
        }
        return {
          customAttributes,
          sortAttr: attr,
          items,
        }
      },
      (dispatch, props) => {
        const uiActions = bindActionCreators(actions.ui, dispatch)
        if (props.type == 'characters') {
          return { update: uiActions.setCharacterSort }
        } else if (props.type == 'places') {
          return { update: uiActions.setPlaceSort }
        } else return { update: uiActions.setNoteSort }
      }
    )(SortList)
  }

  throw new Error('Could not connect SortList.js')
}

export default SortListConnector
