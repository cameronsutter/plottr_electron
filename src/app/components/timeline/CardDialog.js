import React, { Component } from 'react'
import { findDOMNode } from 'react-dom'
import PropTypes from 'react-proptypes'
import PureComponent from 'react.pure.component'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import PlottrModal from 'components/PlottrModal'
import {
  ButtonToolbar,
  Button,
  DropdownButton,
  MenuItem,
  FormControl,
  Glyphicon,
  FormGroup,
  ControlLabel,
} from 'react-bootstrap'
import SelectList from 'components/selectList'
import i18n from 'format-message'
import cx from 'classnames'
import RichText from '../rce/RichText'
import DeleteConfirmModal from '../dialogs/DeleteConfirmModal'
import EditAttribute from '../EditAttribute'
import { helpers, actions, selectors } from 'pltr/v2'

const {
  card: { truncateTitle },
  chapters: { chapterTitle },
} = helpers

const CardActions = actions.card
const UIActions = actions.ui
const CustomAttributeActions = actions.ui

const { sortedTagsSelector, isSeriesSelector } = selectors

const {
  sortedChaptersByBookSelector,
  positionOffsetSelector,
  charactersSortedAtoZSelector,
  sortedLinesByBookSelector,
  placesSortedAtoZSelector,
} = selectors

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
    }
    this.newAttributeInputRef = React.createRef()
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
    // componentWillUnmount saves the data (otherwise we get a
    // duplicate event).
    this.props.closeDialog()
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
    const newTitle = findDOMNode(this.refs.titleInput).value
    const attrs = {}
    this.props.customAttributes.forEach((attr) => {
      const { name, type } = attr
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
      this.props.customAttributeActions.addSceneAttr({
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

  changeChapter(chapterId) {
    this.props.actions.changeScene(this.props.card.id, chapterId, this.props.ui.currentTimeline)
  }

  changeLine(lineId) {
    this.props.actions.changeLine(this.props.card.id, lineId, this.props.ui.currentTimeline)
  }

  changeBook(bookId) {
    this.props.actions.changeBook(this.props.card.id, bookId)
  }

  getCurrentChapter() {
    return this.props.chapters.find((ch) => ch.id == this.props.chapterId)
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

  renderChapterItems() {
    const { chapters, positionOffset, isSeries } = this.props
    return chapters.map((chapter) => {
      return (
        <MenuItem key={chapter.id} onSelect={() => this.changeChapter(chapter.id)}>
          {truncateTitle(chapterTitle(chapter, positionOffset, isSeries), 50)}
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
        ref="titleInput"
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
    const chapterDropdownID = 'select-chapter'

    const { positionOffset, isSeries } = this.props

    let labelText = i18n('Chapter')
    let bookDropDown = null
    if (isSeries) {
      labelText = i18n('Beat')
      bookDropDown = this.renderBookDropdown()
    }
    const currentChapterTitle = chapterTitle(this.getCurrentChapter(), positionOffset, isSeries)

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
        <div className="card-dialog__sdropdown-wrapper">
          <label className="card-dialog__details-label" htmlFor={chapterDropdownID}>
            {labelText}:
            <DropdownButton
              id={chapterDropdownID}
              className="card-dialog__select-scene"
              title={truncateTitle(currentChapterTitle, 40)}
            >
              {this.renderChapterItems()}
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
  chapterId: PropTypes.number.isRequired,
  lineId: PropTypes.number.isRequired,
  closeDialog: PropTypes.func,
  lines: PropTypes.array.isRequired,
  chapters: PropTypes.array.isRequired,
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
}

function mapStateToProps(state) {
  return {
    chapters: sortedChaptersByBookSelector(state.present),
    lines: sortedLinesByBookSelector(state.present),
    tags: sortedTagsSelector(state.present),
    characters: charactersSortedAtoZSelector(state.present),
    places: placesSortedAtoZSelector(state.present),
    customAttributes: state.present.customAttributes.scenes,
    ui: state.present.ui,
    books: state.present.books,
    isSeries: isSeriesSelector(state.present),
    positionOffset: positionOffsetSelector(state.present),
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(CardActions, dispatch),
    uiActions: bindActionCreators(UIActions, dispatch),
    customAttributeActions: bindActionCreators(CustomAttributeActions, dispatch),
  }
}

const Pure = PureComponent(CardDialog)

export default connect(mapStateToProps, mapDispatchToProps)(Pure)
