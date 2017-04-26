import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Modal from 'react-modal'
import _ from 'lodash'
import MarkDown from 'pagedown'
import * as CardActions from 'actions/cards'
import { card } from 'store/initialState'
import { shell } from 'electron'
import { ButtonToolbar, Button, DropdownButton,
  MenuItem, Input, Label, Glyphicon, Popover, OverlayTrigger } from 'react-bootstrap'
import SelectList from 'components/selectList'

Modal.setAppElement('#timelineview-root')
const md = MarkDown.getSanitizingConverter()

const customStyles = {content: {top: '70px'}}

class CardDialog extends Component {
  constructor (props) {
    super(props)
    this.state = {editing: false}
  }

  closeDialog () {
    this.props.closeDialog()
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

  handleEnter (event) {
    if (event.which === 13) {
      this.saveEdit()
    }
  }

  changeScene (sceneId) {
    this.props.actions.changeScene(this.props.card.id, sceneId)
  }

  changeLine (lineId) {
    this.props.actions.changeLine(this.props.card.id, lineId)
  }

  getCurrentScene () {
    return _.find(this.props.scenes, {id: this.props.sceneId})
  }

  getCurrentLine () {
    return _.find(this.props.lines, {id: this.props.lineId})
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
    if (this.state.editing) {
      return (
        <ButtonToolbar className='card-dialog__button-bar'>
          <Button
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
        <ButtonToolbar className='card-dialog__button-bar'>
          <Button className='card-dialog__close'
            onClick={this.closeDialog.bind(this)}>
            Close
          </Button>
          <Button className='card-dialog__edit'
            bsStyle='success'
            onClick={this.startEdit.bind(this)}>
            Edit
          </Button>
          <Button className='card-dialog__delete'
            onClick={this.deleteCard.bind(this)} >
            Delete
          </Button>
        </ButtonToolbar>
      )
    }
  }

  renderTitle () {
    var title = this.props.card.title
    if (this.state.editing) {
      return <Input
        onKeyPress={this.handleEnter.bind(this)}
        type='text' autoFocus
        label='title' ref='titleInput'
        defaultValue={title} />
    } else {
      return (
        <div
          onClick={() => this.setState({editing: true})}
          className='card-dialog__title'>
          <h2 className='card-title-editor__display'>
            {title}
          </h2>
        </div>
      )
    }
  }

  renderDescription () {
    var description = this.props.card.description

    if (this.state.editing) {
      const url = 'https://daringfireball.net/projects/markdown/syntax'
      return (
        <div>
          <Input type='textarea' rows='20' ref='descriptionInput' defaultValue={description} />
          <small>Format with markdown! <a href='#' onClick={() => shell.openExternal(url)}>learn how</a></small>
        </div>
      )
    } else {
      return (
        <div
          onClick={() => this.setState({editing: true})}
          dangerouslySetInnerHTML={{__html: this.makeLabels(md.makeHtml(description))}} >
        </div>
      )
    }
  }

  makeLabels (html) {
    var regex = /{{([\w\s]*)}}/gi
    var matches
    while ((matches = regex.exec(html)) !== null) {
      var labelText = matches[1].toLowerCase()
      if (this.props.labelMap[labelText] !== undefined) {
        var color = this.props.labelMap[labelText]
        html = html.replace(matches[0], `<span style='background-color:${color}' class='label label-info'>${labelText}</span>`)
      }
    }
    return html
  }

  renderLeftSide () {
    var ids = {
      scene: _.uniqueId('select-scene-'),
      line: _.uniqueId('select-line-')
    }

    return (
      <div className='card-dialog__left-side'>
        <div className='card-dialog__line'>
          <label className='card-dialog__details-label' htmlFor={ids.line}>Line:
            <DropdownButton id={ids.line} className='card-dialog__select-line' title={this.getCurrentLine().title}>
              {this.renderLineItems()}
            </DropdownButton>
          </label>
        </div>
        <div className='card-dialog__scene'>
          <label className='card-dialog__details-label' htmlFor={ids.scene}>Scene:
            <DropdownButton id={ids.scene} className='card-dialog__select-scene' title={this.getCurrentScene().title}>
              {this.renderSceneItems()}
            </DropdownButton>
          </label>
        </div>
        <SelectList
          parentId={this.props.card.id} type={'Characters'}
          selectedItems={this.props.card.characters}
          allItems={this.props.characters}
          add={this.props.actions.addCharacter}
          remove={this.props.actions.removeCharacter} />
        <SelectList
          parentId={this.props.card.id} type={'Places'}
          selectedItems={this.props.card.places}
          allItems={this.props.places}
          add={this.props.actions.addPlace}
          remove={this.props.actions.removePlace} />
        <SelectList
          parentId={this.props.card.id} type={'Tags'}
          selectedItems={this.props.card.tags}
          allItems={this.props.tags}
          add={this.props.actions.addTag}
          remove={this.props.actions.removeTag} />
      </div>
    )
  }

  render () {
    if (this.state.editing) {
      window.SCROLLWITHKEYS = false
    } else {
      window.SCROLLWITHKEYS = true
    }
    return (
      <Modal isOpen={true} onRequestClose={this.closeDialog.bind(this)} style={customStyles}>
        <div className='card-dialog'>
          {this.renderTitle()}
          <div className='card-dialog__body'>
            {this.renderLeftSide()}
            <div className='card-dialog__description'>
              <p className='card-dialog__details-label text-center'>Description:</p>
              {this.renderDescription()}
            </div>
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
  closeDialog: PropTypes.func,
  lines: PropTypes.array.isRequired,
  scenes: PropTypes.array.isRequired,
  actions: PropTypes.object.isRequired,
  tags: PropTypes.array.isRequired,
  characters: PropTypes.array.isRequired,
  places: PropTypes.array.isRequired,
  labelMap: PropTypes.object.isRequired
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
