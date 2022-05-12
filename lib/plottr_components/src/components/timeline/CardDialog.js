import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'react-proptypes'
import { FiCopy } from 'react-icons/fi'
import cx from 'classnames'
import tinycolor from 'tinycolor2'

import { t } from 'plottr_locales'

import DropdownButton from '../DropdownButton'
import MenuItem from '../MenuItem'
import Tab from '../Tab'
import Tabs from '../Tabs'
import ButtonToolbar from '../ButtonToolbar'
import Overlay from '../Overlay'
import Glyphicon from '../Glyphicon'
import FormControl from '../FormControl'
import Button from '../Button'
import ColorPickerColor from '../ColorPickerColor'
import DeleteConfirmModal from '../dialogs/DeleteConfirmModal'
import UnconnectedEditAttribute from '../EditAttribute'
import UnconnectedMiniColorPicker from '../MiniColorPicker'
import UnconnectedPlottrModal from '../PlottrModal'
import UnconnectedSelectList from '../SelectList'
import UnconnectedBeatItemTitle from './BeatItemTitle'
import UnconnectedCardDescriptionEditor from './CardDescriptionEditor'
import TemplatePickerConnector from '../templates/TemplatePicker'
import { helpers } from 'pltr/v2'
import { checkDependencies } from '../checkDependencies'
import { IoIosWarning } from 'react-icons/io'

const {
  card: { truncateTitle },
} = helpers

const modalStyles = {
  content: {
    borderRadius: 20,
  },
}

