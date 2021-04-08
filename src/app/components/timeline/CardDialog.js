import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import PureComponent from 'react.pure.component'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {
  ButtonToolbar,
  Button,
  DropdownButton,
  MenuItem,
  FormControl,
  Glyphicon,
  FormGroup,
  ControlLabel,
  Overlay,
} from 'react-bootstrap'
import { t as i18n } from 'plottr_locales'
import cx from 'classnames'
import tinycolor from 'tinycolor2'
import RichText from '../rce/RichText'
import SelectList from 'components/selectList'
import {
  PlottrModal,
  ColorPickerColor,
  DeleteConfirmModal,
  EditAttribute,
} from 'connected-components'
import { helpers, actions, selectors } from 'pltr/v2'
import MiniColorPicker from '../MiniColorPicker'

const {
  card: { truncateTitle },
  beats: { beatTitle },
} = helpers

class CardDialog extends Component {
  constructor(props) {
    super(props)
    const attributes = {}
    props.customAttributes.forEach(({ name, type }) => {
      attributes[name] = props.card[name]
    })
    const templateAttrs = props.card.templates.reduce((acc, t) => {
      acc[t.id] = t.attributes.reduce((obj, attr) => {
        obj[attr.name] = attr.value
        return obj
      }, {})
      return acc
    }, {})
    this.state = {
      description: props.card.description,
      attributes,
      deleting: false,
      templateAttrs,
      selected: 'Description',
      addingAttribute: false,
      newAttributeType: 'text',
      cancelling: false,
      showColorPicker: false,
    }
    this.newAttributeInputRef = React.createRef()
    this.titleInputRef = null
    this.colorButtonRef = React.createRef()
  }

  selectTab = (name) => () => {
    this.setState({
      selected: name,
    })
  }

  componentDidMount() {
    window.SCROLLWITHKEYS = false
  }

  componentDidUpdate(prevProps) {
    if (this.newAttributeInputRef.current) this.newAttributeInputRef.current.focus()
    if (this.props.customAttributes != prevProps.customAttributes) {
      const attributes = {}
      this.props.customAttributes.forEach(({ name, type }) => {
        if (type === 'text') attributes[name] = this.props.card[name]
      })
      this.setState({ attributes })
    }
  }

  componentWillUnmount() {
    if (!this.state.cancelling) this.saveEdit()
    window.SCROLLWITHKEYS = true
  }

  deleteCard = (e) => {
    e.stopPropagation()
    this.props.actions.deleteCard(this.props.card.id)
  }

  cancelDelete = (e) => {
    e.stopPropagation()
    this.setState({ deleting: false })
  }

  handleDelete = (e) => {
    e.stopPropagation()
    this.setState({ deleting: true })
  }

  saveAndClose = () => {
    // componentWillUnmount saves the data (otherwise we get a duplicate event)
    this.props.closeDialog()
  }

  openColorPicker = () => {
    // I wanted to be able to toggle it with one function, but it won't work
    // because of the `close` callback on MiniColorPicker
    this.setState({ showColorPicker: true })
  }

  handleAttrChange = (attrName) => (desc) => {
    this.setState({
      attributes: {
        ...this.state.attributes,
        [attrName]: desc,
      },
    })
  }

  handleTemplateAttrChange = (id, name) => (desc) => {
    const templateAttrs = {
      ...this.state.templateAttrs,
      [id]: {
        ...this.state.templateAttrs[id],
        [name]: desc,
      },
    }
    this.setState({ templateAttrs })
  }

  saveEdit = () => {
    var newTitle = this.titleInputRef.value
    const attrs = {}
    this.props.customAttributes.forEach((attr) => {
      const { name } = attr
      attrs[name] = this.state.attributes[name] || this.props.card[name]
    })
    const templates = this.props.card.templates.map((t) => {
      t.attributes = t.attributes.map((attr) => {
        attr.value = this.state.templateAttrs[t.id][attr.name]
        return attr
      })
      return t
    })
    this.props.actions.editCard(
      this.props.card.id,
      newTitle,
      this.state.description,
      templates,
      attrs
    )
  }

