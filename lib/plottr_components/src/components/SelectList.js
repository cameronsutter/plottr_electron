import React, { useState, useRef, useEffect } from 'react'
import PropTypes from 'react-proptypes'
import cx from 'classnames'
import { endsWith } from 'lodash'

import { t as i18n } from 'plottr_locales'

import Popover from './PlottrPopover'
import Glyphicon from './Glyphicon'
import Button from './Button'
import TagLabel from './TagLabel'
import UnconnectedImage from './images/Image'
import UnconnectedFloater from './PlottrFloater'
import { contains } from './domHelpers'

const SelectListConnector = (connector) => {
  const Image = UnconnectedImage(connector)
  const Floater = UnconnectedFloater(connector)

  const SelectList = ({
    horizontal,
    type,
    selectedItems,
    allItems,
    categories,
    remove,
    parentId,
    add,
    click,
  }) => {
    const [visible, setVisible] = useState(false)

    const buttonRef = useRef()
    const selectListRef = useRef()
    const previousClick = useRef(click)

    useEffect(() => {
      if (!selectListRef.current || !buttonRef.current) return
      if (contains(buttonRef.current, click)) return

      if (click.counter !== previousClick.counter && !contains(selectListRef.current, click)) {
        setVisible(false)
      }

      previousClick.current = click
    }, [click])

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
        const fallbackName = type && endsWith(type, 's') ? type.slice(0, -1) : type
        return (
          <div key={itemId} className="chip">
            <Image size="xs" shape="circle" imageId={item.imageId} />
            <span>{item.name || item.title || i18n('New') + ' ' + fallbackName}</span>
            <Glyphicon glyph="remove" onClick={() => remove(parentId, itemId)} />
          </div>
        )
      })
    }

    const renderUnSelected = () => {
      const listType = type
      const itemsToList = !selectedItems
        ? allItems
        : allItems.filter((i) => !selectedItems.includes(i.id))
      let listItems = (
        <small>
          <i>{i18n('no more to add')}</i>
        </small>
      )
      if (categories) {
        const available = categories.reduce((acc, category) => {
          const key = category.key
          const ids = category[key]
          const displayHeading = category.displayHeading
          const lineAbove = category.lineAbove
          const glyph = category.glyph
          const availableIds = ids.filter((id) => {
            return selectedItems.indexOf(id) === -1
          })
          if (availableIds.length > 0) {
            return [...acc, { [key]: availableIds, displayHeading, key, lineAbove, glyph }]
          }

          return acc
        }, [])
        listItems = available.map((category) => {
          const categoryName = category.key
          const categoryValues = category[categoryName]
          const displayHeading = category.displayHeading
          const glyph = category.glyph
          const lineAbove = category.lineAbove
          return [
            lineAbove ? (
              <li className="select-list__line" key={`${categoryName}-lineAbove`}>
                <hr />
              </li>
            ) : null,
            displayHeading ? (
              <small key={categoryName}>
                <i>{categoryName}</i>
              </small>
            ) : null,
            ...categoryValues.map((id) => {
              const item = allItems.find((indexItem) => indexItem.id === id)
              let colorSpan = <span></span>
              if (listType === 'Tags') {
                colorSpan = (
                  <span className="colored" style={{ backgroundColor: item.color }}></span>
                )
              }
              return (
                <li key={`${listType}-${item.id}`} onClick={() => add(parentId, item.id)}>
                  {colorSpan}
                  {glyph ? <Glyphicon glyph={glyph} style={{ fontSize: '12px' }} /> : null}{' '}
                  {item.name || item.title}
                </li>
              )
            }),
          ]
        })
      } else if (itemsToList.length > 0) {
        listItems = itemsToList.map((i) => {
          let colorSpan = <span></span>
          if (listType === 'Tags') {
            colorSpan = <span className="colored" style={{ backgroundColor: i.color }}></span>
          }
          const fallbackName =
            listType && endsWith(listType, 's') ? listType.slice(0, -1) : listType
          return (
            <li key={`${listType}-${i.id}`} onClick={() => add(parentId, i.id)}>
              {colorSpan}
              {i.name || i.title || i18n('New') + ` ${fallbackName}`}
            </li>
          )
        })
      }
      let title = ''
      switch (listType) {
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
        <Popover id="list-popover" title={title} noMaxWidth>
          <ul ref={selectListRef} className="select-list__item-select-list">
            {listItems}
          </ul>
        </Popover>
      )
    }

    const handleMouseLeave = () => {
      if (visible) setVisible(false)
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
      <div
        className={cx('select-list__wrapper', { horizontal: horizontal })}
        onMouseLeave={handleMouseLeave}
      >
        <label ref={buttonRef} className="select-list__details-label">
          {label}:
          <Floater
            open={visible}
            onClose={() => {
              setVisible(false)
            }}
            placement="right"
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
    categories: PropTypes.object,
    horizontal: PropTypes.bool,
    click: PropTypes.object,
  }

  const {
    redux,
    pltr: { selectors },
  } = connector

  if (redux) {
    const { connect } = redux

    return connect((state) => {
      return {
        click: selectors.lastClickSelector(state.present),
      }
    })(SelectList)
  }

  throw new Error('Could not connect SelectList')
}

export default SelectListConnector
