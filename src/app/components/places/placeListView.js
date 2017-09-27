import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Glyphicon, Nav, Navbar, NavItem, Button, Input, Label } from 'react-bootstrap'
import Modal from 'react-modal'
import * as PlaceActions from 'actions/places'
import * as CustomAttributeActions from 'actions/customAttributes'
import PlaceView from 'components/places/placeView'

const modalStyles = {content: {top: '70px'}}

class PlaceListView extends Component {

  constructor (props) {
    super(props)
    this.state = {dialogOpen: false, addAttrText: '', placeDetailId: props.places[0].id}
  }

  componentWillReceiveProps (nextProps) {
    const place = nextProps.places.find(pl =>
      pl.name === ''
    )
    if (place) this.setState({placeDetailId: place.id})
  }

  closeDialog = () => {
    this.setState({dialogOpen: false})
  }

  handleCreateNewPlace = () => {
    this.props.actions.addPlace()
  }

  handleType = () => {
    const attr = this.refs.attrInput.getValue()
    this.setState({addAttrText: attr})
  }

  handleAddCustomAttr = (event) => {
    if (event.which === 13) {
      const attr = this.refs.attrInput.getValue()
      this.props.customAttributeActions.addPlaceAttr(attr)
      this.setState({addAttrText: ''})
    }
  }

  removeAttr (attr) {
    this.props.customAttributeActions.removePlaceAttr(attr)
    this.setState({addAttrText: this.state.addAttrText}) // no op
  }

  renderSubNav () {
    return (
      <Navbar className='subnav__container'>
        <Nav bsStyle='pills' >
          <NavItem>
            <Button bsSize='small' onClick={() => this.setState({dialogOpen: true})}><Glyphicon glyph='list' /> Custom Attributes</Button>
          </NavItem>
        </Nav>
      </Navbar>
    )
  }

  renderPlaces () {
    const places = this.props.places.map((pl, idx) =>
      <a href='#' key={idx} className='list-group-item' onClick={() => this.setState({placeDetailId: pl.id})}>
        <h6 className='list-group-item-heading'>{pl.name}</h6>
        <p className='list-group-item-text'>{pl.description}</p>
      </a>
    )
    return (<div className='place-list__list list-group'>
        {places}
        <a href='#' key={'new-place'} className='place-list__new list-group-item' onClick={this.handleCreateNewPlace} >
          <Glyphicon glyph='plus' />
        </a>
      </div>
    )
  }

  renderPlaceDetails () {
    let place = this.props.places.find(pl =>
      pl.id === this.state.placeDetailId
    )
    if (!place) place = this.props.places[0]
    return <PlaceView key={`place-${place.id}`} place={place} />
  }

  renderCustomAttributes () {
    const attrs = this.props.customAttributes.map((attr, idx) =>
      <li className='list-group-item' key={idx}>
        <p className='place-list__attribute-name'>{attr}</p>
        <Button onClick={() => this.removeAttr(attr)}><Glyphicon glyph='remove'/></Button>
      </li>
    )
    return (<Modal isOpen={this.state.dialogOpen} onRequestClose={this.closeDialog} style={modalStyles}>
      <div>
        <h3>Custom Attributes for Places</h3>
        <p className='sub-header'>Choose what you want to track about your places</p>
        <div className='character-list__custom-attributes-add-button'>
          <Input type='text' ref='attrInput' label='Add attributes' value={this.state.addAttrText} onChange={this.handleType} onKeyDown={this.handleAddCustomAttr} />
        </div>
        <div className='place-list__custom-attributes-list-wrapper'>
          {attrs}
        </div>
      </div>
    </Modal>)
  }

  render () {
    return (
      <div className='place-list container-with-sub-nav'>
        {this.renderSubNav()}
        {this.renderCustomAttributes()}
        <h1 className='secondary-text'>Places</h1>
        {this.renderPlaceDetails()}
        {this.renderPlaces()}
      </div>
    )
  }
}

PlaceListView.propTypes = {
  places: PropTypes.array.isRequired,
  actions: PropTypes.object.isRequired,
  customAttributeActions: PropTypes.object.isRequired
}

function mapStateToProps (state) {
  return {
    places: state.places,
    customAttributes: state.customAttributes['places']
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(PlaceActions, dispatch),
    customAttributeActions: bindActionCreators(CustomAttributeActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PlaceListView)
