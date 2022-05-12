import React, { useState, useEffect } from 'react'
import PropTypes from 'react-proptypes'
import { Grid } from 'react-bootstrap'
import cx from 'classnames'

import { t as i18n } from 'plottr_locales'
import { newIds } from 'pltr/v2'

import Alert from '../Alert'
import NavItem from '../NavItem'
import Nav from '../Nav'
import ButtonGroup from '../ButtonGroup'
import Popover from '../Popover'
import Glyphicon from '../Glyphicon'
import Col from '../Col'
import Row from '../Row'
import FormControl from '../FormControl'
import Button from '../Button'
import UnconnectedOverlayTrigger from '../OverlayTrigger'
import CustomAttrFilterListConnector from '../CustomAttrFilterList'
import UnconnectedSortList from '../SortList'
import CharacterViewConnector from './CharacterView'
import UnconnectedCustomAttributeModal from '../dialogs/CustomAttributeModal'
import CharacterCategoriesModalConnector from './CharacterCategoriesModal'
import InputModal from '../dialogs/InputModal'
import CharacterItemConnector from './CharacterItem'
import TemplatePickerConnector from '../templates/TemplatePicker'
import SubNavConnector from '../containers/SubNav'
import { checkDependencies } from '../checkDependencies'
import { withEventTargetValue } from '../withEventTargetValue'

const { nextId } = newIds

const selectedId = (charactersByCategory, characters, categories, characterDetailId) => {
  if (!characters.length) return null
  if (!Object.keys(charactersByCategory).length) return null
  const allCategories = [...categories, { id: null }] // uncategorized

  // check for the currently active one
  if (characterDetailId != null) {
    const isVisible = allCategories.some((cat) => {
      if (!charactersByCategory[cat.id] || !charactersByCategory[cat.id].length) return false
      return charactersByCategory[cat.id].some((ch) => ch.id == characterDetailId)
    })
    if (isVisible) return characterDetailId
  }

  // default to first one in the first category
  const firstCategoryWithChar = allCategories.find(
    (cat) => charactersByCategory[cat.id] && charactersByCategory[cat.id].length
  )
  if (firstCategoryWithChar)
    return (
      charactersByCategory[firstCategoryWithChar.id][0] &&
      charactersByCategory[firstCategoryWithChar.id][0].id
    )

  return null
}

