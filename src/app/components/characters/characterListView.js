import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Glyphicon, Nav, Navbar, NavItem, Button, ButtonGroup, Popover, OverlayTrigger, Alert, Grid, Row, Col } from 'react-bootstrap'
import CustomAttrFilterList from 'components/customAttrFilterList'
import SortList from 'components/sortList'
import * as CharacterActions from 'actions/characters'
import * as CustomAttributeActions from 'actions/customAttributes'
import * as UIActions from 'actions/ui'
import CharacterView from 'components/characters/characterView'
import i18n from 'format-message'
import TemplatePicker from '../../../common/components/templates/TemplatePicker'
import cx from 'classnames'
import { characterCustomAttributesThatCanChangeSelector } from '../../selectors/customAttributes'
import { visibleSortedCharactersByCategorySelector, characterFilterIsEmptySelector } from '../../selectors/characters'
import { sortedCharacterCategoriesSelector } from '../../selectors/categories'
import CustomAttributeModal from './CustomAttributeModal'
import CharacterItem from './CharacterItem'
import InputModal from '../dialogs/InputModal'
import { nextId } from '../../store/newIds'

class CharacterListView extends Component {
  constructor (props) {
    super(props)
    this.state = {
      dialogOpen: false,
      addAttrText: '',
      characterDetailId: null,
      editingSelected: false,
      showTemplatePicker: false,
      creating: false,
      templateData: null,
    }
  }

  static getDerivedStateFromProps (props, state) {
    let returnVal = {...state}
    const { visibleCharactersByCategory, characters, categories } = props
    returnVal.characterDetailId = CharacterListView.selectedId(visibleCharactersByCategory, characters, categories, state.characterDetailId)
    return returnVal
  }

  static selectedId (charactersByCategory, characters, categories, characterDetailId) {
    if (!characters.length) return null
    if (!Object.keys(charactersByCategory).length) return null
    const allCategories = [...categories, {id: null}] // uncategorized

    // check for the currently active one
    if (characterDetailId != null) {
      const isVisible = allCategories.some(cat => {
        if (!charactersByCategory[cat.id] || !charactersByCategory[cat.id].length) return false
        return charactersByCategory[cat.id].some(ch => ch.id == characterDetailId)
      })
      if (isVisible) return characterDetailId
    }

    // default to first one in the first category
    const firstCategoryWithChar = allCategories.find(cat => charactersByCategory[cat.id] && charactersByCategory[cat.id].length)
    if (firstCategoryWithChar) return charactersByCategory[firstCategoryWithChar.id][0] && charactersByCategory[firstCategoryWithChar.id][0].id

    return null
  }

  editingSelected = () => {
    this.setState({editingSelected: true})
  }

  stopEditing = () => {
    this.setState({editingSelected: false})
  }

  closeDialog = () => {
    this.setState({dialogOpen: false})
  }

  handleCreateNewCharacter = () => {
    // this.setState({creating: true})

    // going back to old way (without modal) to think it over
    const id = nextId(this.props.characters)
    this.props.actions.addCharacter()
    this.setState({characterDetailId: id, editingSelected: true})
  }

  handleChooseTemplate = (templateData) => {
    // this.setState({showTemplatePicker: false, templateData: templateData, creating: true})

    // going back to old way (without modal) to think it over
    const id = nextId(this.props.characters)
    this.props.actions.addCharacterWithTemplate(null, templateData)
    this.setState({characterDetailId: id, editingSelected: true})
  }

  handleFinishCreate = (name) => {
    const id = nextId(this.props.characters)
    if (this.state.templateData) {
      this.props.actions.addCharacterWithTemplate(name, this.state.templateData)
    } else {
      this.props.actions.addCharacter(name)
    }

    this.setState({creating: false, templateData: null, characterDetailId: id, editingSelected: true})
  }

  renderCreateInput () {
    if (!this.state.creating) return null

    return <InputModal title={i18n('Name')} getValue={this.handleFinishCreate} cancel={() => this.setState({creating: false})} isOpen={true} type='text'/>
  }

