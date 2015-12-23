import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Modal from 'react-modal'
import _ from 'lodash'
import MarkDown from 'pagedown'
import * as CardActions from 'actions/cards'
import { card } from 'store/initialState'
import { ButtonToolbar, Button, DropdownButton, MenuItem, Input, Label } from 'react-bootstrap'
import 'style!css!sass!css/card_dialog.css.scss'

Modal.setAppElement('#timelineview-root')
const md = MarkDown.getSanitizingConverter()

const customStyles = {content: {top: '70px'}}

class CardDialog extends Component {
  constructor (props) {
    super(props)
    this.state = {editing: props.isNewCard}
  }

  closeDialog () {
    this.props.closeDialog()
  }

  handleCreate () {
    var title = this.refs.titleInput.getValue()
    var desc = this.refs.descriptionInput.getValue()
    var newCard = this.buildCard(title, desc)
    this.props.actions.addCard(newCard)
    this.closeDialog()
  }

  buildCard (title, description) {
    return {
      title: title || card.title,
      description: description || card.description,
      lineId: this.props.lineId,
      sceneId: this.props.sceneId
    }
  }

  deleteCard () {
    if (window.confirm(`Do you want to delete this card: '${this.props.card.title}'?`)) {
      this.props.actions.deleteCard(this.props.card.id)
    }
  }

  startEdit () {
    this.setState({editing: true})
  }

  saveEdit () {
    var newTitle = this.refs.titleInput.getValue() || this.props.card.title
    var newDescription = this.refs.descriptionInput.getValue() || this.props.card.description
    this.props.actions.editCard(this.props.card.id, newTitle, newDescription)
    this.setState({editing: false})
  }

  changeScene (sceneId) {
    this.props.actions.changeScene(this.props.card.id, sceneId)
  }

  changeLine (lineId) {
    this.props.actions.changeLine(this.props.card.id, lineId)
  }

  getCurrentScene () {
    return _.find(this.props.scenes, (scene) => {
      return scene.id === this.props.sceneId
    })
  }

  getCurrentLine () {
    return _.find(this.props.lines, (line) => {
      return line.id === this.props.lineId
    })
  }

  renderSceneItems () {
    var scenes = _.sortBy(this.props.scenes, 'position')
    return scenes.map((scene) => {
      return (<MenuItem
        key={scene.id}
        onSelect={this.changeScene.bind(this, scene.id)} >
        {scene.title}
      </MenuItem>)
    })
  }

  renderLineItems () {
    var lines = _.sortBy(this.props.lines, 'position')
    return lines.map((line) => {
      return (<MenuItem
        key={line.id}
        onSelect={this.changeLine.bind(this, line.id)} >
        {line.title}
      </MenuItem>)
    })
  }

  renderButtonBar () {
    if (this.props.isNewCard) {
      return (
        <ButtonToolbar className='card-dialog__button-bar-edit'>
          <Button className='card-dialog__create' bsStyle='success'
            onClick={this.handleCreate.bind(this)}>
            Create
          </Button>
          <Button className='card-dialog__cancel' bsStyle='danger'
            onClick={this.closeDialog.bind(this)}>
            Cancel
          </Button>
        </ButtonToolbar>
      )
    } else if (this.state.editing) {
      return (
        <ButtonToolbar className='card-dialog__button-bar-edit'>
          <Button bsStyle='danger'
            onClick={() => this.setState({editing: false})} >
            Cancel
          </Button>
          <Button bsStyle='success'
            onClick={this.saveEdit.bind(this)}>
            Save
          </Button>
        </ButtonToolbar>
      )
    } else {
      return (
        <ButtonToolbar className='card-dialog__button-bar-edit'>
          <Button className='card-dialog__close'
            bsStyle='primary'
            onClick={this.closeDialog.bind(this)}>
            Close
          </Button>
          <Button className='card-dialog__edit'
            bsStyle='success'
            onClick={this.startEdit.bind(this)}>
            Edit
          </Button>
          <Button className='card-dialog__delete' bsStyle='danger'
            onClick={this.deleteCard.bind(this)} >
            Delete
          </Button>
        </ButtonToolbar>
      )
    }
  }