  handleEnter = (event) => {
    if (event.which === 13) {
      this.saveAndClose()
    }
  }

  handleEsc = (event) => {
    if (event.which === 27) {
      this.saveEdit()
    }
  }

  handleNewAttributeTypeChange = (event) => {
    this.setState({ newAttributeType: event.target.checked ? 'paragraph' : 'text' })
  }

  addNewCustomAttribute = (name) => {
    if (name) {
      this.props.customAttributeActions.addCardAttr({
        name,
        type: this.state.newAttributeType,
      })
    }
    this.closeNewAttributeSection()
  }

  closeNewAttributeSection = () => {
    this.setState({
      addingAttribute: false,
      newAttributeType: 'text',
    })
  }

  handleNewAttributeEnter = (event) => {
    if (event.which === 13) {
      this.addNewCustomAttribute(event.target.value)
    }
  }

  onAddAttributeClicked = () => {
    this.setState({
      addingAttribute: true,
    })
  }

  closeWithoutSaving = () => {
    this.setState(
      {
        cancelling: true,
      },
      this.props.closeDialog
    )
  }

  chooseCardColor = (color) => {
    const { card, actions } = this.props
    actions.editCardAttributes(card.id, { color })
    this.setState({ showColorPicker: false })
  }

  changeBeat(beatId) {
    this.props.actions.changeBeat(this.props.card.id, beatId, this.props.ui.currentTimeline)
  }

  changeLine(lineId) {
    this.props.actions.changeLine(this.props.card.id, lineId, this.props.ui.currentTimeline)
  }

  changeBook(bookId) {
    this.props.actions.changeBook(this.props.card.id, bookId)
  }

  getCurrentBeat() {
    return this.props.beats.find((beat) => beat.id == this.props.beatId)
  }

  getCurrentLine() {
    return this.props.lines.find((l) => l.id == this.props.lineId)
  }

  getBookTitle() {
    const book = this.props.books[this.props.card.bookId]
    if (book) {
      return book.title || i18n('Untitled')
    } else {
      return i18n('Choose...')
    }
  }

  renderDelete() {
    if (!this.state.deleting) return null

    return (
      <DeleteConfirmModal
        name={this.props.card.title}
        onDelete={this.deleteCard}
        onCancel={this.cancelDelete}
      />
    )
  }

  renderEditingCustomAttributes() {
    const { card, ui, customAttributes } = this.props
    return customAttributes.map((attr, index) => {
      return (
        <React.Fragment key={`custom-attribute-${index}-${attr.name}`}>
          <EditAttribute
            index={index}
            entity={card}
            entityType="scene"
            value={this.state.attributes[attr.name]}
            ui={ui}
            onChange={this.handleAttrChange(attr.name)}
            onShortDescriptionKeyDown={this.handleEsc}
            onShortDescriptionKeyPress={this.handleEnter}
            name={attr.name}
            type={attr.type}
          />
        </React.Fragment>
      )
    })
  }

  renderEditingTemplates() {
    const { card, ui } = this.props
    return card.templates.flatMap((t) => {
      return t.attributes.map((attr, index) => (
        <React.Fragment key={`template-attribute-${index}-${t.id}-${attr.name}`}>
          <EditAttribute
            templateAttribute
            index={index}
            entity={card}
            entityType="scene"
            value={this.state.templateAttrs[t.id][attr.name]}
            ui={ui}
            inputId={`${t.id}-${attr.name}Input`}
            onChange={this.handleTemplateAttrChange(t.id, attr.name)}
            onShortDescriptionKeyDown={this.handleEsc}
            onShortDescriptionKeyPress={this.handleEnter}
            name={attr.name}
            type={attr.type}
          />
        </React.Fragment>
      ))
    })
  }

