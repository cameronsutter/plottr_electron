import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { ButtonToolbar, Button, DropdownButton,
  MenuItem, Input, Glyphicon, Popover, OverlayTrigger } from 'react-bootstrap'
import TagLabel from './tagLabel'

export default class SelectList extends Component {

  renderSelected () {
    if (this.props.type === 'Tags') {
      return this.renderSelectedTags ()
    } else {
      return this.renderSelectedItems ()
    }
  }

  renderSelectedTags () {
    return this.props.selectedItems.map(tId => {
      var tag = _.find(this.props.allItems, {id: tId})
      if (!tag) return null
      return <li key={tId}>
        <Button onClick={() => this.props.remove(this.props.parentId, tId)} bsSize='xsmall'>
          <Glyphicon glyph='remove'/>
        </Button>
        <TagLabel tag={tag} />
      </li>
    })
  }

  renderSelectedItems () {
    return this.props.selectedItems.map(itemId => {
      var item = _.find(this.props.allItems, {id: itemId})
      if (!item) return null
      return <li key={itemId}>
        <Button onClick={() => this.props.remove(this.props.parentId, itemId)} bsSize='xsmall'><Glyphicon glyph='remove'/></Button>
        {item.name}
      </li>
    })
  }

  renderUnSelected () {
    const type = this.props.type
    const itemsToList = this.props.allItems.filter(i =>
      !this.props.selectedItems.includes(i.id)
    )
    let listItems = <small><i>no more to add</i></small>
    if (itemsToList.length > 0) {
      listItems = itemsToList.map(i => {
        let colorSpan = <span></span>
        if (type === 'Tags') {
          colorSpan = <span className='colored' style={{backgroundColor: i.color}}></span>
        }
        return <li key={`${type}-${i.id}`} onClick={() => this.props.add(this.props.parentId, i.id)}>{colorSpan}{i.name || i.title}</li>
      })
    }
    return <Popover id='list-popover' title={`${type} list`}>
      <ul className='select-list__item-select-list'>{listItems}</ul>
    </Popover>
  }

  render () {
    let classNameUL = this.props.type === 'Tags' ? 'select-list__labels' : ''
    return (
      <div className='select-list__wrapper'>
        <label className='select-list__details-label'>{this.props.type}:
          <OverlayTrigger trigger="click" rootClose placement="right" overlay={this.renderUnSelected()}>
            <Button ref='characterList' bsSize='xsmall'>
              <Glyphicon glyph='plus'/>
            </Button>
          </OverlayTrigger>
        </label>
        <ul className={classNameUL}>
          {this.renderSelected()}
        </ul>
      </div>
    )
  }
}

SelectList.propTypes = {
  parentId: PropTypes.number.isRequired,
  type: PropTypes.string.isRequired,
  add: PropTypes.func.isRequired,
  remove: PropTypes.func.isRequired,
  selectedItems: PropTypes.array.isRequired,
  allItems: PropTypes.array.isRequired,
}
