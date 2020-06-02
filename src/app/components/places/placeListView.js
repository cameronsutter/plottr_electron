import _ from 'lodash'
import React, { Component } from 'react'
import { findDOMNode } from 'react-dom'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import cx from 'classnames'
import { Glyphicon, Nav, Navbar, NavItem, Button, FormControl, FormGroup,
  ControlLabel, Popover, OverlayTrigger, Alert, Grid, Row, Col } from 'react-bootstrap'
import Modal from 'react-modal'
import CustomAttrFilterList from 'components/customAttrFilterList'
import SortList from 'components/sortList'
import * as PlaceActions from 'actions/places'
import * as CustomAttributeActions from 'actions/customAttributes'
import * as UIActions from 'actions/ui'
import PlaceView from 'components/places/placeView'
import CustomAttrItem from 'components/customAttrItem'
import Image from 'components/images/Image'
import i18n from 'format-message'
import { placeCustomAttributesThatCanChangeSelector } from '../../selectors/customAttributes'
import ErrorBoundary from '../../containers/ErrorBoundary'

const modalStyles = {content: {top: '70px', width: '50%', marginLeft: '25%'}}

class PlaceListView extends Component {
  constructor (props) {
    super(props)
    let id = null
    let visible = []
    const { placeSort, placeFilter } = props.ui
    if (props.places.length > 0) {
      visible = this.visiblePlaces(props.places, placeFilter, placeSort)
      id = this.detailID(visible)
    }
    this.state = {
      dialogOpen: false,
      addAttrText: '',
      placeDetailId: id,
      visiblePlaces: visible,
    }
  }

  componentWillReceiveProps (nextProps) {
    let visible = []
    let detailID = null
    if (nextProps.places.length > 0) {
      const { placeSort, placeFilter } = nextProps.ui
      visible = this.visiblePlaces(nextProps.places, placeFilter, placeSort)
      detailID = this.detailID(visible)
    }
    this.setState({
      visiblePlaces: visible,
      placeDetailId: detailID,
    })
  }

  componentDidUpdate () {
    if (this.refs.attrInput) {
      findDOMNode(this.refs.attrInput).focus()
    }
  }

  visiblePlaces (places, filter, sort) {
    let visible = places
    if (!this.filterIsEmpty(filter)) {
      visible = []
      places.forEach(pl => {
        const matches = Object.keys(filter).some(attr => {
          return filter[attr].some(val => {
            if (val == '') {
              if (!pl[attr] || pl[attr] == '') return true
            } else {
              if (pl[attr] && pl[attr] == val) return true
            }
            return false
          })
        })
        if (matches) visible.push(pl)
      })
    }

    let sortOperands = sort.split('~')
    let attrName = sortOperands[0]
    let direction = sortOperands[1]
    let sortBy = attrName === 'name' ? [attrName, 'id'] : [attrName, 'name']
    let sorted = _.sortBy(visible, sortBy)
    if (direction == 'desc') sorted.reverse()
    return sorted
  }

  detailID (places) {
    if (places.length == 0) return null

    let id = places[0].id

    // check for the currently active one
    if (this.state && this.state.placeDetailId != null) {
      let activePlace = places.find(pl => pl.id === this.state.placeDetailId)
      if (activePlace) id = activePlace.id
    }

    // check for a newly created one
    let newPlace = places.find(pl => pl.name === '')
    if (newPlace) id = newPlace.id

    return id
  }

  filterIsEmpty = (filter) => {
    if (!filter) return true

    return !this.props.customAttributes.some(attr => filter[attr.name] && filter[attr.name].length)
  }

  closeDialog = () => {
    this.setState({dialogOpen: false})
  }

  handleCreateNewPlace = () => {
    this.props.actions.addPlace()
  }

  handleType = () => {
    const attr = findDOMNode(this.refs.attrInput).value
    this.setState({addAttrText: attr})
  }

  handleAddCustomAttr = (event) => {
    if (event.which === 13) {
      this.saveAttr()
    }
  }

  saveAttr = () => {
    const name = findDOMNode(this.refs.attrInput).value
    this.props.customAttributeActions.addPlaceAttr({name, type: 'text'})

    this.setState({addAttrText: ''})
  }

  removeAttr = (attr) => {
    this.props.customAttributeActions.removePlaceAttr(attr)
    this.setState({addAttrText: this.state.addAttrText}) // no op
  }

  updateAttr = (index, attr) => {
    this.props.customAttributeActions.editPlaceAttr(index, attr)
  }