const CardDialogConnector = (connector) => {
  const EditAttribute = UnconnectedEditAttribute(connector)
  const PlottrModal = UnconnectedPlottrModal(connector)
  const SelectList = UnconnectedSelectList(connector)
  const BeatItemTitle = UnconnectedBeatItemTitle(connector)
  const CardDescriptionEditor = UnconnectedCardDescriptionEditor(connector)
  const TemplatePicker = TemplatePickerConnector(connector)
  const MiniColorPicker = UnconnectedMiniColorPicker(connector)

  const {
    platform: { templatesDisabled, openExternal },
  } = connector
  checkDependencies({ templatesDisabled, openExternal })

  const CardDialog = ({
    cardMetaData,
    places,
    tags,
    characters,
    actions,
    uiActions,
    customAttributes,
    getTemplateById,
    closeDialog,
    cardId,
    beats,
    books,
    isSeries,
    beatId,
    lineId,
    lines,
    darkMode,
    currentTimeline,
    notificationActions,
    destinationBeatId,
    destinationLineId,
  }) => {
    const [deleting, setDeleting] = useState(false)
    const [showColorPicker, setShowColorPicker] = useState(false)
    const [showTemplatePicker, setShowTemplatePicker] = useState(false)
    const [removing, setRemoving] = useState(false)
    const [removeWhichTemplate, setRemoveWhichTemplate] = useState(null)
    const [activeTab, setActiveTab] = useState(1)

    const titleInputRef = useRef()
    const colorButtonRef = React.createRef()

    const { templates, id, title, color } = cardMetaData

    useEffect(() => {
      window.SCROLLWITHKEYS = false
      return () => {
        saveEdit()
        window.SCROLLWITHKEYS = true
      }
    }, [])

    const deleteCard = (e) => {
      e.stopPropagation()
      actions.deleteCard(cardId)
    }

    const cancelDelete = (e) => {
      e.stopPropagation()
      setDeleting(false)
    }

    const handleDelete = (e) => {
      e.stopPropagation()
      setDeleting(true)
    }

    const duplicateCard = (e) => {
      e.stopPropagation()
      actions.duplicateCard(id)
      notificationActions.showToastNotification(true, 'duplicate')
    }

    const beginRemoveTemplate = (templateId) => {
      setRemoving(true)
      setRemoveWhichTemplate(templateId)
    }

    const finishRemoveTemplate = (e) => {
      e.stopPropagation()
      setActiveTab(activeTab - 1)
      actions.removeTemplateFromCard(cardId, removeWhichTemplate)
      setRemoving(false)
      setRemoveWhichTemplate(null)
    }

    const cancelRemoveTemplate = (e) => {
      e.stopPropagation()
      setRemoving(false)
      setRemoveWhichTemplate(null)
    }

    const saveAndClose = () => {
      // componentWillUnmount saves the data (otherwise we get a duplicate event)
      closeDialog()
    }

    const openColorPicker = () => {
      // I wanted to be able to toggle it with one function, but it won't work
      // because of the `close` callback on MiniColorPicker
      setShowColorPicker(true)
    }

    const handleAttrChange = (attrName) => (desc, selection) => {
      const editorPath = helpers.editors.cardCustomAttributeEditorPath(id, attrName)
      actions.editCardAttributes(
        cardId,
        helpers.editors.attrIfPresent(attrName, desc),
        editorPath,
        selection
      )
    }

    const handleTemplateAttrChange = (templateId, name) => (value, selection) => {
      const editorPath = helpers.editors.cardTemplateAttributeEditorPath(id, templateId, name)
      if (!value && value !== '') {
        actions.editCardAttributes(cardId, {}, editorPath, selection)
        return
      }
      actions.editCardTemplateAttribute(cardId, templateId, name, value, editorPath, selection)
    }

    const saveEdit = () => {
      var newTitle = titleInputRef.current.value
      actions.editCardAttributes(cardId, { title: newTitle })
    }

    const handleEnter = (event) => {
      if (event.which === 13) {
        saveAndClose()
      }
    }

    // FIXME: unused
    const _handleEsc = (event) => {
      if (event.which === 27) {
        saveEdit()
      }
    }

    const openTemplatePicker = () => {
      setShowTemplatePicker(true)
    }

    const handleChooseTemplate = (templateData) => {
      const numTemplates = templates.length
      actions.addTemplateToCard(id, templateData)
      setShowTemplatePicker(false)
      setActiveTab(numTemplates + 3)
    }

    const closeTemplatePicker = () => {
      setShowTemplatePicker(false)
    }

    const chooseCardColor = (color) => {
      actions.editCardAttributes(cardId, { color })
      setShowColorPicker(false)
    }

    const changeBeat = (beatId) => {
      actions.changeBeat(cardId, beatId, currentTimeline)
    }

    const changeLine = (lineId) => {
      actions.changeLine(cardId, lineId, currentTimeline)
    }

    const changeBook = (bookId) => {
      actions.changeBook(cardId, bookId)
    }

    const getCurrentLine = () => {
      return lines.find((l) => l.id == lineId)
    }

    const currentTimelineBookTitle = () => {
      const title = currentTimeline === 'series' ? 'Series' : books[currentTimeline].title
      if (title.length > 20) {
        return title.slice(0, 20) + '...'
      }
      return title
    }

    const selectTab = (key) => {
      if (key == 'new') {
        openTemplatePicker()
      } else {
        setActiveTab(key)
      }
    }

    const renderDelete = () => {
      if (!deleting) return null

      return <DeleteConfirmModal name={title} onDelete={deleteCard} onCancel={cancelDelete} />
    }

    const renderRemoveTemplate = () => {
      if (!removing) return null
      let templateData = getTemplateById(removeWhichTemplate)
      if (!templateData) {
        templateData = templates.find((t) => t.id == removeWhichTemplate) || {}
      }
      return (
        <DeleteConfirmModal
          customText={t(
            'Are you sure you want to remove the {template} template and all its data?',
            { template: templateData.name || t('Template') }
          )}
          onDelete={finishRemoveTemplate}
          onCancel={cancelRemoveTemplate}
        />
      )
    }

    const renderTemplatePicker = () => {
      if (!showTemplatePicker) return null

      return (
        <TemplatePicker
          types={['scenes']}
          modal={true}
          isOpen={showTemplatePicker}
          close={closeTemplatePicker}
          onChooseTemplate={handleChooseTemplate}
        />
      )
    }

    const renderEditingCustomAttributes = () => {
      return customAttributes.map((attr, index) => {
        const editorPath = helpers.editors.cardCustomAttributeEditorPath(id, attr.name)
        return (
          <React.Fragment key={`custom-attribute-${index}-${attr.name}`}>
            <EditAttribute
              index={index}
              entityType="scene"
              valueSelector={selectors.attributeValueSelector(cardId, attr.name)}
              editorPath={editorPath}
              onChange={handleAttrChange(attr.name)}
              onSave={saveEdit}
              onSaveAndClose={saveAndClose}
              name={attr.name}
              type={attr.type}
            />
          </React.Fragment>
        )
      })
    }

    const renderEditingTemplates = () => {
      return templates.map((template, idx) => {
        const templateData = getTemplateById(template.id) || template || {}
        const attrs = template.attributes.map((attr, index) => {
          const editorPath = helpers.editors.cardTemplateAttributeEditorPath(
            cardId,
            template.id,
            attr.name
          )
          return (
            <React.Fragment key={`template-attribute-${index}-${template.id}-${attr.name}`}>
              <EditAttribute
                templateAttribute
                index={index}
                entityType="scene"
                editorPath={editorPath}
                valueSelector={selectors.templateAttributeValueSelector(
                  cardId,
                  template.id,
                  attr.name
                )}
                inputId={`${template.id}-${attr.name}Input`}
                onChange={handleTemplateAttrChange(template.id, attr.name)}
                onSave={saveEdit}
                onSaveAndClose={saveAndClose}
                name={attr.name}
                type={attr.type}
              />
            </React.Fragment>
          )
        })
        let link = null
        if (templateData.link) {
          link = (
            <a
              className="template-picker__link"
              title={templateData.link}
              onClick={() => openExternal(templateData.link)}
            >
              <Glyphicon glyph="info-sign" />
            </a>
          )
        }
        return (
          <Tab eventKey={idx + 3} title={templateData.name || t('Template')} key={`tab-${idx}`}>
            <div className="template-tab__details">
              <p>
                {templateData.description}
                {link}
              </p>
              <Button
                bsStyle="link"
                className="text-danger"
                onClick={() => beginRemoveTemplate(template.id)}
              >
                {t('Remove template')}
              </Button>
            </div>
            {attrs}
          </Tab>
        )
      })
    }

    const renderBeatItems = () => {
      return beats.map((beat) => {
        return (
          <MenuItem key={beat.id} onSelect={() => changeBeat(beat.id)}>
            <BeatItemTitle beat={beat} />
          </MenuItem>
        )
      })
    }

    const renderLineItems = () => {
      return lines.map((line) => {
        return (
          <MenuItem key={line.id} onSelect={() => changeLine(line.id)}>
            {truncateTitle(line.title, 50)}
          </MenuItem>
        )
      })
    }

    const renderBooks = (onSelect = changeBook) => {
      return ['series', ...books.allIds].map((id) => {
        const destinationLine = destinationLineId(id)
        const destinationBeat = destinationBeatId(id)
        const noDestination = !destinationLine || !destinationBeat

        return (
          <MenuItem key={id} onSelect={() => onSelect(id)} disabled={noDestination}>
            <div className="card-dialog__book-selector">
              {noDestination && <IoIosWarning />}
              {id === 'series' ? t('Series') : books[id].title || t('Untitled')}
            </div>
          </MenuItem>
        )
      })
    }

    const renderButtonBar = () => {
      return (
        <ButtonToolbar className="card-dialog__button-bar">
          <Button onClick={saveAndClose}>{t('Close')}</Button>
          <Button className="card-dialog__duplicate" onClick={duplicateCard}>
            <FiCopy />
            {' ' + t('Duplicate')}
          </Button>
          <Button onClick={handleDelete}>
            <Glyphicon glyph="trash" />
            {' ' + t('Delete')}
          </Button>
        </ButtonToolbar>
      )
    }

    const renderTitle = () => {
      const title = cardMetaData.title
      return (
        <FormControl
          placeholder={t('Enter title')}
          style={{ fontSize: '24px', textAlign: 'center', marginBottom: '6px' }}
          onKeyPress={handleEnter}
          type="text"
          inputRef={(ref) => {
            titleInputRef.current = ref
          }}
          defaultValue={title}
        />
      )
    }

    const moveCard = (bookId) => {
      actions.moveCardToBook(bookId, cardId)
      notificationActions.showToastNotification(true, 'move', bookId)
    }

    const renderChangeBookDropdown = () => {
      return (
        <div className="card-dialog__dropdown-wrapper" style={{ marginBottom: '5px' }}>
          <label className="card-dialog__details-label" htmlFor="select-book">
            {t('Book')}:
            <DropdownButton
              id="select-book"
              className="card-dialog__select-line"
              title={currentTimelineBookTitle()}
            >
              {renderBooks(moveCard)}
            </DropdownButton>
          </label>
        </div>
      )
    }

    const renderLeftSide = () => {
      const lineDropdownID = 'select-line'
      const beatDropdownID = 'select-beat'

      let labelText = t('Chapter')
      const darkened = color || color === null ? tinycolor(color).darken().toHslString() : null
      const borderColor = color || color === null ? darkened : 'hsl(211, 27%, 70%)' // $gray-6

      const DropDownTitle = <BeatItemTitle beat={beats.find(({ id }) => beatId === id)} />

      return (
        <div className="card-dialog__left-side">
          {renderChangeBookDropdown()}
          <div className="card-dialog__dropdown-wrapper">
            <label className="card-dialog__details-label" htmlFor={lineDropdownID}>
              {t('Plotline')}:
              <DropdownButton
                id={lineDropdownID}
                className="card-dialog__select-line"
                title={truncateTitle(getCurrentLine().title, 35)}
              >
                {renderLineItems()}
              </DropdownButton>
            </label>
          </div>
          <div className="card-dialog__dropdown-wrapper">
            <label className="card-dialog__details-label" htmlFor={beatDropdownID}>
              {labelText}:
              <DropdownButton
                id={beatDropdownID}
                className="card-dialog__select-card"
                title={DropDownTitle}
              >
                {renderBeatItems()}
              </DropdownButton>
            </label>
          </div>
          <SelectList
            parentId={cardId}
            type={'Characters'}
            selectedItems={cardMetaData.characters}
            allItems={characters}
            add={actions.addCharacter}
            remove={actions.removeCharacter}
          />
          <SelectList
            parentId={cardId}
            type={'Places'}
            selectedItems={cardMetaData.places}
            allItems={places}
            add={actions.addPlace}
            remove={actions.removePlace}
          />
          <SelectList
            parentId={cardId}
            type={'Tags'}
            selectedItems={cardMetaData.tags}
            allItems={tags}
            add={actions.addTag}
            remove={actions.removeTag}
          />
          <div className="color-picker__box">
            <label className="card-dialog__details-label" style={{ minWidth: '55px' }}>
              {t('Color')}:
            </label>
            <ColorPickerColor
              color={cardMetaData.color || cardMetaData.color === null ? 'none' : '#F1F5F8'} // $gray-9
              choose={openColorPicker}
              style={{ margin: '2px', marginRight: '12px' }}
              buttonStyle={{
                border: `1px solid ${borderColor}`,
                backgroundColor: cardMetaData.color && borderColor,
              }}
              ref={colorButtonRef}
            />
            <div className="buttons" style={{ alignSelf: 'flex-start' }}>
              <Button bsSize="xs" block title={t('Choose color')} onClick={openColorPicker}>
                <Glyphicon glyph="tint" />
              </Button>
              <Button
                bsSize="xs"
                block
                title={t('No color')}
                bsStyle="warning"
                onClick={() => chooseCardColor(null)}
              >
                <Glyphicon glyph="ban-circle" />
              </Button>
            </div>
            <Overlay
              show={showColorPicker}
              placement="bottom"
              container={() => colorButtonRef.current}
            >
              <MiniColorPicker
                chooseColor={chooseCardColor}
                el={colorButtonRef}
                close={() => setShowColorPicker(false)}
                position={{ left: 118 }}
              />
            </Overlay>
          </div>
        </div>
      )
    }

    return (
      <PlottrModal isOpen={true} onRequestClose={saveAndClose} style={modalStyles}>
        {renderDelete()}
        {renderRemoveTemplate()}
        {renderTemplatePicker()}
        <div className={cx('card-dialog', { darkmode: darkMode })}>
          <div className="card-dialog__body">
            {renderLeftSide()}
            <div className="card-dialog__description">
              {renderTitle()}
              <Tabs
                activeKey={activeTab}
                id="tabs"
                className="card-dialog__tabs"
                onSelect={selectTab}
              >
                <Tab eventKey={1} title={t('Description')}>
                  <CardDescriptionEditor cardId={cardId} />
                </Tab>
                <Tab eventKey={2} title={t('Attributes')}>
                  <a
                    href="#"
                    className="card-dialog__custom-attributes-configuration-link"
                    onClick={uiActions.openAttributesDialog}
                  >
                    {t('Configure')}
                  </a>
                  {renderEditingCustomAttributes()}
                </Tab>
                {renderEditingTemplates()}
                {!templatesDisabled && <Tab eventKey="new" title={t('+ Add Template')}></Tab>}
              </Tabs>
            </div>
          </div>
          {renderButtonBar()}
        </div>
      </PlottrModal>
    )
  }

  CardDialog.propTypes = {
    cardMetaData: PropTypes.object.isRequired,
    cardId: PropTypes.number.isRequired,
    beatId: PropTypes.number.isRequired,
    lineId: PropTypes.number.isRequired,
    closeDialog: PropTypes.func,
    lines: PropTypes.array.isRequired,
    beats: PropTypes.array.isRequired,
    actions: PropTypes.object.isRequired,
    tags: PropTypes.array.isRequired,
    characters: PropTypes.array.isRequired,
    places: PropTypes.array.isRequired,
    darkMode: PropTypes.bool,
    books: PropTypes.object.isRequired,
    isSeries: PropTypes.bool.isRequired,
    getTemplateById: PropTypes.func.isRequired,
    customAttributes: PropTypes.array.isRequired,
    uiActions: PropTypes.object.isRequired,
    notificationActions: PropTypes.object.isRequired,
    currentTimeline: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    destinationLineId: PropTypes.func,
    destinationBeatId: PropTypes.func,
  }

  const MemoizedCardDialog = React.memo(CardDialog)

  const {
    redux,
    pltr: { selectors, actions },
  } = connector
  checkDependencies({ redux, selectors, actions })

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(
      (state, ownProps) => {
        return {
          cardMetaData: selectors.cardMetaDataSelector(state.present, ownProps.cardId),
          beats: selectors.visibleSortedBeatsByBookIgnoringCollapsedSelector(state.present),
          lines: selectors.sortedLinesByBookSelector(state.present),
          tags: selectors.sortedTagsSelector(state.present),
          characters: selectors.charactersSortedAtoZSelector(state.present),
          places: selectors.placesSortedAtoZSelector(state.present),
          customAttributes: state.present.customAttributes.scenes,
          darkMode: selectors.isDarkModeSelector(state.present),
          books: state.present.books,
          isSeries: selectors.isSeriesSelector(state.present),
          currentTimeline: selectors.currentTimelineSelector(state.present),
          getTemplateById: selectors.templateByIdFnSelector(state.present),
          destinationLineId: (bookId) => selectors.firstLineForBookSelector(state.present, bookId),
          destinationBeatId: (bookId) =>
            selectors.firstVisibleBeatForBookSelector(state.present, bookId),
        }
      },
      (dispatch) => {
        return {
          actions: bindActionCreators(actions.card, dispatch),
          uiActions: bindActionCreators(actions.ui, dispatch),
          notificationActions: bindActionCreators(actions.notifications, dispatch),
        }
      }
    )(MemoizedCardDialog)
  }

  throw new Error('Could not connect CardDialog')
}

export default CardDialogConnector
