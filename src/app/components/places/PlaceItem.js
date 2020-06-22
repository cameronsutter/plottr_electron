import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { findDOMNode } from 'react-dom'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Glyphicon, Button, ButtonGroup } from 'react-bootstrap'
import * as PlaceActions from 'actions/places'
import i18n from 'format-message'
import Image from '../images/Image'
import cx from 'classnames'
import DeleteConfirmModal from '../dialogs/DeleteConfirmModal'

class PlaceItem extends Component {
  state = {deleting: false}

  componentDidMount () {
    this.scrollIntoView()
  }

  componentDidUpdate () {
    this.scrollIntoView()
  }

  scrollIntoView = () => {
    if (this.props.selected) {
      const node = findDOMNode(this)
      if (node) node.scrollIntoViewIfNeeded()
    }
  }

  deletePlace = e => {
    e.stopPropagation()
    this.props.actions.deletePlace(this.props.place.id)
  }

  cancelDelete = e => {
    e.stopPropagation()
    this.setState({deleting: false})
  }

  handleDelete = e => {
    e.stopPropagation()
    this.setState({deleting: true})
    // this.props.stopEdit()
  }

  selectPlace = () => {
    const { place, selected, select, startEdit } = this.props
    if (selected) {
      // startEdit()
    } else {
      select(place.id)
    }
  }

  startEditing = e => {
    e.stopPropagation()
    this.props.select(this.props.place.id)
    this.props.startEdit()
  }

  renderDelete () {
    if (!this.state.deleting) return null

    return <DeleteConfirmModal name={this.props.place.name} onDelete={this.deletePlace} onCancel={this.cancelDelete}/>
  }

  render () {
    const { place, selected } = this.props
    let img = null
    if (place.imageId) {
      img = <div className='place-list__item-inner__image-wrapper'>
        <Image size='small' shape='rounded' imageId={place.imageId} />
      </div>
    }
    const klasses = cx('list-group-item', {selected: selected})
    const buttonKlasses = cx('place-list__item-buttons', {visible: selected})
    return <div className={klasses} onClick={this.selectPlace}>
      { this.renderDelete() }
      <div className='place-list__item-inner'>
        {img}
        <div>
          <h6 className='list-group-item-heading'>{place.name || i18n('New Place')}</h6>
          <p className='list-group-item-text'>{place.description.substr(0, 100)}</p>
        </div>
        <ButtonGroup className={buttonKlasses}>
          <Button onClick={this.handleDelete}><Glyphicon glyph='trash' /></Button>
        </ButtonGroup>
      </div>
    </div>
  }

  static propTypes = {
    place: PropTypes.object.isRequired,
    selected: PropTypes.bool.isRequired,
    select: PropTypes.func.isRequired,
    actions: PropTypes.object.isRequired,
  }
}

function mapStateToProps (state) {
  return {
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(PlaceActions, dispatch),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PlaceItem)