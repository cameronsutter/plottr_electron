import { sortBy, groupBy } from 'lodash'
import { ipcRenderer, remote } from 'electron'
import React, { Component } from 'react'
import { findDOMNode } from 'react-dom'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Glyphicon, Nav, Navbar, NavItem, Button, FormControl, FormGroup, ButtonGroup,
  ControlLabel, Popover, OverlayTrigger, Alert, Grid, Row, Col } from 'react-bootstrap'
import Modal from 'react-modal'
import CustomAttrFilterList from 'components/customAttrFilterList'
import SortList from 'components/sortList'
import * as CharacterActions from 'actions/characters'
import * as CustomAttributeActions from 'actions/customAttributes'
import * as UIActions from 'actions/ui'
import CharacterView from 'components/characters/characterView'
import CustomAttrItem from 'components/customAttrItem'
import i18n from 'format-message'
import TemplatePicker from '../../../common/components/templates/TemplatePicker'
import Image from '../images/Image'
import cx from 'classnames'
import { characterCustomAttributesThatCanChangeSelector } from '../../selectors/customAttributes'
import { FaSave } from 'react-icons/fa'
import { visibleSortedCharactersByCategorySelector, characterFilterIsEmptySelector } from '../../selectors/characters'

const modalStyles = {content: {top: '70px', width: '50%', marginLeft: '25%'}}
const win = remote.getCurrentWindow()

class CharacterListView extends Component {
  constructor (props) {
    super(props)
    this.state = {
      dialogOpen: false,
      addAttrText: '',
      characterDetailId: null,
      showTemplatePicker: false,
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

    // check for the currently active one
    if (characterDetailId != null) {
      let activeCharacter = characters.find(ch => ch.id == characterDetailId)
      if (activeCharacter) return activeCharacter.id
    }

    let sortedCategories = sortBy(categories, 'position')
    sortedCategories.push({id: null}) // uncategorized
    const firstCategoryWithChar = sortedCategories.find(cat => charactersByCategory[cat.id] && charactersByCategory[cat.id][0])
    let id = charactersByCategory[firstCategoryWithChar.id][0] && charactersByCategory[firstCategoryWithChar.id][0].id

    // check for a new one
    // if (charactersByCategory[null] && charactersByCategory[null].length) {
    //   let newCharacter = charactersByCategory[null].find(ch => ch.name == '')
    //   if (newCharacter) id = newCharacter.id
    // }

    return id
  }

  componentDidUpdate () {
    if (this.refs.attrInput) {
      findDOMNode(this.refs.attrInput).focus()
    }
  }

  closeDialog = () => {
    this.setState({dialogOpen: false})
  }

  startSaveAsTemplate = () => {
    ipcRenderer.sendTo(win.webContents.id, 'save-as-template-start', 'characters') // sends this message to this same process
  }

  handleCreateNewCharacter = () => {
    this.props.actions.addCharacter()
  }

  handleChooseTemplate = (templateData) => {
    this.setState({showTemplatePicker: false})
    this.props.actions.addCharacterWithTemplate(templateData)
  }

  handleType = () => {
    const attr = findDOMNode(this.refs.attrInput).value
    this.setState({addAttrText: attr})
  }

  handleAddCustomAttr = (event) => {
    if (event.which === 13) {
      this.saveAttr()
    }
  }

  saveAttr = () => {
    const name = findDOMNode(this.refs.attrInput).value
    this.props.customAttributeActions.addCharacterAttr({name, type: 'text'})

    this.setState({addAttrText: ''})
  }

  removeAttr = (attr) => {
    this.props.customAttributeActions.removeCharacterAttr(attr)
    this.setState({addAttrText: this.state.addAttrText}) // no op
  }

  updateAttr = (index, attr) => {
    this.props.customAttributeActions.editCharacterAttr(index, attr)
  }

  renderSubNav () {
    const { filterIsEmpty, ui, uiActions } = this.props
    let filterPopover = <Popover id='filter'>
      <CustomAttrFilterList type={'characters'}/>
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

    return visibleCharactersByCategory[categoryId].map((ch, idx) => {
      let img = null
      if (ch.imageId) {
        img = <div className='character-list__item-inner__image-wrapper'>
          <Image shape='circle' size='small' imageId={ch.imageId} />
        </div>
      }
      const klasses = cx('list-group-item', {selected: ch.id == this.state.characterDetailId})
      return <div key={idx} className={klasses} onClick={() => this.setState({characterDetailId: ch.id})}>
        <div className='character-list__item-inner'>
          {img}
          <div>
            <h6 className='list-group-item-heading'>{ch.name || i18n('New Character')}</h6>
            <p className='list-group-item-text'>{ch.description.substr(0, 100)}</p>
          </div>
        </div>
      </div>
    })
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
    let categories = sortBy(this.props.categories, 'position')
    categories.push({id: null, name: i18n('Uncategorized')})

    return categories.map(cat => this.renderCategory(cat))
  }

  renderCharacterDetails () {
    let character = this.props.characters.find(char => char.id == this.state.characterDetailId)
    if (character) {
      return <CharacterView key={`character-${character.id}`} characterId={character.id} />
    } else {
      return null
    }
  }

  renderCustomAttributes () {
    const { customAttributes, ui, customAttributesThatCanChange } = this.props
    const attrs = customAttributes.map((attr, idx) => <CustomAttrItem key={idx} attr={attr} index={idx} update={this.updateAttr} delete={this.removeAttr} canChangeType={customAttributesThatCanChange.includes(attr.name)}/> )
    if (ui.darkMode) {
      modalStyles.content.backgroundColor = '#666'
    }
    return (<Modal isOpen={this.state.dialogOpen} onRequestClose={this.closeDialog} style={modalStyles}>
      <div className={cx('custom-attributes__wrapper', {darkmode: ui.darkMode})}>
        <Button className='pull-right' onClick={this.closeDialog}>
          {i18n('Close')}
        </Button>
        {customAttributes.length ?
          <Button className='pull-right character-list__custom-attributes__save-as-template' onClick={this.startSaveAsTemplate}>
            <FaSave className='svg-save-template'/> {i18n('Save as Template')}
          </Button>
        : null }
        <h3>{i18n('Custom Attributes for Characters')}</h3>
        <p className='sub-header'>{i18n('Choose what you want to track about your characters')}</p>
        <div className='character-list__custom-attributes-add-button'>
          <FormGroup>
            <ControlLabel>{i18n('Add attributes')}</ControlLabel>
            <FormControl type='text' ref='attrInput'
              value={this.state.addAttrText}
              onChange={this.handleType} onKeyDown={this.handleAddCustomAttr} />
          </FormGroup>
          <Button bsStyle='success' onClick={this.saveAttr}>
            {i18n('Add')}
          </Button>
        </div>
        <div className='character-list__custom-attributes-list-wrapper'>
          {attrs}
        </div>
      </div>
    </Modal>)
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
    let klasses = 'secondary-text'
    if (this.props.ui.darkMode) klasses += ' darkmode'
    return (
      <div className='character-list container-with-sub-nav'>
        {this.renderSubNav()}
        {this.renderCustomAttributes()}
        {this.renderTemplatePicker()}
        <Grid fluid>
          <Row>
            <Col sm={3}>
              <h1 className={klasses}>{i18n('Characters')}{' '}<Button onClick={this.handleCreateNewCharacter}><Glyphicon glyph='plus' /></Button></h1>
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
    categories: state.categories.characters,
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
