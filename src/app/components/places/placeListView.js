import _ from 'lodash'
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Glyphicon, Nav, Navbar, NavItem, Button, Input, Label, Popover, OverlayTrigger, Alert } from 'react-bootstrap'
import Modal from 'react-modal'
import CustomAttrFilterList from 'components/customAttrFilterList'
import * as PlaceActions from 'actions/places'
import * as CustomAttributeActions from 'actions/customAttributes'
import PlaceView from 'components/places/placeView'
import i18n from 'format-message'

const modalStyles = {content: {top: '70px', width: '50%', marginLeft: '25%'}}

class PlaceListView extends Component {

  constructor (props) {
    super(props)
    let id = null
    let visible = []
    if (props.places.length > 0) {
      visible = this.visiblePlaces(props.places, null)
      id = this.detailID(visible)
    }
    this.state = {
      dialogOpen: false,
      addAttrText: '',
      placeDetailId: id,
      visiblePlaces: visible,
      filter: null,
    }
  }

  componentWillReceiveProps (nextProps) {
    if (nexProps.places.length > 0) {
      let visible = this.visiblePlaces(nextProps.places)
      this.setState({
        visiblePlaces: sorted,
        placeDetailId: this.detailID(visible),
      })
    }
  }

  componentDidUpdate () {
    if (this.refs.attrInput) {
      var input = this.refs.attrInput.getInputDOMNode()
      input.focus()
    }
  }

  visiblePlaces (places, filter) {
    let visible = places
    if (!this.filterIsEmpty(filter)) {
      visible = []
      places.forEach(pl => {
        Object.keys(filter).forEach(attr => {
          filter[attr].forEach(val => {
            if (val == '') {
              if (!pl[attr] || pl[attr] == '') visible.push(pl)
            } else {
              if (pl[attr] && pl[attr] == val) visible.push(pl)
            }
          })
        })
      })
    }
    return _.sortBy(visible, ['name', 'id'])
  }

  detailID (places) {
    let id = places[0].id
    let place = places.find(pl => pl.name === '')
    if (place) id = place.id
    return id
  }

  updateFilter = (filter) => {
    if (this.props.places.length > 0) {
      let visible = this.visiblePlaces(this.props.places, filter)
      this.setState({
        visiblePlaces: visible,
        placeDetailId: this.detailID(visible),
        filter: filter,
      })
    }
  }

  filterIsEmpty = (filter) => {
    if (filter == null) return true
    let numFiltered = this.props.customAttributes.reduce((num, attrs) => {
      num += filter[attrs].length
      return num
    }, 0)
    return numFiltered == 0
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
      this.saveAttr()
    }
  }

  saveAttr = () => {
    const attr = this.refs.attrInput.getValue()
    this.props.customAttributeActions.addPlaceAttr(attr)
    this.setState({addAttrText: ''})
    var input = this.refs.attrInput.getInputDOMNode()
    input.focus()
  }

  removeAttr (attr) {
    this.props.customAttributeActions.removePlaceAttr(attr)
    this.setState({addAttrText: this.state.addAttrText}) // no op
  }

  renderSubNav () {
    let subNavKlasses = 'subnav__container'
    if (this.props.ui.darkMode) subNavKlasses += ' darkmode'
    let popover = <Popover id='filter'>
      <CustomAttrFilterList type={'places'} filteredItems={this.state.filter} updateItems={this.updateFilter}/>
    </Popover>
    let filterDeclaration = <Alert bsStyle="warning">{i18n('Place list is filtered')}</Alert>
    if (this.filterIsEmpty(this.state.filter)) {
      filterDeclaration = <span></span>
    }
    return (
      <Navbar className={subNavKlasses}>
        <Nav bsStyle='pills' >
          <NavItem>
            <Button bsSize='small' onClick={() => this.setState({dialogOpen: true})}><Glyphicon glyph='list' /> {i18n('Custom Attributes')}</Button>
          </NavItem>
          <NavItem>
            <OverlayTrigger containerPadding={20} trigger='click' rootClose placement='bottom' overlay={popover}>
              <Button bsSize='small'><Glyphicon glyph='filter' /> {i18n('Filter')}</Button>
            </OverlayTrigger>
            {filterDeclaration}
          </NavItem>
        </Nav>
      </Navbar>
    )
  }

  renderPlaces () {
    let klasses = 'place-list__list list-group'
    if (this.props.ui.darkMode) klasses += ' darkmode'
    const places = this.state.visiblePlaces.map((pl, idx) =>
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
          {i18n('Close')}
        </Button>
        <h3>{i18n('Custom Attributes for Places')}</h3>
        <p className='sub-header'>{i18n('Choose what you want to track about your places')}</p>
        <div className='character-list__custom-attributes-add-button'>
          <Input type='text' ref='attrInput'
            label={i18n('Add attributes')} value={this.state.addAttrText}
            onChange={this.handleType} onKeyDown={this.handleAddCustomAttr} />
          <Button bsStyle='success' onClick={this.saveAttr}>
            {i18n('Add')}
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
