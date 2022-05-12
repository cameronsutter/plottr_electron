import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import _ from 'lodash'
import { FaGripLinesVertical, FaCircle } from 'react-icons/fa'
import cx from 'classnames'

import { t as i18n } from 'plottr_locales'

import ButtonToolbar from '../ButtonToolbar'
import Glyphicon from '../Glyphicon'
import FormGroup from '../FormGroup'
import FormControl from '../FormControl'
import Button from '../Button'
import UnconnectedRichText from '../rce/RichText'
import TagLabel from '../TagLabel'
import UnconnectedImage from '../images/Image'
import UnconnectedSelectList from '../SelectList'
import { checkDependencies } from '../checkDependencies'

const CardViewConnector = (connector) => {
  const RichText = UnconnectedRichText(connector)
  const Image = UnconnectedImage(connector)
  const SelectList = UnconnectedSelectList(connector)

  const {
    pltr: { helpers },
  } = connector
  checkDependencies({ helpers })

  class CardView extends Component {
    constructor(props) {
      super(props)
      this.state = {
        editing: false,
        dragging: false,
        inDropZone: false,
        dropDepth: 0,
      }

      this.editorPath = helpers.editors.cardDescriptionEditorPath(props.card.id)
      this.titleInputRef = null
      this.componentRef = null
    }

    shouldComponentUpdate(nextProps, nextState) {
      const stateChanged = Object.keys(nextState).reduce((acc, key) => {
        return acc || nextState[key] !== this.state[key]
      }, false)
      const propsChanged = Object.keys(nextProps).reduce((acc, key) => {
        if (key === 'card' || key === 'selection') return acc
        return acc || nextProps[key] !== this.props[key]
      }, false)
      const tagsChanged = this.props.card.tags !== nextProps.card.tags
      return stateChanged || propsChanged || tagsChanged
    }

    componentWillUnmount() {
      if (this.state.editing) this.saveEdit()
    }

    saveEdit = () => {
      const { card, actions } = this.props
      var newTitle = this.titleInputRef.value || card.title
      actions.editCard(card.id, newTitle, card.description, card.templates, {})
      this.setState({ editing: false })
      this.deregisterEventListeners()
    }

    handleEnter = (event) => {
      if (event.which === 13) {
        this.saveEdit()
      }
    }

    handleEsc = (event) => {
      if (event.which === 27) {
        this.saveEdit()
      }
    }

    handleDragStart = (e) => {
      this.setState({ dragging: true, editing: false })
      this.deregisterEventListeners()
      const { card, index } = this.props
      const lineId = card.lineId
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/json', JSON.stringify({ cardId: card.id, lineId, index }))
    }

    handleDragEnd = () => {
      this.setState({ dragging: false })
    }

    registerEventListeners = () => {
      document.addEventListener('click', this.handleClickOutside, true)
    }

    deregisterEventListeners() {
      document.removeEventListener('click', this.handleClickOutside, true)
    }

    handleClickOutside = (e) => {
      // FIXME: this event causes a cascade of events that's *very*
      // expensive.  The purpose is to save the card that we're
      // editing.  It might be better to have that component
      // communicate that it's being edited to the redux store and
      // then, when we hit this point we can decide whether or not to
      // save the card on its behalf.

      // Only handle the event if our child is being edited
      if (!this.state.editing) return

      // We can't close the editor if we were picking an image, and
      // that's a different component.
      const imagePickerModal = document.querySelector('.image-picker__wrapper')
      if (imagePickerModal) return

      if (this.componentRef && !this.componentRef.contains(e.target)) {
        this.saveEdit()
      }
    }

    editOnClick = () => {
      if (!this.state.editing) {
        this.setState({ editing: true })
        this.registerEventListeners()
      }
    }

    handleDragEnter = (e) => {
      // https://www.smashingmagazine.com/2020/02/html-drag-drop-api-react/
      if (!this.state.dragging) this.setState({ dropDepth: this.state.dropDepth + 1 })
    }

    handleDragOver = (e) => {
      e.preventDefault()
      if (!this.state.dragging) this.setState({ inDropZone: true })
    }

    handleDragLeave = (e) => {
      if (!this.state.dragging) {
        let dropDepth = this.state.dropDepth
        --dropDepth
        this.setState({ dropDepth: dropDepth })
        if (dropDepth > 0) return
        this.setState({ inDropZone: false })
      }
    }

    handleDrop = (e) => {
      e.stopPropagation()
      e.preventDefault()
      if (this.state.dragging) return
      this.setState({ inDropZone: false, dropDepth: 0 })

      const json = e.dataTransfer.getData('text/json')
      const droppedData = JSON.parse(json)
      if (!droppedData.cardId) return

      this.props.reorder({
        current: this.props.card,
        currentIndex: this.props.index,
        dropped: droppedData,
      })
    }

    renderDropZone() {
      if (!this.state.inDropZone) return

      return (
        <div className="outline__card-drop">
          <FaCircle />
        </div>
      )
    }

    renderTitle() {
      const { title } = this.props.card
      if (!this.state.editing) return null

      return (
        <FormGroup>
          <FormControl
            onKeyPress={this.handleEnter}
            onKeyDown={this.handleEsc}
            type="text"
            inputRef={(ref) => {
              this.titleInputRef = ref
            }}
            defaultValue={title}
          />
        </FormGroup>
      )
    }

    handleDescriptionChange = (newDescription, editorPath, selection) => {
      this.props.actions.editCardAttributes(
        this.props.card.id,
        newDescription ? { description: newDescription } : null,
        editorPath,
        selection
      )
    }

    renderDescription() {
      const { description } = this.props.card
      return (
        <div className="outline__description__editing" onKeyDown={this.handleEsc}>
          <RichText
            autofocus
            id={this.editorPath}
            className="outline__description"
            onChange={this.handleDescriptionChange}
            description={description}
            selection={this.props.selection}
            editable={this.state.editing}
          />
          {this.state.editing && (
            <ButtonToolbar className="card-dialog__button-bar">
              <Button onClick={this.saveEdit}>{i18n('Close')}</Button>
            </ButtonToolbar>
          )}
        </div>
      )
    }

    renderTags() {
      return this.props.card.tags.map((tId) => {
        var tag = this.props.tags.find((t) => t.id == tId)
        if (!tag) return null
        return <TagLabel tag={tag} key={`outline-taglabel-${tId}`} />
      })
    }

    renderChipCloud(ids, list) {
      if (!ids.length) return null

      const chips = ids.map((id, idx) => {
        const thing = list.find((l) => l.id == id)
        if (!thing) return null
        const key = `${idx}-${id}`
        return (
          <div key={key} className="chip">
            <Image size="xs" shape="circle" imageId={thing.imageId} />
            <span>{thing.name}</span>
          </div>
        )
      })

      return <div className="chip-cloud">{chips}</div>
    }

    renderCharacters() {
      const { card, characters } = this.props
      return this.renderChipCloud(card.characters, characters)
    }

    renderPlaces() {
      const { card, places } = this.props
      return this.renderChipCloud(card.places, places)
    }

    renderDivider() {
      const { card } = this.props
      if (!card.tags.length && !card.characters.length && !card.places.length) return null

      return <div className="divider" />
    }

    render() {
      const { actions, card, line, darkMode, characters, places, tags } = this.props
      const style = { color: line.color }
      return card.isEmpty ? null : (
        <div
          ref={(ref) => {
            this.componentRef = ref
          }}
          className="outline__card-wrapper"
          onDragEnter={this.handleDragEnter}
          onDragOver={this.handleDragOver}
          onDragLeave={this.handleDragLeave}
          onDrop={this.handleDrop}
        >
          {this.renderDropZone()}
          <div className={cx('outline-list__card-view', { darkmode: darkMode })}>
            <div className="outline__card-top">
              <div style={style} className="outline__card__line-title">
                {line.title}
              </div>
              <div
                className={cx('outline__card__grip', {
                  editing: this.state.editing,
                  dragging: this.state.dragging,
                })}
                draggable
                onDragStart={this.handleDragStart}
                onDragEnd={this.handleDragEnd}
              >
                <FaGripLinesVertical />
                {this.state.editing ? null : <h5>{card.title}</h5>}
              </div>
            </div>
            <div
              className={cx('outline__card__description', { editing: this.state.editing })}
              onClick={this.editOnClick}
            >
              {this.renderTitle()}
              {this.renderDescription()}
              <Glyphicon glyph="pencil" />
            </div>
            <div className="divider" />
            <div className="outline__card-bottom">
              <SelectList
                parentId={card.id}
                type={'Characters'}
                selectedItems={card.characters}
                allItems={characters}
                add={actions.addCharacter}
                remove={actions.removeCharacter}
                horizontal
              />
              <SelectList
                parentId={card.id}
                type={'Places'}
                selectedItems={card.places}
                allItems={places}
                add={actions.addPlace}
                remove={actions.removePlace}
                horizontal
              />
              <SelectList
                parentId={card.id}
                type={'Tags'}
                selectedItems={card.tags}
                allItems={tags}
                add={actions.addTag}
                remove={actions.removeTag}
                horizontal
              />
            </div>
          </div>
        </div>
      )
    }
  }

  CardView.propTypes = {
    card: PropTypes.object.isRequired,
    selection: PropTypes.object,
    index: PropTypes.number.isRequired,
    reorder: PropTypes.func.isRequired,
    line: PropTypes.object.isRequired,
    tags: PropTypes.array.isRequired,
    characters: PropTypes.array.isRequired,
    places: PropTypes.array.isRequired,
    darkMode: PropTypes.bool,
    actions: PropTypes.object.isRequired,
    images: PropTypes.object,
  }

  const {
    redux,
    pltr: { selectors, actions },
  } = connector
  checkDependencies({ redux, selectors, actions })

  if (redux) {
    const { connect, bindActionCreators } = redux

    const CardActions = actions.card

    return connect(
      (state, ownProps) => {
        let line = state.present.lines.find((l) => l.id == ownProps.card.lineId)
        return {
          line: line,
          selection: selectors.selectionSelector(
            state.present,
            helpers.editors.cardDescriptionEditorPath(ownProps.card.id)
          ),
          characters: selectors.charactersSortedAtoZSelector(state.present),
          places: selectors.placesSortedAtoZSelector(state.present),
          tags: selectors.sortedTagsSelector(state.present),
          darkMode: selectors.isDarkModeSelector(state.present),
        }
      },
      (dispatch) => {
        return {
          actions: bindActionCreators(CardActions, dispatch),
        }
      }
    )(CardView)
  }

  throw new Error('Could not connect CardView')
}

export default CardViewConnector
