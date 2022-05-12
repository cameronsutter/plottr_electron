import React, { useState, useEffect, useMemo } from 'react'
import PropTypes from 'react-proptypes'
import { FormGroup, ControlLabel, Glyphicon } from 'react-bootstrap'
import cx from 'classnames'
import { FaSave } from 'react-icons/fa'

import { t } from 'plottr_locales'

import FormControl from '../FormControl'
import Button from '../Button'
import DeleteConfirmModal from './DeleteConfirmModal'
import UnconnectedPlottrModal from '../PlottrModal'
import { checkDependencies } from '../checkDependencies'

const modalStyles = {
  overlay: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    borderRadius: 20,
    width: '50%',
    position: 'relative',
    left: 'auto',
    bottom: 'auto',
    right: 'auto',
    marginTop: '-60px', // counters some !important style
    minHeight: 500,
    maxHeight: 'calc(100vh - 120px)',
  },
}

const ItemsManagerModelConnector = (connector) => {
  const PlottrModal = UnconnectedPlottrModal(connector)

  const {
    platform: {
      template: { startSaveAsTemplate },
    },
  } = connector
  checkDependencies({ startSaveAsTemplate })

  function ItemsManagerModal({
    title,
    subtitle,
    addLabel,
    items,
    darkMode,
    showSaveAsTemplate = false,
    itemType,
    onAdd,
    renderItem,
    closeDialog,
  }) {
    const [inputValue, setInputValue] = useState('')
    const restrictedValues = useMemo(() => new Set(items.map(({ name }) => name)), [items])
    useEffect(() => {
      window.SCROLLWITHKEYS = false
      return () => (window.SCROLLWITHKEYS = true)
    }, [])

    const saveAsTemplate = () => {
      if (items.length) startSaveAsTemplate(itemType)

      return false
    }

    const handleEnterPressed = (e) => {
      if (e.which !== 13) return
      save()
    }

    const save = () => {
      const value = inputValue.trim()
      if (value !== '' && !restrictedValues.has(value)) {
        onAdd(value)
      }
      setInputValue('')
    }

    if (darkMode) {
      modalStyles.content.backgroundColor = '#666'
    } else {
      modalStyles.content.backgroundColor = '#fff'
    }

    return (
      <PlottrModal isOpen={true} onRequestClose={closeDialog} style={modalStyles}>
        <div className={cx('custom-attr__wrapper', { darkmode: darkMode })}>
          <Button className="pull-right" onClick={closeDialog}>
            {t('Close')}
          </Button>
          {showSaveAsTemplate ? (
            <Button
              className="pull-right custom-attr__save-as-template"
              onClick={saveAsTemplate}
              disabled={!items.length}
            >
              <FaSave className="svg-save-template" /> {t('Save as Template')}
            </Button>
          ) : null}
          <h3>{title}</h3>
          <p className="sub-header">{subtitle}</p>
          <div className="custom-attr__add-button">
            <FormGroup>
              <ControlLabel>{addLabel}</ControlLabel>
              <FormControl
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.currentTarget.value)}
                onKeyDown={handleEnterPressed}
              />
            </FormGroup>
            <Button bsStyle="success" onClick={save}>
              {t('Add')}
            </Button>
          </div>
          <div className="custom-attr__list-wrapper">
            {items.map((item, i) => {
              const element = renderItem(item, i)
              if (element == null) return null
              return React.cloneElement(element, { restrictedValues })
            })}
          </div>
        </div>
      </PlottrModal>
    )
  }

  ItemsManagerModal.propTypes = {
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string.isRequired,
    addLabel: PropTypes.string.isRequired,
    items: PropTypes.array.isRequired,
    darkMode: PropTypes.bool,
    showSaveAsTemplate: PropTypes.bool,
    itemType: PropTypes.string.isRequired,
    onAdd: PropTypes.func.isRequired,
    renderItem: PropTypes.func.isRequired,
    closeDialog: PropTypes.func.isRequired,
  }

  const {
    redux,
    pltr: { selectors },
  } = connector

  if (redux) {
    const { connect } = redux

    return connect((state) => ({
      darkMode: selectors.isDarkModeSelector(state.present),
    }))(ItemsManagerModal)
  }

  throw new Error('Could not connect ItemsManagerModal')
}

export default ItemsManagerModelConnector

export function ListItem({
  item,
  index,
  restrictedValues,
  showType = true,
  canChangeType,
  reorderItem,
  deleteItem,
  updateItem,
}) {
  const [deleting, setDeleting] = useState(false)
  const [draggable, setDraggable] = useState(false)
  const [name, setName] = useState(item.name)
  const [typeChecked, setTypeChecked] = useState(item.type === 'paragraph')

  useEffect(() => {
    let type = typeChecked ? 'paragraph' : 'text'
    if (item.type == type) return // no changes? no op
    updateItem({
      ...item,
      type,
    })
  }, [typeChecked])

  const preventDefault = (e) => e.preventDefault()

  const onDragStart = (e) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/json', JSON.stringify(item))
  }

  const onDrop = (e) => {
    e.stopPropagation()

    const json = e.dataTransfer.getData('text/json')
    const droppedItem = JSON.parse(json)
    reorderItem(droppedItem, index)
  }

  const updateName = () => {
    const newName = name.trim()
    if (!newName || restrictedValues.has(newName)) {
      // is nothing? is a restricted value? no op
      return setName(item.name)
    }
    updateItem({
      ...item,
      name: newName,
    })
  }

  const handleEnter = (e) => {
    if (e.which !== 13) return
    e.currentTarget.blur()
  }

  const renderParagraphCheckBox = () => {
    if (!showType) return null
    const checked = item.type == 'paragraph'
    if (canChangeType) {
      return (
        <label className="custom-attr-item__checkbox-label">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setTypeChecked(e.currentTarget.checked)}
          />
          {t('paragraph')}
        </label>
      )
    } else {
      return <label className="custom-attr-item__checkbox-label text-muted">{t('paragraph')}</label>
    }
  }

  const renderDelete = () => {
    if (!deleting) return null
    return (
      <DeleteConfirmModal
        name={t(item.name)}
        onDelete={() => deleteItem(item)}
        onCancel={() => setDeleting(false)}
      />
    )
  }

  return (
    <li
      className="list-group-item custom-attr-item"
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={preventDefault}
      onDragEnter={preventDefault}
      onDrop={onDrop}
    >
      <div className="custom-attr-item__left-side">
        <Glyphicon
          className="custom-attr-item__drag-handle"
          glyph="menu-hamburger"
          onMouseDown={() => setDraggable(true)}
          onMouseOut={() => setDraggable(false)}
        />
        <input
          className="custom-attr-item__input"
          onChange={(e) => setName(e.currentTarget.value)}
          value={t(name)}
          onBlur={updateName}
          onKeyDown={handleEnter}
        />
      </div>
      <div className="custom-attr-item__checkbox-wrapper">
        {renderParagraphCheckBox()}
        <Button onClick={() => setDeleting(true)}>
          <Glyphicon glyph="remove" />
        </Button>
        {renderDelete()}
      </div>
    </li>
  )
}

ListItem.propTypes = {
  item: PropTypes.object,
  index: PropTypes.number,
  restrictedValues: PropTypes.object,
  showType: PropTypes.bool,
  canChangeType: PropTypes.bool,
  reorderItem: PropTypes.func,
  deleteItem: PropTypes.func,
  updateItem: PropTypes.func,
}