  renderSubNav () {
    const { ui, uiActions } = this.props
    let filterPopover = <Popover id='filter'>
      <CustomAttrFilterList type={'places'} />
    </Popover>
    let filterDeclaration = <Alert onClick={() => uiActions.setPlaceFilter(null)}  bsStyle="warning"><Glyphicon glyph='remove-sign' />{"  "}{i18n('Place list is filtered')}</Alert>
    if (this.filterIsEmpty(ui.placeFilter)) {
      filterDeclaration = <span></span>
    }
    let sortPopover = <Popover id='sort'>
      <SortList type={'places'} />
    </Popover>
    let sortGlyph = 'sort-by-attributes'
    if (ui.placeSort.includes('~desc')) sortGlyph = 'sort-by-attributes-alt'
    return (
      <Navbar className={cx('subnav__container', {darkmode: ui.darkMode})}>
        <Nav bsStyle='pills' >
          <NavItem>
            <Button bsSize='small' onClick={this.handleCreateNewPlace}><Glyphicon glyph='plus' /> {i18n('New')}</Button>
          </NavItem>
          <NavItem>
            <Button bsSize='small' onClick={() => this.setState({dialogOpen: true})}><Glyphicon glyph='list' /> {i18n('Custom Attributes')}</Button>
          </NavItem>
          <NavItem>
            <OverlayTrigger containerPadding={20} trigger='click' rootClose placement='bottom' overlay={filterPopover}>
              <Button bsSize='small'><Glyphicon glyph='filter' /> {i18n('Filter')}</Button>
            </OverlayTrigger>
            {filterDeclaration}
          </NavItem>
          <NavItem>
            <OverlayTrigger containerPadding={20} trigger='click' rootClose placement='bottom' overlay={sortPopover}>
              <Button bsSize='small'><Glyphicon glyph={sortGlyph} /> {i18n('Sort')}</Button>
            </OverlayTrigger>
          </NavItem>
        </Nav>
      </Navbar>
    )
  }

  renderVisiblePlaces = () => {
    return this.state.visiblePlaces.map((pl, idx) => {
      let img = null
      if (pl.imageId) {
        img = <div className='place-list__item-inner__image-wrapper'>
          <Image size='small' shape='rounded' imageId={pl.imageId} />
        </div>
      }
      const klasses = cx('list-group-item', {selected: pl.id == this.state.placeDetailId})
      return <div key={idx} className={klasses} onClick={() => this.setState({placeDetailId: pl.id})}>
        <div className='place-list__item-inner'>
          {img}
          <div>
            <h6 className='list-group-item-heading'>{pl.name || i18n('New Place')}</h6>
            <p className='list-group-item-text'>{pl.description.substr(0, 100)}</p>
          </div>
        </div>
      </div>
    })
  }

  renderPlaces () {
    return <div className={cx('place-list__list', 'list-group', {darkmode: this.props.ui.darkMode})}>
      <a href='#' key={'new-place'} className='place-list__new list-group-item' onClick={this.handleCreateNewPlace} >
        <Glyphicon glyph='plus' />
      </a>
      { this.renderVisiblePlaces() }
    </div>
  }

  renderPlaceDetails () {
    let place = this.props.places.find(pl =>
      pl.id === this.state.placeDetailId
    )
    if (place) {
      return <ErrorBoundary><PlaceView key={`place-${place.id}`} place={place} /></ErrorBoundary>
    } else {
      return null
    }
  }

  renderCustomAttributes () {
    const { customAttributes, ui, customAttributesThatCanChange } = this.props
    const attrs = customAttributes.map((attr, idx) => <CustomAttrItem key={idx} attr={attr} index={idx} update={this.updateAttr} delete={this.removeAttr} canChangeType={customAttributesThatCanChange.includes(attr.name)}/> )
    if (ui.darkMode) {
      modalStyles.content.backgroundColor = '#666'
    }
    return (<Modal isOpen={this.state.dialogOpen} onRequestClose={this.closeDialog} style={modalStyles}>
      <div className={cx('custom-attributes__wrapper', {darkmode: ui.darkMode})}>
        <Button className='pull-right card-dialog__close' onClick={this.closeDialog}>
          {i18n('Close')}
        </Button>
        <h3>{i18n('Custom Attributes for Places')}</h3>
        <p className='sub-header'>{i18n('Choose what you want to track about your places')}</p>
        <div className='character-list__custom-attributes-add-button'>
          <FormGroup>
            <ControlLabel>{i18n('Add attributes')}</ControlLabel>
            <FormControl type='text' ref='attrInput'
              value={this.state.addAttrText}
              onChange={this.handleType} onKeyDown={this.handleAddCustomAttr} />
          </FormGroup>
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
        <Grid fluid>
          <Row>
            <Col sm={3}>
              <h1 className={klasses}>{i18n('Places')}</h1>
              {this.renderPlaces()}
            </Col>
            <Col sm={9}>
              {this.renderPlaceDetails()}
            </Col>
          </Row>
        </Grid>
      </div>
    )
  }
}

PlaceListView.propTypes = {
  places: PropTypes.array.isRequired,
  customAttributes: PropTypes.array.isRequired,
  customAttributesThatCanChange: PropTypes.array,
  ui: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  customAttributeActions: PropTypes.object.isRequired,
  uiActions: PropTypes.object.isRequired,
}

function mapStateToProps (state) {
  return {
    places: state.places,
    customAttributes: state.customAttributes['places'],
    customAttributesThatCanChange: placeCustomAttributesThatCanChangeSelector(state),
    ui: state.ui,
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(PlaceActions, dispatch),
    customAttributeActions: bindActionCreators(CustomAttributeActions, dispatch),
    uiActions: bindActionCreators(UIActions, dispatch),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PlaceListView)
