import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { Glyphicon } from 'react-bootstrap'

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
    pltr: { actions },
  } = connector

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(null, (dispatch, props) => {
      const uiActions = bindActionCreators(actions.ui, dispatch)
      return {
        update: props.type == 'characters' ? uiActions.setCharacterSort : uiActions.setPlaceSort,
      }
    })(SortList)
  }

  throw new Error('Could not connect SortList.js')
}

export default SortListConnector