  renderAddCustomAttribute() {
    return this.state.addingAttribute ? (
      <div>
        <FormGroup>
          <ControlLabel>{i18n('New Attribute')}</ControlLabel>
          <input
            ref={this.newAttributeInputRef}
            className="form-control"
            type="text"
            onKeyDown={this.handleNewAttributeEnter}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{i18n('Paragraph')} &nbsp;</ControlLabel>
          <input type="checkbox" onChange={this.handleNewAttributeTypeChange} />
        </FormGroup>
        <ButtonToolbar>
          <Button
            bsStyle="success"
            onClick={() => {
              if (this.newAttributeInputRef.current) {
                this.addNewCustomAttribute(this.newAttributeInputRef.current.value)
              }
            }}
          >
            {i18n('Create')}
          </Button>
          <Button onClick={this.closeNewAttributeSection}>Cancel</Button>
        </ButtonToolbar>
      </div>
    ) : (
      <Button bsSize="small" onClick={this.onAddAttributeClicked}>
        <Glyphicon glyph="plus" />
      </Button>
    )
  }

  renderBeatItems() {
    const {
      beats,
      beatTree,
      hierarchyLevels,
      positionOffset,
      hierarchyEnabled,
      isSeries,
    } = this.props
    return beats.map((beat) => {
      return (
        <MenuItem key={beat.id} onSelect={() => this.changeBeat(beat.id)}>
          {truncateTitle(
            beatTitle(beatTree, beat, hierarchyLevels, positionOffset, hierarchyEnabled, isSeries),
            50
          )}
        </MenuItem>
      )
    })
  }

  renderLineItems() {
    return this.props.lines.map((line) => {
      return (
        <MenuItem key={line.id} onSelect={() => this.changeLine(line.id)}>
          {truncateTitle(line.title, 50)}
        </MenuItem>
      )
    })
  }

  renderBooks() {
    const { books } = this.props
    return books.allIds.map((id) => {
      return (
        <MenuItem key={id} onSelect={() => this.changeBook(id)}>
          {books[id].title || i18n('Untitled')}
        </MenuItem>
      )
    })
  }

  renderButtonBar() {
    return (
      <ButtonToolbar className="card-dialog__button-bar">
        <Button onClick={this.closeWithoutSaving}>{i18n('Cancel')}</Button>
        <Button bsStyle="success" onClick={this.saveAndClose}>
          {i18n('Save')}
        </Button>
        <Button className="card-dialog__delete" onClick={this.handleDelete}>
          {i18n('Delete')}
        </Button>
      </ButtonToolbar>
    )
  }

  renderTitle() {
    const title = this.props.card.title
    return (
      <FormControl
        style={{ fontSize: '24pt', textAlign: 'center', marginBottom: '6px' }}
        onKeyPress={this.handleEnter}
        type="text"
        inputRef={(ref) => {
          this.titleInputRef = ref
        }}
        defaultValue={title}
      />
    )
  }

  renderBookDropdown() {
    let bookButton = null
    if (this.props.card.bookId) {
      const handler = () => {
        this.props.uiActions.changeCurrentTimeline(this.props.card.bookId)
        this.props.closeDialog()
      }
      bookButton = <Button onClick={handler}>{i18n('View Timeline')}</Button>
    }
    return (
      <div className="card-dialog__dropdown-wrapper" style={{ marginBottom: '5px' }}>
        <label className="card-dialog__details-label" htmlFor="select-book">
          {i18n('Book')}:
          <DropdownButton
            id="select-book"
            className="card-dialog__select-line"
            title={this.getBookTitle()}
          >
            {this.renderBooks()}
          </DropdownButton>
        </label>
        {bookButton}
      </div>
    )
  }

