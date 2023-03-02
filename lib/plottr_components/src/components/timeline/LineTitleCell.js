import React, { useState, useRef, useEffect } from 'react'
import PropTypes from 'react-proptypes'
import { Cell } from 'react-sticky-table'
import cx from 'classnames'
import { FaBook, FaExpandAlt, FaCompressAlt } from 'react-icons/fa'
import { FiCopy } from 'react-icons/fi'
import { BsPinFill } from 'react-icons/bs'
import { TbPinnedOff } from 'react-icons/tb'

import { helpers } from 'pltr/v2'
import { t } from 'plottr_locales'

import UnconnectedPlottrFloater from '../PlottrFloater'
import DropdownButton from '../DropdownButton'
import MenuItem from '../MenuItem'
import ButtonGroup from '../ButtonGroup'
import Glyphicon from '../Glyphicon'
import ControlLabel from '../ControlLabel'
import FormGroup from '../FormGroup'
import FormControl from '../FormControl'
import Button from '../Button'
import UnconnectedColorPicker from '../ColorPicker'
import DeleteConfirmModal from '../dialogs/DeleteConfirmModal'
import InputModal from '../dialogs/InputModal'
import { checkDependencies } from '../checkDependencies'

const {
  card: { truncateTitle },
  orientedClassName: { orientedClassName },
} = helpers