const CharacterListViewConnector = (connector) => {
  const CustomAttributeModal = UnconnectedCustomAttributeModal(connector)
  const SortList = UnconnectedSortList(connector)
  const CustomAttrFilterList = CustomAttrFilterListConnector(connector)
  const CharacterView = CharacterViewConnector(connector)
  const CharacterItem = CharacterItemConnector(connector)
  const TemplatePicker = TemplatePickerConnector(connector)
  const CharacterCategoriesModal = CharacterCategoriesModalConnector(connector)
  const SubNav = SubNavConnector(connector)
  const OverlayTrigger = UnconnectedOverlayTrigger(connector)

  const templatesDisabled = connector.platform.templatesDisabled
  checkDependencies({ templatesDisabled })

  const CharacterListView = ({
    visibleCharactersByCategory,
    filterIsEmpty,
    characters,
    categories,
    customAttributes,
    customAttributesThatCanChange,
    characterSort,
    darkMode,
    charactersSearchTerm,
    actions,
    customAttributeActions,
    uiActions,
  }) => {
    const [attributesDialogOpen, setAttributesDialogOpen] = useState(false)
    const [categoriesDialogOpen, setCategoriesDialogOpen] = useState(false)
    const [characterDetailId, setCharacterDetailId] = useState(null)
    const [editingSelected, setEditingSelected] = useState(false)
    const [showTemplatePicker, setShowTemplatePicker] = useState(false)
    const [creating, setCreating] = useState(false)
    const [templateData, setTemplateData] = useState(null)

    useEffect(() => {
      setCharacterDetailId(
        selectedId(visibleCharactersByCategory, characters, categories, characterDetailId)
      )
    }, [visibleCharactersByCategory, characters, categories])

    const editSelected = () => {
      setEditingSelected(true)
    }

    const stopEditing = () => {
      setEditingSelected(false)
    }

    const closeDialog = () => {
      setAttributesDialogOpen(false)
      setCategoriesDialogOpen(false)
    }

    const handleCreateNewCharacter = () => {
      // setState({ creating: true })

      // going back to old way (without modal) to think it over
      const id = nextId(characters)
      actions.addCharacter()
      setCharacterDetailId(id)
      setEditingSelected(true)
    }

    const handleChooseTemplate = (templateData) => {
      // setState({ showTemplatePicker: false, templateData: templateData, creating: true })

      // going back to old way (without modal) to think it over
      const id = nextId(characters)
      actions.addCharacterWithTemplate(null, templateData)
      setCharacterDetailId(id)
      setEditingSelected(true)
      setShowTemplatePicker(false)
    }

    const handleFinishCreate = (name) => {
      const id = nextId(characters)
      if (templateData) {
        actions.addCharacterWithTemplate(name, templateData)
      } else {
        actions.addCharacter(name)
      }

      setCreating(false)
      setTemplateData(null)
      setCharacterDetailId(id)
      setEditingSelected(true)
    }

    const renderCreateInput = () => {
      if (!creating) return null

      return (
        <InputModal
          title={i18n('Name')}
          getValue={handleFinishCreate}
          cancel={() => setCreating(false)}
          isOpen={true}
          type="text"
        />
      )
    }

    const insertSpace = (event) => {
      const currentValue = event.target.value
      const start = event.target.selectionStart
      const end = event.target.selectionEnd
      if (event.key === ' ') {
        uiActions.setCharactersSearchTerm(
          currentValue.slice(0, start) + ' ' + currentValue.slice(end + 1)
        )
      }
      event.preventDefault()
      event.stopPropagation()
    }

    const renderSubNav = () => {
      const filterPopover = () => (
        <Popover id="filter">
          <CustomAttrFilterList type="characters" />
        </Popover>
      )
      let filterDeclaration = (
        <Alert onClick={() => uiActions.setCharacterFilter(null)} bsStyle="warning">
          <Glyphicon glyph="remove-sign" />
          {'  '}
          {i18n('Character list is filtered')}
        </Alert>
      )
      if (filterIsEmpty) {
        filterDeclaration = <span></span>
      }
      const sortPopover = () => (
        <Popover id="sort">
          <SortList type={'characters'} />
        </Popover>
      )
      let sortGlyph = 'sort-by-attributes'
      if (characterSort.includes('~desc')) sortGlyph = 'sort-by-attributes-alt'
      return (
        <SubNav>
          <Nav bsStyle="pills">
            <NavItem>
              <ButtonGroup>
                <Button bsSize="small" onClick={handleCreateNewCharacter}>
                  <Glyphicon glyph="plus" /> {i18n('New')}
                </Button>
                <Button
                  disabled={templatesDisabled}
                  bsSize="small"
                  onClick={() => setShowTemplatePicker(true)}
                >
                  {i18n('Use Template')}
                </Button>
              </ButtonGroup>
            </NavItem>
            <NavItem>
              <Button bsSize="small" onClick={() => setAttributesDialogOpen(true)}>
                <Glyphicon glyph="list" /> {i18n('Attributes')}
              </Button>
            </NavItem>
            <NavItem>
              <Button bsSize="small" onClick={() => setCategoriesDialogOpen(true)}>
                <Glyphicon glyph="list" /> {i18n('Categories')}
              </Button>
            </NavItem>
            <NavItem>
              <OverlayTrigger
                containerPadding={20}
                trigger="click"
                rootClose
                placement="bottom"
                overlay={filterPopover}
              >
                <Button bsSize="small">
                  <Glyphicon glyph="filter" /> {i18n('Filter')}
                </Button>
              </OverlayTrigger>
              {filterDeclaration}
            </NavItem>
            <NavItem>
              <OverlayTrigger
                containerPadding={20}
                trigger="click"
                rootClose
                placement="bottom"
                overlay={sortPopover}
              >
                <Button bsSize="small">
                  <Glyphicon glyph={sortGlyph} /> {i18n('Sort')}
                </Button>
              </OverlayTrigger>
            </NavItem>
            <NavItem>
              <FormControl
                onChange={withEventTargetValue(uiActions.setCharactersSearchTerm)}
                onKeyUp={insertSpace}
                value={charactersSearchTerm}
                type="text"
                placeholder="Search"
              />
            </NavItem>
          </Nav>
        </SubNav>
      )
    }

    const renderVisibleCharacters = (categoryId) => {
      if (!visibleCharactersByCategory[categoryId]) return []

      return visibleCharactersByCategory[categoryId].map((ch) => (
        <CharacterItem
          key={ch.id}
          character={ch}
          selected={ch.id == characterDetailId}
          startEdit={editSelected}
          stopEdit={stopEditing}
          select={() => setCharacterDetailId(ch.id)}
        />
      ))
    }

    const renderCategory = (category) => {
      const charactersInCategory = renderVisibleCharacters(category.id)
      if (!charactersInCategory.length) return null
      return (
        <div key={`category-${category.id}`}>
          <h2 className="character-list__category-title">{category.name}</h2>
          <div
            className={cx('character-list__list', 'list-group', {
              darkmode: darkMode,
            })}
          >
            {charactersInCategory}
          </div>
        </div>
      )
    }

    const renderCharacters = () => {
      return [...categories, { id: null, name: i18n('Uncategorized') }].map((cat) =>
        renderCategory(cat)
      )
    }

    const renderCharacterDetails = () => {
      let character = characters.find((char) => char.id == characterDetailId)
      if (!character) return null

      return (
        <CharacterView
          key={`character-${character.id}`}
          characterId={character.id}
          editing={editingSelected}
          stopEditing={stopEditing}
          startEditing={editSelected}
          openAttributes={() => setAttributesDialogOpen(true)}
        />
      )
    }

    const renderCustomAttributes = () => {
      if (!attributesDialogOpen) return null

      return <CustomAttributeModal type="characters" closeDialog={closeDialog} />
    }

    const renderCategoriesModal = () => {
      if (!categoriesDialogOpen) return null

      return <CharacterCategoriesModal closeDialog={closeDialog} />
    }

    const renderTemplatePicker = () => {
      if (!showTemplatePicker) return null

      return (
        <TemplatePicker
          modal={true}
          types={['characters']}
          isOpen={showTemplatePicker}
          close={() => setShowTemplatePicker(false)}
          onChooseTemplate={handleChooseTemplate}
          canMakeCharacterTemplates={!!customAttributes.length}
        />
      )
    }

    if (editingSelected) window.SCROLLWITHKEYS = false
    else window.SCROLLWITHKEYS = true

    return (
      <div className="character-list container-with-sub-nav">
        {renderSubNav()}
        {renderCustomAttributes()}
        {renderCategoriesModal()}
        {renderTemplatePicker()}
        {renderCreateInput()}
        <Grid fluid className="tab-body">
          <Row>
            <Col sm={3}>
              <h1 className={cx('secondary-text', { darkmode: darkMode })}>
                {i18n('Characters')}{' '}
                <Button onClick={handleCreateNewCharacter}>
                  <Glyphicon glyph="plus" />
                </Button>
              </h1>
              <div className="character-list__category-list">{renderCharacters()}</div>
            </Col>
            <Col sm={9}>{renderCharacterDetails()}</Col>
          </Row>
        </Grid>
      </div>
    )
  }

  CharacterListView.propTypes = {
    visibleCharactersByCategory: PropTypes.object.isRequired,
    filterIsEmpty: PropTypes.bool.isRequired,
    characters: PropTypes.array.isRequired,
    categories: PropTypes.array.isRequired,
    customAttributes: PropTypes.array.isRequired,
    customAttributesThatCanChange: PropTypes.array,
    characterSort: PropTypes.string,
    darkMode: PropTypes.bool,
    charactersSearchTerm: PropTypes.string,
    actions: PropTypes.object.isRequired,
    customAttributeActions: PropTypes.object.isRequired,
    uiActions: PropTypes.object.isRequired,
  }

  const {
    redux,
    pltr: { actions, selectors },
  } = connector

  checkDependencies({
    redux,
    actions,
    selectors,
  })

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(
      (state) => {
        return {
          visibleCharactersByCategory: selectors.visibleSortedSearchedCharactersByCategorySelector(
            state.present
          ),
          filterIsEmpty: selectors.characterFilterIsEmptySelector(state.present),
          characters: state.present.characters,
          categories: selectors.sortedCharacterCategoriesSelector(state.present),
          customAttributes: state.present.customAttributes.characters,
          customAttributesThatCanChange: selectors.characterCustomAttributesThatCanChangeSelector(
            state.present
          ),
          characterSort: selectors.characterSortSelector(state.present),
          darkMode: selectors.isDarkModeSelector(state.present),
          charactersSearchTerm: selectors.charactersSearchTermSelector(state.present),
        }
      },
      (dispatch) => {
        return {
          actions: bindActionCreators(actions.character, dispatch),
          customAttributeActions: bindActionCreators(actions.customAttribute, dispatch),
          uiActions: bindActionCreators(actions.ui, dispatch),
        }
      }
    )(CharacterListView)
  }

  throw new Error('Could not connect CharacterListView')
}

export default CharacterListViewConnector
