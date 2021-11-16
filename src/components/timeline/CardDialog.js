import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import PureComponent from 'react.pure.component'
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
  Tabs,
  Tab,
} from 'react-bootstrap'
import { t } from 'plottr_locales'
import cx from 'classnames'
import tinycolor from 'tinycolor2'
import ColorPickerColor from '../ColorPickerColor'
import DeleteConfirmModal from '../dialogs/DeleteConfirmModal'
import UnconnectedEditAttribute from '../EditAttribute'
import MiniColorPicker from '../MiniColorPicker'
import UnconnectedPlottrModal from '../PlottrModal'
import UnconnectedSelectList from '../SelectList'
import UnconnectedBeatItemTitle from './BeatItemTitle'
import UnconnectedCardDescriptionEditor from './CardDescriptionEditor'
import TemplatePickerConnector from '../templates/TemplatePicker'
import { helpers } from 'pltr/v2'

import { checkDependencies } from '../checkDependencies'

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

  const {
    platform: {
      templatesDisabled,
      openExternal,
      template: { getTemplateById },
    },
  } = connector
  checkDependencies({ templatesDisabled, openExternal, getTemplateById })

  class CardDialog extends Component {
    constructor(props) {
      super(props)
      this.state = {
        deleting: false,
        addingAttribute: false,
        newAttributeType: 'text',
        showColorPicker: false,
        showTemplatePicker: false,
        removing: false,
        removeWhichTemplate: null,
        activeTab: 1,
      }
      this.newAttributeInputRef = React.createRef()
      this.titleInputRef = null
      this.colorButtonRef = React.createRef()
    }

    componentDidMount() {
      window.SCROLLWITHKEYS = false
    }

    componentDidUpdate(prevProps, prevState) {
      if (this.newAttributeInputRef.current) this.newAttributeInputRef.current.focus()
    }

    componentWillUnmount() {
      this.saveEdit()
      window.SCROLLWITHKEYS = true
    }

    deleteCard = (e) => {
      e.stopPropagation()
      this.props.actions.deleteCard(this.props.cardId)
    }

    cancelDelete = (e) => {
      e.stopPropagation()
      this.setState({ deleting: false })
    }

    handleDelete = (e) => {
      e.stopPropagation()
      this.setState({ deleting: true })
    }

    beginRemoveTemplate = (templateId) => {
      this.setState({ removing: true, removeWhichTemplate: templateId })
    }

    finishRemoveTemplate = (e) => {
      e.stopPropagation()
      const { actions, cardId } = this.props
      const { removeWhichTemplate, activeTab } = this.state
      actions.removeTemplateFromCard(cardId, removeWhichTemplate)
      this.setState({
        removing: false,
        removeWhichTemplate: null,
        activeTab: activeTab - 1,
      })
    }

    cancelRemoveTemplate = (e) => {
      e.stopPropagation()
      this.setState({ removing: false, removeWhichTemplate: null })
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

    handleAttrChange = (attrName) => (desc, selection) => {
      const editorPath = helpers.editors.cardCustomAttributeEditorPath(
        this.props.cardMetaData.id,
        attrName
      )
      this.props.actions.editCardAttributes(
        this.props.cardId,
        helpers.editors.attrIfPresent(attrName, desc),
        editorPath,
        selection
      )
    }

    handleTemplateAttrChange = (templateId, name) => (value, selection) => {
      const editorPath = helpers.editors.cardTemplateAttributeEditorPath(
        this.props.cardMetaData.id,
        templateId,
        name
      )
      if (!value) {
        this.props.actions.editCardAttributes(this.props.cardId, {}, editorPath, selection)
        return
      }
      this.props.actions.editCardTemplateAttribute(
        this.props.cardId,
        templateId,
        name,
        value,
        editorPath,
        selection
      )
    }

    saveEdit = () => {
      var newTitle = this.titleInputRef.value
      this.props.actions.editCardAttributes(this.props.cardId, { title: newTitle })
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

    showTemplatePicker = () => {
      this.setState({ showTemplatePicker: true })
    }

    handleChooseTemplate = (templateData) => {
      const { actions, cardMetaData } = this.props
      const numTemplates = cardMetaData.templates.length
      actions.addTemplateToCard(cardMetaData.id, templateData)
      this.setState({ showTemplatePicker: false, activeTab: numTemplates + 3 })
    }

    closeTemplatePicker = () => {
      this.setState({ showTemplatePicker: false })
    }

    chooseCardColor = (color) => {
      const { cardId, actions } = this.props
      actions.editCardAttributes(cardId, { color })
      this.setState({ showColorPicker: false })
    }

    changeBeat(beatId) {
      this.props.actions.changeBeat(this.props.cardId, beatId, this.props.ui.currentTimeline)
    }

    changeLine(lineId) {
      this.props.actions.changeLine(this.props.cardId, lineId, this.props.ui.currentTimeline)
    }

    changeBook(bookId) {
      this.props.actions.changeBook(this.props.cardId, bookId)
    }

    getCurrentBeat() {
      return this.props.beats.find((beat) => beat.id == this.props.beatId)
    }

    getCurrentLine() {
      return this.props.lines.find((l) => l.id == this.props.lineId)
    }

    getBookTitle() {
      const book = this.props.books[this.props.cardMetaData.bookId]
      if (book) {
        return book.title || t('Untitled')
      } else {
        return t('Choose...')
      }
    }

    selectTab = (key) => {
      if (key == 'new') {
        this.showTemplatePicker()
      } else {
        this.setState({ activeTab: key })
      }
    }

    renderDelete() {
      if (!this.state.deleting) return null

      return (
        <DeleteConfirmModal
          name={this.props.cardMetaData.title}
          onDelete={this.deleteCard}
          onCancel={this.cancelDelete}
        />
      )
    }

    renderRemoveTemplate() {
      const { removing, removeWhichTemplate } = this.state
      const { cardMetaData } = this.props
      if (!removing) return null
      let templateData = getTemplateById(removeWhichTemplate)
      if (!templateData) {
        templateData = cardMetaData.templates.find((t) => t.id == removeWhichTemplate) || {}
      }
      return (
        <DeleteConfirmModal
          customText={t(
            'Are you sure you want to remove the {template} template and all its data?',
            { template: templateData.name || t('Template') }
          )}
          onDelete={this.finishRemoveTemplate}
          onCancel={this.cancelRemoveTemplate}
        />
      )
    }

    renderTemplatePicker() {
      if (!this.state.showTemplatePicker) return null

      return (
        <TemplatePicker
          type={['scenes']}
          modal={true}
          isOpen={this.state.showTemplatePicker}
          close={this.closeTemplatePicker}
          onChooseTemplate={this.handleChooseTemplate}
        />
      )
    }

    renderEditingCustomAttributes() {
      const { cardId, ui, customAttributes } = this.props
      return customAttributes.map((attr, index) => {
        const editorPath = helpers.editors.cardCustomAttributeEditorPath(
          this.props.cardMetaData.id,
          attr.name
        )
        return (
          <React.Fragment key={`custom-attribute-${index}-${attr.name}`}>
            <EditAttribute
              index={index}
              entityType="scene"
              valueSelector={selectors.attributeValueSelector(cardId, attr.name)}
              ui={ui}
              editorPath={editorPath}
              onChange={this.handleAttrChange(attr.name)}
              onSave={this.saveEdit}
              onSaveAndClose={this.saveAndClose}
              name={attr.name}
              type={attr.type}
            />
          </React.Fragment>
        )
      })
    }

    renderEditingTemplates() {
      const {
        cardId,
        cardMetaData: { templates },
        ui,
      } = this.props
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
                ui={ui}
                inputId={`${template.id}-${attr.name}Input`}
                onChange={this.handleTemplateAttrChange(template.id, attr.name)}
                onSave={this.saveEdit}
                onSaveAndClose={this.saveAndClose}
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
                onClick={() => this.beginRemoveTemplate(template.id)}
              >
                {t('Remove template')}
              </Button>
            </div>
            {attrs}
          </Tab>
        )
      })
    }

    renderAddCustomAttribute() {
      return this.state.addingAttribute ? (
        <div>
          <FormGroup>
            <ControlLabel>{t('New Attribute')}</ControlLabel>
            <input
              ref={this.newAttributeInputRef}
              className="form-control"
              type="text"
              onKeyDown={this.handleNewAttributeEnter}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>{t('Paragraph')} &nbsp;</ControlLabel>
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
              {t('Create')}
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
      const { beats } = this.props
      return beats.map((beat) => {
        return (
          <MenuItem key={beat.id} onSelect={() => this.changeBeat(beat.id)}>
            <BeatItemTitle beat={beat} />
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
            {books[id].title || t('Untitled')}
          </MenuItem>
        )
      })
    }

    renderButtonBar() {
      return (
        <ButtonToolbar className="card-dialog__button-bar">
          <Button onClick={this.saveAndClose}>{t('Close')}</Button>
          <Button className="card-dialog__delete" onClick={this.handleDelete}>
            {t('Delete')}
          </Button>
        </ButtonToolbar>
      )
    }

    renderTitle() {
      const title = this.props.cardMetaData.title
      return (
        <FormControl
          style={{ fontSize: '24px', textAlign: 'center', marginBottom: '6px' }}
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
      if (this.props.cardMetaData.bookId) {
        const handler = () => {
          this.props.uiActions.changeCurrentTimeline(this.props.cardMetaData.bookId)
          this.props.closeDialog()
        }
        bookButton = <Button onClick={handler}>{t('View Timeline')}</Button>
      }
      return (
        <div className="card-dialog__dropdown-wrapper" style={{ marginBottom: '5px' }}>
          <label className="card-dialog__details-label" htmlFor="select-book">
            {t('Book')}:
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

      const { isSeries, ui, beats } = this.props

      let labelText = t('Chapter')
      let bookDropDown = null
      if (isSeries) {
        labelText = t('Beat')
        bookDropDown = this.renderBookDropdown()
      }
      const darkened =
        this.props.cardMetaData.color || this.props.cardMetaData.color === null
          ? tinycolor(this.props.cardMetaData.color).darken().toHslString()
          : null
      const borderColor =
        this.props.cardMetaData.color || this.props.cardMetaData.color === null
          ? darkened
          : 'hsl(211, 27%, 70%)' // $gray-6

      const DropDownTitle = (
        <BeatItemTitle beat={beats.find(({ id }) => this.props.beatId === id)} />
      )

      return (
        <div className="card-dialog__left-side">
          {bookDropDown}
          <div className="card-dialog__dropdown-wrapper">
            <label className="card-dialog__details-label" htmlFor={lineDropdownID}>
              {t('Plotline')}:
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
                title={DropDownTitle}
              >
                {this.renderBeatItems()}
              </DropdownButton>
            </label>
          </div>
          <SelectList
            parentId={this.props.cardId}
            type={'Characters'}
            selectedItems={this.props.cardMetaData.characters}
            allItems={this.props.characters}
            add={this.props.actions.addCharacter}
            remove={this.props.actions.removeCharacter}
          />
          <SelectList
            parentId={this.props.cardId}
            type={'Places'}
            selectedItems={this.props.cardMetaData.places}
            allItems={this.props.places}
            add={this.props.actions.addPlace}
            remove={this.props.actions.removePlace}
          />
          <SelectList
            parentId={this.props.cardId}
            type={'Tags'}
            selectedItems={this.props.cardMetaData.tags}
            allItems={this.props.tags}
            add={this.props.actions.addTag}
            remove={this.props.actions.removeTag}
          />
          <div className="color-picker__box">
            <label className="card-dialog__details-label" style={{ minWidth: '55px' }}>
              {t('Color')}:
            </label>
            <ColorPickerColor
              color={
                this.props.cardMetaData.color || this.props.cardMetaData.color === null
                  ? 'none'
                  : '#F1F5F8'
              } // $gray-9
              choose={this.openColorPicker}
              style={{ margin: '2px', marginRight: '12px' }}
              buttonStyle={{
                border: `1px solid ${borderColor}`,
                backgroundColor: this.props.cardMetaData.color && borderColor,
              }}
              ref={this.colorButtonRef}
            />
            <div className="buttons" style={{ alignSelf: 'flex-start' }}>
              <Button bsSize="xs" block title={t('Choose color')} onClick={this.openColorPicker}>
                <Glyphicon glyph="tint" />
              </Button>
              <Button
                bsSize="xs"
                block
                title={t('No color')}
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
                position={{ left: 118 }}
              />
            </Overlay>
          </div>
        </div>
      )
    }

    render() {
      const { cardId, ui } = this.props
      return (
        <PlottrModal isOpen={true} onRequestClose={this.saveAndClose} style={modalStyles}>
          {this.renderDelete()}
          {this.renderRemoveTemplate()}
          {this.renderTemplatePicker()}
          <div className={cx('card-dialog', { darkmode: ui.darkMode })}>
            <div className="card-dialog__body">
              {this.renderLeftSide()}
              <div className="card-dialog__description">
                {this.renderTitle()}
                <Tabs
                  activeKey={this.state.activeTab}
                  id="tabs"
                  className="card-dialog__tabs"
                  onSelect={this.selectTab}
                >
                  <Tab eventKey={1} title={t('Description')}>
                    <CardDescriptionEditor cardId={cardId} />
                  </Tab>
                  <Tab eventKey={2} title={t('Attributes')}>
                    <a
                      href="#"
                      className="card-dialog__custom-attributes-configuration-link"
                      onClick={this.props.uiActions.openAttributesDialog}
                    >
                      {t('Configure')}
                    </a>
                    {this.renderEditingCustomAttributes()}
                  </Tab>
                  {this.renderEditingTemplates()}
                  {!templatesDisabled && <Tab eventKey="new" title={t('+ Add Template')}></Tab>}
                </Tabs>
              </div>
            </div>
            {this.renderButtonBar()}
          </div>
        </PlottrModal>
      )
    }
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
    ui: PropTypes.object.isRequired,
    books: PropTypes.object.isRequired,
    isSeries: PropTypes.bool.isRequired,
    customAttributes: PropTypes.array.isRequired,
    uiActions: PropTypes.object.isRequired,
    customAttributeActions: PropTypes.object.isRequired,
  }

  const Pure = PureComponent(CardDialog)

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
          beats: selectors.sortedBeatsByBookSelector(state.present),
          lines: selectors.sortedLinesByBookSelector(state.present),
          tags: selectors.sortedTagsSelector(state.present),
          characters: selectors.charactersSortedAtoZSelector(state.present),
          places: selectors.placesSortedAtoZSelector(state.present),
          customAttributes: state.present.customAttributes.scenes,
          ui: state.present.ui,
          books: state.present.books,
          isSeries: selectors.isSeriesSelector(state.present),
        }
      },
      (dispatch) => {
        return {
          actions: bindActionCreators(actions.card, dispatch),
          uiActions: bindActionCreators(actions.ui, dispatch),
          customAttributeActions: bindActionCreators(actions.customAttribute, dispatch),
        }
      }
    )(Pure)
  }

  throw new Error('Could not connect CardDialog')
}

export default CardDialogConnector
