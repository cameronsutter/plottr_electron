import _ from 'lodash'
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Glyphicon, Nav, Navbar, NavItem, Button, Input, Label } from 'react-bootstrap'
import Modal from 'react-modal'
import * as PlaceActions from 'actions/places'
import * as CustomAttributeActions from 'actions/customAttributes'
import PlaceView from 'components/places/placeView'

const modalStyles = {content: {top: '70px', width: '50%', marginLeft: '25%'}}

class PlaceListView extends Component {

  constructor (props) {
    super(props)
    let id = null
    if (props.places.length > 0) id = props.places[0].id
    this.state = {dialogOpen: false, addAttrText: '', placeDetailId: id}
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
    let subNavKlasses = 'subnav__container'
    if (this.props.ui.darkMode) subNavKlasses += ' darkmode'
    return (
      <Navbar className={subNavKlasses}>
        <Nav bsStyle='pills' >
          <NavItem>
            <Button bsSize='small' onClick={() => this.setState({dialogOpen: true})}><Glyphicon glyph='list' /> Custom Attributes</Button>
          </NavItem>
        </Nav>
      </Navbar>
    )
  }

  renderPlaces () {
    let klasses = 'place-list__list list-group'
    if (this.props.ui.darkMode) klasses += ' darkmode'
    const sortedPlaces = _.sortBy(this.props.places, ['name', 'id'])
    const places = sortedPlaces.map((pl, idx) =>
      <a href='#' key={idx} className='list-group-item' onClick={() => this.setState({placeDetailId: pl.id})}>
        <h6 className='list-group-item-heading'>{pl.name}</h6>
        <p className='list-group-item-text'>{pl.description}</p>
      </a>
    )
    return (<div className={klasses}>
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
    ) || this.props.places[0]
    if (place) {
      return <PlaceView key={`place-${place.id}`} place={place} />
    } else {
      return null
    }
  }

  renderCustomAttributes () {
    const attrs = this.props.customAttributes.map((attr, idx) =>
      <li className='list-group-item' key={idx}>
        <p className='place-list__attribute-name'>{attr}</p>
        <Button onClick={() => this.removeAttr(attr)}><Glyphicon glyph='remove'/></Button>
      </li>
    )
    let klasses = 'custom-attributes__wrapper'
    if (this.props.ui.darkMode) {
      klasses += ' darkmode'
      modalStyles.content.backgroundColor = '#888'
    }
    return (<Modal isOpen={this.state.dialogOpen} onRequestClose={this.closeDialog} style={modalStyles}>
      <div className={klasses}>
        <Button className='pull-right card-dialog__close' onClick={this.closeDialog}>
          Close
        </Button>
        <h3>Custom Attributes for Places</h3>
        <p className='sub-header'>Choose what you want to track about your places</p>
        <div className='character-list__custom-attributes-add-button'>
          <Input type='text' ref='attrInput' label='Add attributes' value={this.state.addAttrText} onChange={this.handleType} onKeyDown={this.handleAddCustomAttr} />
          <Button bsStyle='success' onClick={this.handleAddCustomAttr}>
            Add
          </Button>
        </div>
        <div className='place-list__custom-attributes-list-wrapper'>
          {attrs}
        </div>
      </div>
    </Modal>)
  }

  render () {
    let klasses = 'secondary-text'
    if (this.props.ui.darkMode) klasses += ' darkmode'
    return (
      <div className='place-list container-with-sub-nav'>
        {this.renderSubNav()}
        {this.renderCustomAttributes()}
        <h1 className={klasses}>Places</h1>
        {this.renderPlaceDetails()}
        {this.renderPlaces()}
      </div>
    )
  }
}

PlaceListView.propTypes = {
  places: PropTypes.array.isRequired,
  actions: PropTypes.object.isRequired,
  customAttributeActions: PropTypes.object.isRequired,
  ui: PropTypes.object.isRequired,
}

function mapStateToProps (state) {
  return {
    places: state.places,
    customAttributes: state.customAttributes['places'],
    ui: state.ui,
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