  renderSubNav () {
    const { filterIsEmpty, ui, uiActions } = this.props
    let filterPopover = <Popover id='filter'>
      <CustomAttrFilterList type='characters'/>
    </Popover>
    let filterDeclaration = <Alert onClick={() => uiActions.setCharacterFilter(null)} bsStyle="warning"><Glyphicon glyph='remove-sign' />{"  "}{i18n('Character list is filtered')}</Alert>
    if (filterIsEmpty) {
      filterDeclaration = <span></span>
    }
    let sortPopover = <Popover id='sort'>
      <SortList type={'characters'} />
    </Popover>
    let sortGlyph = 'sort-by-attributes'
    if (ui.characterSort.includes('~desc')) sortGlyph = 'sort-by-attributes-alt'
    return (
      <Navbar className={cx('subnav__container', {darkmode: ui.darkMode})}>
        <Nav bsStyle='pills' >
          <NavItem>
            <ButtonGroup>
              <Button bsSize='small' onClick={this.handleCreateNewCharacter}><Glyphicon glyph='plus' /> {i18n('New')}</Button>
              <Button bsSize='small' onClick={() => this.setState({showTemplatePicker: true})}>{i18n('Use Template')}</Button>
            </ButtonGroup>
          </NavItem>
          <NavItem>
            <Button bsSize='small' onClick={() => this.setState({dialogOpen: true})}><Glyphicon glyph='list' /> {i18n('Custom Attributes')}</Button>
          </NavItem>
          <NavItem>
            <OverlayTrigger containerPadding={20} trigger='click' rootClose placement='bottom' overlay={filterPopover}>
              <Button bsSize='small'><Glyphicon glyph='filter' /> {i18n('Filter')}</Button>
            </OverlayTrigger>
            {filterDeclaration}
          </NavItem>
          <NavItem>
            <OverlayTrigger containerPadding={20} trigger='click' rootClose placement='bottom' overlay={sortPopover}>
              <Button bsSize='small'><Glyphicon glyph={sortGlyph} /> {i18n('Sort')}</Button>
            </OverlayTrigger>
          </NavItem>
        </Nav>
      </Navbar>
    )
  }

  renderVisibleCharacters = (categoryId) => {
    const { visibleCharactersByCategory } = this.props
    if (!visibleCharactersByCategory[categoryId]) return []

    return visibleCharactersByCategory[categoryId].map(ch => (
      <CharacterItem key={ch.id} character={ch}
        selected={ch.id == this.state.characterDetailId}
        startEdit={this.editingSelected}
        stopEdit={this.stopEditing}
        select={() => this.setState({characterDetailId: ch.id})}
      />
    ))
  }

  renderCategory (category) {
    const charactersInCategory = this.renderVisibleCharacters(category.id)
    if (!charactersInCategory.length) return null
    return <div key={`category-${category.id}`}>
      <h2>{category.name}</h2>
      <div className={cx('character-list__list', 'list-group', {darkmode: this.props.ui.darkMode})}>
        { charactersInCategory }
      </div>
    </div>
  }

  renderCharacters () {
    let categories = [...this.props.categories]
    categories.push({id: null, name: i18n('Uncategorized')})

    return categories.map(cat => this.renderCategory(cat))
  }

  renderCharacterDetails () {
    let character = this.props.characters.find(char => char.id == this.state.characterDetailId)
    if (character) {
      return <CharacterView key={`character-${character.id}`}
        characterId={character.id}
        editing={this.state.editingSelected}
        stopEditing={this.stopEditing}
        startEditing={this.editingSelected}
      />
    } else {
      return null
    }
  }

  renderCustomAttributes () {
    if (!this.state.dialogOpen) return null

    return <CustomAttributeModal closeDialog={this.closeDialog} />
  }

  renderTemplatePicker () {
    if (!this.state.showTemplatePicker) return null

    return <TemplatePicker
      modal={true}
      type='characters'
      isOpen={this.state.showTemplatePicker}
      close={() => this.setState({showTemplatePicker: false})}
      onChooseTemplate={this.handleChooseTemplate}
      canMakeCharacterTemplates={!!this.props.customAttributes.length}
    />
  }

  render () {
    if (this.state.editingSelected) window.SCROLLWITHKEYS = false
    else window.SCROLLWITHKEYS = true

    return (
      <div className='character-list container-with-sub-nav'>
        {this.renderSubNav()}
        {this.renderCustomAttributes()}
        {this.renderTemplatePicker()}
        {this.renderCreateInput()}
        <Grid fluid>
          <Row>
            <Col sm={3}>
              <h1 className={cx('secondary-text', {darkmode: this.props.ui.darkMode})}>{i18n('Characters')}{' '}<Button onClick={this.handleCreateNewCharacter}><Glyphicon glyph='plus' /></Button></h1>
              <div className='character-list__category-list'>
                {this.renderCharacters()}
              </div>
            </Col>
            <Col sm={9}>
              {this.renderCharacterDetails()}
            </Col>
          </Row>
        </Grid>
      </div>
    )
  }
}

CharacterListView.propTypes = {
  visibleCharactersByCategory: PropTypes.object.isRequired,
  characters: PropTypes.array.isRequired,
  categories: PropTypes.array.isRequired,
  customAttributes: PropTypes.array.isRequired,
  customAttributesThatCanChange: PropTypes.array,
  ui: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  customAttributeActions: PropTypes.object.isRequired,
  uiActions: PropTypes.object.isRequired,
}

function mapStateToProps (state) {
  return {
    visibleCharactersByCategory: visibleSortedCharactersByCategorySelector(state),
    filterIsEmpty: characterFilterIsEmptySelector(state),
    characters: state.characters,
    categories: sortedCharacterCategoriesSelector(state),
    customAttributes: state.customAttributes.characters,
    customAttributesThatCanChange: characterCustomAttributesThatCanChangeSelector(state),
    ui: state.ui,
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(CharacterActions, dispatch),
    customAttributeActions: bindActionCreators(CustomAttributeActions, dispatch),
    uiActions: bindActionCreators(UIActions, dispatch),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CharacterListView)
