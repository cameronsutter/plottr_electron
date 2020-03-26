import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import i18n from 'format-message'
import { Glyphicon, Button } from 'react-bootstrap'
import * as types from 'constants/ActionTypes'
import StoryName from 'components/history/StoryName'
import AddScene from 'components/history/AddScene'
import EditScene from 'components/history/EditScene'
import DeleteScene from 'components/history/DeleteScene'
import AddCard from 'components/history/AddCard'
import CardDetails from 'components/history/CardDetails'
import CardCoordinates from 'components/history/CardCoordinates'
import DeleteCard from 'components/history/DeleteCard'
import AddLine from 'components/history/AddLine'
import LineTitle from 'components/history/LineTitle'
import LineColor from 'components/history/LineColor'
import Reorder from 'components/history/Reorder'
import DeleteLine from 'components/history/DeleteLine'
import AddPlace from 'components/history/AddPlace'
import EditPlace from 'components/history/EditPlace'
import DeletePlace from 'components/history/DeletePlace'
import DeleteTag from 'components/history/DeleteTag'
import DeleteCharacter from 'components/history/DeleteCharacter'
import AddNote from 'components/history/AddNote'
import EditNote from 'components/history/EditNote'
import DeleteNote from 'components/history/DeleteNote'
import AddCustomAttribute from 'components/history/AddCustomAttribute'
import RemoveCustomAttribute from 'components/history/RemoveCustomAttribute'
import AddThingToThing from 'components/history/AddThingToThing'

class HistoryItem extends Component {
  constructor (props) {
    super(props)
    this.state = {showDetails: false, redo: false}
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.undone) this.setState({redo: true})
  }

  toggleDetails = (e) => {
    this.setState({showDetails: !this.state.showDetails})
  }

  undo (e) {
    e.stopPropagation()
    this.setState({redo: true})
    this.props.undo(this.props.item.id)
  }

  redo (e) {
    e.stopPropagation()
    this.setState({redo: false})
    this.props.redo(this.props.item.id)
  }

  renderTypeName (type) {
    return type.replace(/_/g, ' ').toLowerCase()
  }

  renderButton () {
    var style = this.state.showDetails ? {alignSelf: 'flex-start'} : {}
    if (this.state.redo) {
      return <Button bsStyle='primary' bsSize='small' style={style} onClick={this.redo.bind(this)}>
        <Glyphicon glyph='repeat' /> {i18n('Redo')}</Button>
    } else {
      return <Button bsStyle='danger' bsSize='small' style={style} onClick={this.undo.bind(this)}>
        <Glyphicon glyph='remove' /> {i18n('Undo')}</Button>
    }
  }

  renderDetailsByType (type, item) {
    switch (type) {
      case types.ADD_SCENE:
        return <AddScene item={item} />
      case types.EDIT_SCENE_TITLE:
        return <EditScene item={item} />
      case types.ADD_CARD:
        return <AddCard item={item} />
      case types.EDIT_CARD_DETAILS:
        return <CardDetails item={item} />
      case types.CHANGE_LINE:
      case types.CHANGE_SCENE:
      case types.EDIT_CARD_COORDINATES:
        return <CardCoordinates item={item} />
      case types.DELETE_CARD:
        return <DeleteCard item={item} />
      case types.ADD_LINE:
        return <AddLine item={item} />
      case types.EDIT_LINE_TITLE:
        return <LineTitle item={item} />
      case types.EDIT_LINE_COLOR:
        return <LineColor item={item} />
      case types.DELETE_LINE:
        return <DeleteLine item={item} />
      case types.ADD_PLACE:
      case types.ADD_CHARACTER:
      case types.ADD_TAG:
        return <AddPlace item={item} />
      case types.EDIT_PLACE:
      case types.EDIT_CHARACTER:
      case types.EDIT_TAG:
        return <EditPlace item={item} />
      case types.ADD_NOTE:
        return <AddNote item={item} />
      case types.EDIT_NOTE:
        return <EditNote item={item} />
      case types.DELETE_NOTE:
        return <DeleteNote item={item} />
      case types.DELETE_CHARACTER:
        return <DeleteCharacter item={item} />
      case types.DELETE_PLACE:
        return <DeletePlace item={item} />
      case types.DELETE_TAG:
        return <DeleteTag item={item} />
      case types.ADD_PLACES_ATTRIBUTE:
      case types.ADD_CHARACTER_ATTRIBUTE:
        return <AddCustomAttribute item={item} />
      case types.REMOVE_PLACES_ATTRIBUTE:
      case types.REMOVE_CHARACTER_ATTRIBUTE:
        return <RemoveCustomAttribute item={item} />
      case types.ATTACH_CHARACTER_TO_NOTE:
      case types.ATTACH_CHARACTER_TO_CARD:
      case types.ATTACH_PLACE_TO_NOTE:
      case types.ATTACH_PLACE_TO_CARD:
      case types.ATTACH_TAG_TO_NOTE:
      case types.ATTACH_TAG_TO_CARD:
      case types.REMOVE_CHARACTER_FROM_NOTE:
      case types.REMOVE_CHARACTER_FROM_CARD:
      case types.REMOVE_PLACE_FROM_NOTE:
      case types.REMOVE_PLACE_FROM_CARD:
      case types.REMOVE_TAG_FROM_NOTE:
      case types.REMOVE_TAG_FROM_CARD:
        return <AddThingToThing item={item} />
      default:
        return <div>{type}</div>
    }
  }

  render () {
    const type = this.props.item.action.type
    var details = this.renderDetailsByType(type, this.props.item)
    var button = this.renderButton()
    var detailStyle = this.state.showDetails ? {display: 'block'} : {}
    var containerClass = 'history-component__item__container'
    containerClass = this.state.redo ? `${containerClass} redo` : containerClass
    return (
      <div className='history-component__item' onClick={this.toggleDetails}>
        <div className={containerClass}>
          <div className='history-component__type'><strong>{this.renderTypeName(type)}</strong></div>
          <div className='history-component__details' style={detailStyle} >{details}</div>
        </div>
        {button}
      </div>
    )
  }
}

HistoryItem.propTypes = {
  item: PropTypes.object.isRequired,
  undone: PropTypes.bool.isRequired,
  undo: PropTypes.func.isRequired,
  redo: PropTypes.func.isRequired
}

function mapStateToProps (state) {
  return {
  }
}

function mapDispatchToProps (dispatch) {
  return {
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HistoryItem)
