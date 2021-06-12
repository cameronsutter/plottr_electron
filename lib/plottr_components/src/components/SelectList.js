import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { Button, Glyphicon, Popover, OverlayTrigger } from 'react-bootstrap'
import TagLabel from './TagLabel'
import { t as i18n } from 'plottr_locales'
import cx from 'classnames'
import UnconnectedImage from './images/Image'

const SelectListConnector = (connector) => {
  const Image = UnconnectedImage(connector)

  class SelectList extends Component {
    renderSelected() {
      let body
      if (this.props.type === 'Tags') {
        body = this.renderSelectedTags()
      } else {
        body = this.renderSelectedItems()
      }
      return <div className="chip-cloud">{body}</div>
    }

    renderSelectedTags() {
      if (!this.props.selectedItems) return null

      return this.props.selectedItems.map((tId) => {
        var tag = this.props.allItems.find((item) => item.id == tId)
        if (!tag) return null
        return (
          <div key={tId} className="tag-chip">
            <TagLabel tag={tag} />
            <Glyphicon glyph="remove" onClick={() => this.props.remove(this.props.parentId, tId)} />
          </div>
        )
      })
    }

    renderSelectedItems() {
      if (!this.props.selectedItems) return null

      return this.props.selectedItems.map((itemId) => {
        var item = this.props.allItems.find((item) => item.id == itemId)
        if (!item) return null
        return (
          <div key={itemId} className="chip">
            <Image size="xs" shape="circle" imageId={item.imageId} />
            <span>{item.name}</span>
            <Glyphicon
              glyph="remove"
              onClick={() => this.props.remove(this.props.parentId, itemId)}
            />
          </div>
        )
      })
    }

    renderUnSelected() {
      const type = this.props.type
      const itemsToList = !this.props.selectedItems
        ? this.props.allItems
        : this.props.allItems.filter((i) => !this.props.selectedItems.includes(i.id))
      let listItems = (
        <small>
          <i>{i18n('no more to add')}</i>
        </small>
      )
      if (itemsToList.length > 0) {
        listItems = itemsToList.map((i) => {
          let colorSpan = <span></span>
          if (type === 'Tags') {
            colorSpan = <span className="colored" style={{ backgroundColor: i.color }}></span>
          }
          return (
            <li key={`${type}-${i.id}`} onClick={() => this.props.add(this.props.parentId, i.id)}>
              {colorSpan}
              {i.name || i.title}
            </li>
          )
        })
      }
      let title = ''
      switch (type) {
        case 'Characters':
          title = i18n('Characters list')
          break
        case 'Places':
          title = i18n('Places list')
          break
        case 'Tags':
          title = i18n('Tags list')
          break
      }
      return (
        <Popover id="list-popover" title={title}>
          <ul className="select-list__item-select-list">{listItems}</ul>
        </Popover>
      )
    }

    render() {
      let label = ''
      switch (this.props.type) {
        case 'Characters':
          label = i18n('Characters')
          break
        case 'Places':
          label = i18n('Places')
          break
        case 'Tags':
          label = i18n('Tags')
          break
      }
      return (
        <div className={cx('select-list__wrapper', { horizontal: this.props.horizontal })}>
          <label className="select-list__details-label">
            {label}:
            <OverlayTrigger
              trigger="click"
              rootClose
              placement="right"
              overlay={this.renderUnSelected()}
            >
              <Button bsSize="xsmall">
                <Glyphicon glyph="plus" />
              </Button>
            </OverlayTrigger>
          </label>
          {this.renderSelected()}
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
    horizontal: PropTypes.bool,
  }

  return SelectList
}

export default SelectListConnector