  renderTitle () {
    var title = 'Cool thing happens'
    if (!this.props.isNewCard) {
      title = this.props.card.title
    }

    if (this.state.editing) {
      return <Input type='text' ref='titleInput' placeholder={title} />
    } else {
      return (
        <div className='card-dialog__title'>
          <h2 className='card-title-editor__display'>
            {title}
          </h2>
        </div>
      )
    }
  }

  renderDescription () {
    var description = 'Desciption of cool thing happening'
    if (!this.props.isNewCard) {
      description = this.props.card.description
    }

    if (this.state.editing) {
      return <Input type='textarea' rows='13' ref='descriptionInput' placeholder={description} />
    } else {
      return (
        <div
          dangerouslySetInnerHTML={{__html: md.makeHtml(description)}} >
        </div>
      )
    }
  }

  renderLabels () {
    var characters = this.renderCharacters()
    var places = this.renderPlaces()
    var tags = this.renderTags()
    return (
      <div className='card-dialog__labels'>
        {characters}
        {places}
        {tags}
      </div>
    )
  }

  renderTags () {
    return this.props.card.tags.map(tId =>
      <Label bsStyle='info' key={tId}>{_.result(_.find(this.props.tags, 'id', tId), 'title')}</Label>
    )
  }

  renderPlaces () {
    return this.props.card.places.map(pId =>
      <Label bsStyle='info' key={pId}>{_.result(_.find(this.props.places, 'id', pId), 'name')}</Label>
    )
  }

  renderCharacters () {
    return this.props.card.characters.map(cId =>
      <Label bsStyle='info' key={cId}>{_.result(_.find(this.props.characters, 'id', cId), 'name')}</Label>
    )
  }

  renderPositionDetails () {
    var ids = {
      scene: _.uniqueId('select-scene-'),
      line: _.uniqueId('select-line-')
    }

    return (
      <div className='card-dialog__position-details'>
        <div className='card-dialog__line'>
          <label className='card-dialog__line-label' htmlFor={ids.line}>Line:
            <DropdownButton id={ids.line} className='card-dialog__select-line' title={this.getCurrentLine().title}>
              {this.renderLineItems()}
            </DropdownButton>
          </label>
        </div>
        <div className='card-dialog__scene'>
          <label className='card-dialog__scene-label' htmlFor={ids.scene}>Scene:
            <DropdownButton id={ids.scene} className='card-dialog__select-scene' title={this.getCurrentScene().title}>
              {this.renderSceneItems()}
            </DropdownButton>
          </label>
        </div>
        {this.renderLabels()}
      </div>
    )
  }

  render () {
    return (
      <Modal isOpen={true} onRequestClose={this.closeDialog.bind(this)} style={customStyles}>
        <div className='card-dialog'>
          {this.renderTitle()}
          {this.renderPositionDetails()}
          <div className='card-dialog__description'>
            {this.renderDescription()}
          </div>
          {this.renderButtonBar()}
        </div>
      </Modal>
    )
  }
}

CardDialog.propTypes = {
  card: PropTypes.object,
  sceneId: PropTypes.number.isRequired,
  lineId: PropTypes.number.isRequired,
  isNewCard: PropTypes.bool.isRequired,
  closeDialog: PropTypes.func,
  lines: PropTypes.array.isRequired,
  scenes: PropTypes.array.isRequired,
  actions: PropTypes.object.isRequired,
  tags: PropTypes.array.isRequired,
  characters: PropTypes.array.isRequired,
  places: PropTypes.array.isRequired
}

function mapStateToProps (state) {
  return {
    lines: state.lines,
    scenes: state.scenes,
    tags: state.tags,
    characters: state.characters,
    places: state.places
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(CardActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CardDialog)
