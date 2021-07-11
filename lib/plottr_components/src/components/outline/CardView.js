import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { FormControl, FormGroup, ButtonToolbar, Button, Glyphicon } from 'react-bootstrap'
import _ from 'lodash'
import { t as i18n } from 'plottr_locales'
import UnconnectedRichText from '../rce/RichText'
import TagLabel from '../TagLabel'
import UnconnectedImage from '../images/Image'
import UnconnectedSelectList from '../SelectList'
import cx from 'classnames'
import { FaGripLinesVertical, FaCircle } from 'react-icons/fa'

const CardViewConnector = (connector) => {
  const RichText = UnconnectedRichText(connector)
  const Image = UnconnectedImage(connector)
  const SelectList = UnconnectedSelectList(connector)

  class CardView extends Component {
    constructor(props) {
      super(props)
      this.state = {
        editing: false,
        description: props.card.description,
        dragging: false,
        inDropZone: false,
        dropDepth: 0,
      }

      this.titleInputRef = null
    }

    componentWillUnmount() {
      if (this.state.editing) this.saveEdit()
    }

    saveEdit = () => {
      const { card, actions } = this.props
      var newTitle = this.titleInputRef.value || card.title
      actions.editCard(card.id, newTitle, this.state.description, card.templates, {})
      this.setState({ editing: false })
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
      const { card, index } = this.props
      const lineId = card.lineId
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/json', JSON.stringify({ cardId: card.id, lineId, index }))
    }

    handleDragEnd = () => {
      this.setState({ dragging: false })
    }

    editOnClick = () => {
      if (!this.state.editing) this.setState({ editing: true })
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

    renderDescription() {
      const { description } = this.props.card
      return (
        <div className="outline__description__editing">
          <RichText
            autofocus
            className="outline__description"
            onChange={(desc) => this.setState({ description: desc })}
            description={description}
            editable={this.state.editing}
            darkMode={this.props.ui.darkMode}
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
      const { actions, card, line, ui, characters, places, tags } = this.props
      const style = { color: line.color }
      return card.isEmpty ? null : (
        <div
          className="outline__card-wrapper"
          onDragEnter={this.handleDragEnter}
          onDragOver={this.handleDragOver}
          onDragLeave={this.handleDragLeave}
          onDrop={this.handleDrop}
        >
          {this.renderDropZone()}
          <div className={cx('outline-list__card-view', { darkmode: ui.darkMode })}>
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
    index: PropTypes.number.isRequired,
    reorder: PropTypes.func.isRequired,
    line: PropTypes.object.isRequired,
    tags: PropTypes.array.isRequired,
    characters: PropTypes.array.isRequired,
    places: PropTypes.array.isRequired,
    ui: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    images: PropTypes.object,
  }

  const {
    redux,
    pltr: {
      selectors: { sortedTagsSelector, charactersSortedAtoZSelector, placesSortedAtoZSelector },
      actions,
    },
  } = connector

  if (redux) {
    const { connect, bindActionCreators } = redux

    const CardActions = actions.card

    return connect(
      (state, ownProps) => {
        let line = state.present.lines.find((l) => l.id == ownProps.card.lineId)
        return {
          line: line,
          characters: charactersSortedAtoZSelector(state.present),
          places: placesSortedAtoZSelector(state.present),
          tags: sortedTagsSelector(state.present),
          ui: state.present.ui,
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
