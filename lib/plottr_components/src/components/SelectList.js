import React, { useState } from 'react'
import PropTypes from 'react-proptypes'
import cx from 'classnames'

import { t as i18n } from 'plottr_locales'

import Popover from './PlottrPopover'
import Glyphicon from './Glyphicon'
import Button from './Button'
import TagLabel from './TagLabel'
import UnconnectedImage from './images/Image'
import UnconnectedFloater from './PlottrFloater'

const SelectListConnector = (connector) => {
  const Image = UnconnectedImage(connector)
  const Floater = UnconnectedFloater(connector)

  const SelectList = ({ horizontal, type, selectedItems, allItems, remove, parentId, add }) => {
    const [visible, setVisible] = useState(false)

    const renderSelected = () => {
      let body
      if (type === 'Tags') {
        body = renderSelectedTags()
      } else {
        body = renderSelectedItems()
      }
      return <div className="chip-cloud">{body}</div>
    }

    const renderSelectedTags = () => {
      if (!selectedItems) return null

      return selectedItems.map((tId) => {
        var tag = allItems.find((item) => item.id == tId)
        if (!tag) return null
        return (
          <div key={tId} className="tag-chip">
            <TagLabel tag={tag} />
            <Glyphicon glyph="remove" onClick={() => remove(parentId, tId)} />
          </div>
        )
      })
    }

    const renderSelectedItems = () => {
      if (!selectedItems) return null

      return selectedItems.map((itemId) => {
        var item = allItems.find((item) => item.id == itemId)
        if (!item) return null
        return (
          <div key={itemId} className="chip">
            <Image size="xs" shape="circle" imageId={item.imageId} />
            <span>{item.name}</span>
            <Glyphicon glyph="remove" onClick={() => remove(parentId, itemId)} />
          </div>
        )
      })
    }

    const renderUnSelected = () => {
      const type = type
      const itemsToList = !selectedItems
        ? allItems
        : allItems.filter((i) => !selectedItems.includes(i.id))
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
            <li key={`${type}-${i.id}`} onClick={() => add(parentId, i.id)}>
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

    let label = ''
    switch (type) {
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
      <div className={cx('select-list__wrapper', { horizontal: horizontal })}>
        <label className="select-list__details-label">
          {label}:
          <Floater
            rootClose
            open={visible}
            onClose={() => {
              setVisible(false)
            }}
            placement="right-start"
            component={renderUnSelected}
          >
            <Button
              bsSize="xsmall"
              onClick={(event) => {
                setVisible(!visible)
              }}
            >
              <Glyphicon glyph="plus" />
            </Button>
          </Floater>
        </label>
        {renderSelected()}
      </div>
    )
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