  renderLeftSide() {
    const lineDropdownID = 'select-line'
    const beatDropdownID = 'select-beat'

    const {
      hierarchyLevels,
      positionOffset,
      isSeries,
      card,
      ui,
      beatTree,
      hierarchyEnabled,
    } = this.props

    let labelText = i18n('Chapter')
    let bookDropDown = null
    if (isSeries) {
      labelText = i18n('Beat')
      bookDropDown = this.renderBookDropdown()
    }
    const currentBeatTitle = beatTitle(
      beatTree,
      this.getCurrentBeat(),
      hierarchyLevels,
      positionOffset,
      hierarchyEnabled,
      isSeries
    )
    const darkened = card.color ? tinycolor(card.color).darken().toHslString() : null
    const borderColor = card.color ? darkened : 'hsl(211, 27%, 70%)' // $gray-6

    return (
      <div className="card-dialog__left-side">
        {bookDropDown}
        <div className="card-dialog__dropdown-wrapper">
          <label className="card-dialog__details-label" htmlFor={lineDropdownID}>
            {i18n('Plotline')}:
            <DropdownButton
              id={lineDropdownID}
              className="card-dialog__select-line"
              title={truncateTitle(this.getCurrentLine().title, 35)}
            >
              {this.renderLineItems()}
            </DropdownButton>
          </label>
        </div>
        <div className="card-dialog__dropdown-wrapper">
          <label className="card-dialog__details-label" htmlFor={beatDropdownID}>
            {labelText}:
            <DropdownButton
              id={beatDropdownID}
              className="card-dialog__select-card"
              title={truncateTitle(currentBeatTitle, 40)}
            >
              {this.renderBeatItems()}
            </DropdownButton>
          </label>
        </div>
        <SelectList
          parentId={this.props.card.id}
          type={'Characters'}
          selectedItems={this.props.card.characters}
          allItems={this.props.characters}
          add={this.props.actions.addCharacter}
          remove={this.props.actions.removeCharacter}
        />
        <SelectList
          parentId={this.props.card.id}
          type={'Places'}
          selectedItems={this.props.card.places}
          allItems={this.props.places}
          add={this.props.actions.addPlace}
          remove={this.props.actions.removePlace}
        />
        <SelectList
          parentId={this.props.card.id}
          type={'Tags'}
          selectedItems={this.props.card.tags}
          allItems={this.props.tags}
          add={this.props.actions.addTag}
          remove={this.props.actions.removeTag}
        />
        <div className="color-picker__box">
          <label className="card-dialog__details-label" style={{ minWidth: '55px' }}>
            {i18n('Color')}:
          </label>
          <ColorPickerColor
            color={card.color || '#F1F5F8'} // $gray-9
            choose={this.openColorPicker}
            style={{ margin: '2px', marginRight: '12px' }}
            buttonStyle={{ border: `1px solid ${borderColor}` }}
            ref={this.colorButtonRef}
          />
          <div className="buttons" style={{ alignSelf: 'flex-start' }}>
            <Button bsSize="xs" block title={i18n('Choose color')} onClick={this.openColorPicker}>
              <Glyphicon glyph="tint" />
            </Button>
            <Button
              bsSize="xs"
              block
              title={i18n('No color')}
              bsStyle="warning"
              onClick={() => this.chooseCardColor(null)}
            >
              <Glyphicon glyph="ban-circle" />
            </Button>
          </div>
          <Overlay
            show={this.state.showColorPicker}
            placement="bottom"
            container={() => this.colorButtonRef.current}
          >
            <MiniColorPicker
              darkMode={ui.darkMode}
              chooseColor={this.chooseCardColor}
              el={this.colorButtonRef}
              close={() => this.setState({ showColorPicker: false })}
            />
          </Overlay>
        </div>
      </div>
    )
  }