const LineTitleCellConnector = (connector) => {
  const {
    platform: { isDevelopment },
  } = connector
  const ColorPicker = UnconnectedColorPicker(connector)
  const Floater = UnconnectedPlottrFloater(connector)

  const LineTitleCell = ({
    line,
    bookId,
    handleReorder,
    darkMode,
    orientation,
    timelineIsExpanded,
    isSmall,
    isMedium,
    isLarge,
    lineIsExpanded,
    actions,
    uiActions,
    notifications,
    books,
    zIndex,
    actStructureEnabled,
    togglePinPlotline,
  }) => {
    const [hovering, setHovering] = useState(false)
    const [editing, setEditing] = useState(line.title === '')
    const [dragging, setDragging] = useState(false)
    const [inDropZone, setInDropZone] = useState(false)
    const [dropDepth, setDropDepth] = useState(0)
    const [showColorPicker, setShowColorPicker] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [movingLine, setMovingLine] = useState(false)

    const hoverTimeout = useRef(null)
    const titleInputRef = useRef()
    const bookChoiceDropDown = useRef()
    const titleCellRef = useRef()

    useEffect(() => {
      if (titleCellRef.current && zIndex) {
        const wrapperDiv = titleCellRef.current
        if (wrapperDiv) {
          wrapperDiv.style.zIndex = zIndex
          if (orientation !== 'vertical') {
            wrapperDiv.style.position = 'sticky'
          }
        }
      }
    }, [zIndex])

    useEffect(() => {
      if (movingLine && bookChoiceDropDown.current) {
        const dropDownId = bookChoiceDropDown.current.props.id
        const dropDown = document.querySelector(`#${dropDownId}`)
        if (dropDown) {
          dropDown.focus()
        }
      }
    }, [movingLine])

    useEffect(() => {
      window.SCROLLWITHKEYS = false
    }, [editing])

    const deleteLine = (e) => {
      e.stopPropagation()
      actions.deleteLine(line.id)
    }

    const cancelDelete = (e) => {
      e.stopPropagation()
      setDeleting(false)
    }

    const handleDelete = (e) => {
      e.stopPropagation()
      setDeleting(true)
      setHovering(false)
    }

    const editTitle = () => {
      const ref = titleInputRef.current
      if (!ref) return
      finalizeEdit(ref.value)
    }

    const finalizeEdit = (newVal) => {
      var id = line.id
      actions.editLineTitle(id, newVal)
      setMovingLine(false)
      setEditing(false)
      setHovering(false)
    }

    const handleFinishEditingTitle = (event) => {
      if (event.which === 13) {
        editTitle()
      }
    }

    const handleBlur = (event) => {
      if (titleInputRef.current && titleInputRef.current.value !== '') {
        editTitle()
        setEditing(false)
        setHovering(false)
      }
      if (!event.relatedTarget || !event.relatedTarget.attributes?.role?.value === 'menuitem') {
        setMovingLine(false)
      }
    }

    const handleDragStart = (e) => {
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/json', JSON.stringify(line))
      setDragging(true)
    }

    const handleDragEnd = () => {
      setDragging(false)
    }

    const handleDragEnter = (e) => {
      if (!dragging) setDropDepth(dropDepth + 1)
    }

    const handleDragOver = (e) => {
      e.preventDefault()
      if (!dragging) {
        setInDropZone(true)
      }
    }

    const handleDragLeave = (e) => {
      if (!dragging) {
        let newDropDepth = dropDepth
        --newDropDepth
        setDropDepth(newDropDepth)
        if (newDropDepth > 0) return
        setInDropZone(false)
      }
    }

    const handleDrop = (e) => {
      e.stopPropagation()
      setInDropZone(false)
      setDropDepth(0)

      var json = e.dataTransfer.getData('text/json')
      var droppedLine = JSON.parse(json)
      if (droppedLine.id == null) return

      handleReorder(line.position, droppedLine.position)
    }

    const handlePinPlotLine = () => {
      togglePinPlotline(line)
    }

    const handleEsc = (event) => {
      if (event.which === 27) {
        setEditing(false)
        setMovingLine(false)
      }
    }

    const changeColor = (newColor) => {
      if (newColor) {
        actions.editLineColor(line.id, newColor)
      }
      setShowColorPicker(false)
    }

    const openColorPicker = () => {
      setShowColorPicker(true)
    }

    const startEditing = () => {
      if (!movingLine) {
        setEditing(true)
      }
    }

    const startHovering = () => {
      clearTimeout(hoverTimeout.current)
      setHovering(true)
    }

    const stopHovering = () => {
      hoverTimeout.current = setTimeout(() => setHovering(false), 200)
    }

    const toggleLine = () => {
      if (lineIsExpanded) {
        actions.collapseLine(line.id)
      } else {
        actions.expandLine(line.id)
      }
    }

    const toggleExpanded = () => {
      if (timelineIsExpanded) {
        uiActions.collapseTimeline()
      } else {
        uiActions.expandTimeline()
      }
    }

    const duplicateThisPlotline = () => {
      actions.duplicateLine(line.id, line.position + 1)
    }

    const toggleMovingLine = () => {
      const thereIsAnotherBook =
        bookId !== 'series' ||
        books.allIds.some((id) => {
          return bookId !== id
        })
      if (thereIsAnotherBook) {
        setMovingLine(!movingLine)
      }
    }

    const renderEditInput = () => {
      if (!editing) return null

      return (
        <InputModal
          isOpen={true}
          type="text"
          getValue={finalizeEdit}
          defaultValue={line.title}
          title={t('Edit {lineName}', { lineName: line.title || t('New Plotline') })}
          cancel={() => {
            setEditing(false)
            setMovingLine(false)
            setHovering(false)
          }}
        />
      )
    }

    const renderDelete = () => {
      if (!deleting) return null

      return (
        <DeleteConfirmModal
          name={line.title || t('New Plotline')}
          onDelete={deleteLine}
          onCancel={cancelDelete}
        />
      )
    }

    const renderColorPicker = () => {
      if (showColorPicker) {
        var key = 'colorPicker-' + line.id
        return <ColorPicker key={key} color={line.color} closeDialog={changeColor} />
      } else {
        return null
      }
    }

    const renderHoverOptions = () => {
      let expandedIcon = null
      let allIcon = null
      if (lineIsExpanded) {
        expandedIcon = <FaCompressAlt />
      } else {
        expandedIcon = <FaExpandAlt />
      }
      if (timelineIsExpanded) {
        allIcon = <FaCompressAlt />
      } else {
        allIcon = <FaExpandAlt />
      }

      if (orientation === 'vertical') {
        let klasses = orientedClassName('line-title__hover-options', orientation)
        return (
          <div className={cx(klasses, { 'small-timeline': isSmall })}>
            <Button title={t('Edit title')} block bsSize="small" onClick={startEditing}>
              <Glyphicon glyph="edit" />
            </Button>
            <Button title={t('Change color')} block bsSize="small" onClick={openColorPicker}>
              <Glyphicon glyph="tint" />
            </Button>
            {isDevelopment ? (
              <Button
                title={line?.isPinned ? t('Unpin Plotline') : t('Pin this Plotline')}
                block
                bsSize="small"
                onClick={handlePinPlotLine}
              >
                {line?.isPinned ? <TbPinnedOff /> : <BsPinFill />}
              </Button>
            ) : null}
            {isSmall ? null : (
              <Button
                title={t('Duplicate plotline')}
                block
                bsSize="small"
                onClick={duplicateThisPlotline}
              >
                <FiCopy />
              </Button>
            )}
            <Button title={t('Delete plotline')} block bsSize="small" onClick={handleDelete}>
              <Glyphicon glyph="trash" />
            </Button>
            {isSmall ? null : (
              <>
                <Button
                  title={t('Expand or collapse stacks')}
                  block
                  bsSize="small"
                  onClick={toggleLine}
                >
                  {expandedIcon}
                </Button>
                <Button
                  title={t('Expand or collapse all stacks')}
                  block
                  bsSize="small"
                  onClick={toggleExpanded}
                >
                  {allIcon} {t('All')}
                </Button>
                {actStructureEnabled ? null : (
                  <Button
                    title={t('Move plotline')}
                    block
                    bsSize="small"
                    onClick={toggleMovingLine}
                  >
                    <FaBook />
                  </Button>
                )}
              </>
            )}
          </div>
        )
      } else {
        return (
          <div className="line-title__hover-options">
            <ButtonGroup>
              <Button title={t('Edit title')} bsSize="small" onClick={startEditing}>
                <Glyphicon glyph="edit" />
              </Button>
              <Button title={t('Change color')} bsSize="small" onClick={openColorPicker}>
                <Glyphicon glyph="tint" />
              </Button>
              {isDevelopment ? (
                <Button
                  title={line?.isPinned ? t('Unpin Plotline') : t('Pin this Plotline')}
                  bsSize="small"
                  onClick={handlePinPlotLine}
                >
                  {line?.isPinned ? <TbPinnedOff /> : <BsPinFill />}
                </Button>
              ) : null}
              {isSmall ? null : (
                <Button
                  title={t('Duplicate plotline')}
                  bsSize="small"
                  onClick={duplicateThisPlotline}
                >
                  <FiCopy />
                </Button>
              )}
              <Button title={t('Delete plotline')} bsSize="small" onClick={handleDelete}>
                <Glyphicon glyph="trash" />
              </Button>
              {isSmall ? null : (
                <>
                  <Button
                    title={t('Expand or collapse stacks')}
                    bsSize="small"
                    onClick={toggleLine}
                  >
                    {expandedIcon}
                  </Button>
                  <Button
                    title={t('Expand or collapse all stacks')}
                    bsSize="small"
                    onClick={toggleExpanded}
                  >
                    {allIcon} {t('All')}
                  </Button>
                  {actStructureEnabled ? null : (
                    <Button title={t('Move plotline')} bsSize="small" onClick={toggleMovingLine}>
                      <FaBook />
                    </Button>
                  )}
                </>
              )}
            </ButtonGroup>
          </div>
        )
      }
    }

    const moveToBook = (targetBookId) => {
      actions.moveLine(line.id, targetBookId)
      notifications.showToastNotification(true, null, targetBookId, 'move')
    }

    const renderBookOptions = () => {
      const title = isMedium ? t('Book') : t('Change book')
      return (
        <DropdownButton
          open
          ref={bookChoiceDropDown}
          id={`line-book-${line.id}`}
          bsSize="small"
          title={title}
          onBlur={handleBlur}
        >
          {[...books.allIds, 'series'].sort().map((id, index) => {
            const book = id === 'series' ? { id: 'series', title: t('Series') } : books[id]
            if (Array.isArray(book)) return null
            if (bookId === book.id) return null

            return (
              <MenuItem key={book.id} eventKey={book.id} onClick={() => moveToBook(book.id)}>
                {book.title || t('Untitled')}
              </MenuItem>
            )
          })}
        </DropdownButton>
      )
    }

    const renderTitle = () => {
      if (movingLine) {
        return renderBookOptions()
      }
      if (!editing) {
        return line?.isPinned ? (
          <span>
            <BsPinFill />
            {truncateTitle(t(line.title), 50)}
          </span>
        ) : (
          truncateTitle(t(line.title), 50)
        )
      }
      return (
        <FormGroup>
          <ControlLabel className={cx({ darkmode: darkMode })}>{t('Plotline name')}</ControlLabel>
          <FormControl
            type="text"
            defaultValue={line.title}
            inputRef={titleInputRef}
            autoFocus
            onKeyDown={handleEsc}
            onBlur={handleBlur}
            onKeyPress={handleFinishEditingTitle}
          />
        </FormGroup>
      )
    }

    const renderSmall = () => {
      const isHorizontal = orientation == 'horizontal'
      const klasses = {
        'rotate-45': !isHorizontal,
        'row-header': isHorizontal,
        dropping: inDropZone,
      }
      let placement = 'right'
      if (orientation == 'vertical') placement = 'bottom'
      return (
        <th
          className={cx(klasses)}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {renderColorPicker()}
          {renderDelete()}
          {renderEditInput()}
          <div
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onClick={hovering ? stopHovering : startHovering}
          >
            <Floater
              component={renderHoverOptions}
              open={hovering}
              placement={placement}
              hideArrow
              offset={isHorizontal ? 0 : 1}
              styles={{ wrapper: { cursor: 'move' } }}
            >
              <span>
                {line?.isPinned ? (
                  <>
                    <BsPinFill />
                    {truncateTitle(t(line.title), 50)}
                  </>
                ) : (
                  truncateTitle(t(line.title), 50)
                )}
              </span>
            </Floater>
          </div>
        </th>
      )
    }

    if (isSmall) return renderSmall()

    let innerKlass = cx(orientedClassName('line-title__body', orientation), {
      'medium-timeline': isMedium,
      hover: hovering,
      dropping: inDropZone,
    })
    let wrapperKlass = cx(orientedClassName('line-title__cell', orientation), {
      'medium-timeline': isMedium,
    })

    let placement = 'bottom'
    if (orientation == 'vertical') placement = 'right'
    // Note the z-index.  This is needed to have titles stack their
    // controls onto titles to their right.
    return (
      <Cell ref={titleCellRef}>
        <div
          className={wrapperKlass}
          onMouseEnter={startHovering}
          onMouseLeave={stopHovering}
          onDrop={handleDrop}
        >
          {renderDelete()}
          <Floater
            component={renderHoverOptions}
            open={hovering && !movingLine}
            placement={placement}
            hideArrow
            offset={0}
            style={{ cursor: 'move' }}
          >
            <div
              className={innerKlass}
              onClick={startEditing}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              draggable={true}
            >
              {renderTitle()}
            </div>
          </Floater>
        </div>
        {renderColorPicker()}
      </Cell>
    )
  }

  LineTitleCell.propTypes = {
    line: PropTypes.object.isRequired,
    bookId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    handleReorder: PropTypes.func,
    darkMode: PropTypes.bool,
    orientation: PropTypes.string.isRequired,
    timelineIsExpanded: PropTypes.bool,
    isSmall: PropTypes.bool,
    isMedium: PropTypes.bool,
    isLarge: PropTypes.bool,
    lineIsExpanded: PropTypes.bool.isRequired,
    actions: PropTypes.object.isRequired,
    uiActions: PropTypes.object.isRequired,
    notifications: PropTypes.object.isRequired,
    books: PropTypes.object.isRequired,
    zIndex: PropTypes.number,
    actStructureEnabled: PropTypes.bool,
    togglePinPlotline: PropTypes.func,
  }

  const {
    redux,
    pltr: { actions, selectors },
  } = connector
  checkDependencies({ redux, actions, selectors })

  const LineActions = actions.line
  const uiActions = actions.ui
  const notifications = actions.notifications

  const {
    lineIsExpandedSelector,
    isLargeSelector,
    isMediumSelector,
    isSmallSelector,
    allBooksSelector,
  } = selectors

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(
      (state, ownProps) => {
        return {
          darkMode: selectors.isDarkModeSelector(state.present),
          orientation: selectors.orientationSelector(state.present),
          timelineIsExpanded: selectors.timelineIsExpandedSelector(state.present),
          isSmall: isSmallSelector(state.present),
          isMedium: isMediumSelector(state.present),
          isLarge: isLargeSelector(state.present),
          lineIsExpanded: lineIsExpandedSelector(state.present)[ownProps.line.id],
          books: allBooksSelector(state.present),
          actStructureEnabled: selectors.beatHierarchyIsOn(state.present),
        }
      },
      (dispatch, ownProps) => {
        return {
          actions: bindActionCreators(LineActions, dispatch),
          uiActions: bindActionCreators(uiActions, dispatch),
          notifications: bindActionCreators(notifications, dispatch),
        }
      }
    )(LineTitleCell)
  }

  throw new Error('Could not connect LineTitleCell')
}
export default LineTitleCellConnector