  render() {
    const { card, ui } = this.props
    const { selected } = this.state
    return (
      <PlottrModal isOpen={true} onRequestClose={this.saveAndClose}>
        {this.renderDelete()}
        <div className={cx('card-dialog', { darkmode: ui.darkMode })}>
          <div className="card-dialog__body">
            {this.renderLeftSide()}
            <div className="card-dialog__description">
              {this.renderTitle()}
              <div className="card-dialog__tab-container">
                <div className="card-dialog__left-tabs">
                  <div
                    className={cx('card-dialog__details-label card-dialog__tab', {
                      'card-dialog__tab--selected': selected === 'Description',
                    })}
                    onClick={this.selectTab('Description')}
                  >
                    {i18n('Description')}
                  </div>
                  <div
                    className={cx('card-dialog__details-label card-dialog__tab', {
                      'card-dialog__tab--selected': selected === 'Attributes',
                    })}
                    onClick={this.selectTab('Attributes')}
                  >
                    {i18n('Attributes')}
                  </div>
                </div>
                <a
                  href="#"
                  className={cx('card-dialog__custom-attributes-configuration-link', {
                    hidden: selected !== 'Attributes',
                  })}
                  onClick={this.props.uiActions.openAttributesDialog}
                >
                  {i18n('Configure')}
                </a>
              </div>
              <div
                className={cx('card-dialog__details-show-hide-wrapper', {
                  hidden: selected !== 'Description',
                })}
              >
                <RichText
                  description={card.description}
                  onChange={(desc) => this.setState({ description: desc })}
                  editable={true}
                  darkMode={ui.darkMode}
                  autofocus
                />
              </div>
              <div
                className={cx('card-dialog__custom-attributes', {
                  hidden: selected !== 'Attributes',
                })}
              >
                {this.renderEditingCustomAttributes()}
                {this.renderEditingTemplates()}
                <hr />
                {this.renderAddCustomAttribute()}
              </div>
            </div>
          </div>
          {this.renderButtonBar()}
        </div>
      </PlottrModal>
    )
  }
}

CardDialog.propTypes = {
  card: PropTypes.object,
  beatId: PropTypes.number.isRequired,
  lineId: PropTypes.number.isRequired,
  closeDialog: PropTypes.func,
  lines: PropTypes.array.isRequired,
  beatTree: PropTypes.object.isRequired,
  beats: PropTypes.array.isRequired,
  hierarchyLevels: PropTypes.array.isRequired,
  actions: PropTypes.object.isRequired,
  tags: PropTypes.array.isRequired,
  characters: PropTypes.array.isRequired,
  places: PropTypes.array.isRequired,
  ui: PropTypes.object.isRequired,
  books: PropTypes.object.isRequired,
  isSeries: PropTypes.bool.isRequired,
  positionOffset: PropTypes.number.isRequired,
  customAttributes: PropTypes.array.isRequired,
  uiActions: PropTypes.object.isRequired,
  customAttributeActions: PropTypes.object.isRequired,
  hierarchyEnabled: PropTypes.bool,
}

function mapStateToProps(state) {
  return {
    beatTree: selectors.beatsByBookSelector(state.present),
    beats: selectors.sortedBeatsByBookSelector(state.present),
    hierarchyLevels: selectors.sortedHierarchyLevels(state.present),
    lines: selectors.sortedLinesByBookSelector(state.present),
    tags: selectors.sortedTagsSelector(state.present),
    characters: selectors.charactersSortedAtoZSelector(state.present),
    places: selectors.placesSortedAtoZSelector(state.present),
    customAttributes: state.present.customAttributes.scenes,
    ui: state.present.ui,
    books: state.present.books,
    isSeries: selectors.isSeriesSelector(state.present),
    positionOffset: selectors.positionOffsetSelector(state.present),
    hierarchyEnabled: selectors.beatHierarchyIsOn(state.present),
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(actions.card, dispatch),
    uiActions: bindActionCreators(actions.ui, dispatch),
    customAttributeActions: bindActionCreators(actions.customAttribute, dispatch),
  }
}

const Pure = PureComponent(CardDialog)

export default connect(mapStateToProps, mapDispatchToProps)(Pure)
