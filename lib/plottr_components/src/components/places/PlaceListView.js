import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import cx from 'classnames'
import {
  Glyphicon,
  Nav,
  NavItem,
  Button,
  Popover,
  OverlayTrigger,
  Alert,
  Grid,
  Row,
  Col,
} from 'react-bootstrap'
import UnconnectedCustomAttributeModal from '../dialogs/CustomAttributeModal'
import UnconnectedCustomAttrFilterList from '../CustomAttrFilterList'
import UnconnectedErrorBoundary from '../containers/ErrorBoundary'
import UnconnectedSortList from '../SortList'
import UnconnectedSubNav from '../containers/SubNav'
import UnconnectedPlaceView from './PlaceView'
import UnconnectedPlaceItem from './PlaceItem'
import { t as i18n } from 'plottr_locales'
import { newIds } from 'pltr/v2'

const { nextId } = newIds

const PlaceListViewConnector = (connector) => {
  const CustomAttributeModal = UnconnectedCustomAttributeModal(connector)
  const CustomAttrFilterList = UnconnectedCustomAttrFilterList(connector)
  const ErrorBoundary = UnconnectedErrorBoundary(connector)
  const SortList = UnconnectedSortList(connector)
  const SubNav = UnconnectedSubNav(connector)
  const PlaceView = UnconnectedPlaceView(connector)
  const PlaceItem = UnconnectedPlaceItem(connector)

  class PlaceListView extends Component {
    constructor(props) {
      super(props)
      this.state = {
        dialogOpen: false,
        addAttrText: '',
        placeDetailId: null,
        editingSelected: false,
      }

      this.attrInputRef = React.createRef()
    }

    static getDerivedStateFromProps(props, state) {
      let returnVal = { ...state }
      const { visiblePlaces } = props
      returnVal.placeDetailId = PlaceListView.detailID(visiblePlaces, state.placeDetailId)

      return returnVal
    }

    static detailID(places, placeDetailId) {
      if (places.length == 0) return null

      let id = places[0].id

      // check for the currently active one
      if (placeDetailId != null) {
        let activePlace = places.find((pl) => pl.id === placeDetailId)
        if (activePlace) id = activePlace.id
      }

      return id
    }

    editingSelected = () => {
      this.setState({ editingSelected: true })
    }

    stopEditing = () => {
      this.setState({ editingSelected: false })
    }

    closeDialog = () => {
      this.setState({ dialogOpen: false })
    }

    handleCreateNewPlace = () => {
      const id = nextId(this.props.places)
      this.props.actions.addPlace()
      this.setState({ placeDetailId: id, editingSelected: true })
    }

    handleType = () => {
      const attr = this.attrInputRef.current.value
      this.setState({ addAttrText: attr })
    }

    handleAddCustomAttr = (event) => {
      if (event.which === 13) {
        this.saveAttr()
      }
    }

    saveAttr = () => {
      const name = this.attrInputRef.current.value
      if (name == '' || this.props.restrictedValues.includes(name)) return // nothing? restricted value? no op

      this.props.customAttributeActions.addPlaceAttr({ name, type: 'text' })
      this.setState({ addAttrText: '' })
    }

    removeAttr = (attr) => {
      this.props.customAttributeActions.removePlaceAttr(attr.name)
      this.setState({ addAttrText: this.state.addAttrText }) // no op
    }

    updateAttr = (index, oldAttribute, newAttribute) => {
      this.props.customAttributeActions.editPlaceAttr(index, oldAttribute, newAttribute)
    }

    renderSubNav() {
      const { ui, filterIsEmpty, uiActions } = this.props
      let filterPopover = (
        <Popover id="filter">
          <CustomAttrFilterList type="places" />
        </Popover>
      )
      let filterDeclaration = (
        <Alert onClick={() => uiActions.setPlaceFilter(null)} bsStyle="warning">
          <Glyphicon glyph="remove-sign" />
          {'  '}
          {i18n('Place list is filtered')}
        </Alert>
      )
      if (filterIsEmpty) {
        filterDeclaration = <span></span>
      }
      let sortPopover = (
        <Popover id="sort">
          <SortList type={'places'} />
        </Popover>
      )
      let sortGlyph = 'sort-by-attributes'
      if (ui.placeSort.includes('~desc')) sortGlyph = 'sort-by-attributes-alt'
      return (
        <SubNav>
          <Nav bsStyle="pills">
            <NavItem>
              <Button bsSize="small" onClick={this.handleCreateNewPlace}>
                <Glyphicon glyph="plus" /> {i18n('New')}
              </Button>
            </NavItem>
            <NavItem>
              <Button bsSize="small" onClick={() => this.setState({ dialogOpen: true })}>
                <Glyphicon glyph="list" /> {i18n('Attributes')}
              </Button>
            </NavItem>
            <NavItem>
              <OverlayTrigger
                containerPadding={20}
                trigger="click"
                rootClose
                placement="bottom"
                overlay={filterPopover}
              >
                <Button bsSize="small">
                  <Glyphicon glyph="filter" /> {i18n('Filter')}
                </Button>
              </OverlayTrigger>
              {filterDeclaration}
            </NavItem>
            <NavItem>
              <OverlayTrigger
                containerPadding={20}
                trigger="click"
                rootClose
                placement="bottom"
                overlay={sortPopover}
              >
                <Button bsSize="small">
                  <Glyphicon glyph={sortGlyph} /> {i18n('Sort')}
                </Button>
              </OverlayTrigger>
            </NavItem>
          </Nav>
        </SubNav>
      )
    }

    renderVisiblePlaces = () => {
      return this.props.visiblePlaces.map((pl) => (
        <PlaceItem
          key={pl.id}
          place={pl}
          selected={pl.id == this.state.placeDetailId}
          startEdit={this.editingSelected}
          stopEdit={this.stopEditing}
          select={() => this.setState({ placeDetailId: pl.id })}
        />
      ))
    }

    renderPlaces() {
      return (
        <div className={cx('place-list__list', 'list-group', { darkmode: this.props.ui.darkMode })}>
          {this.renderVisiblePlaces()}
        </div>
      )
    }

    renderPlaceDetails() {
      let place = this.props.places.find((pl) => pl.id === this.state.placeDetailId)
      if (place) {
        return (
          <ErrorBoundary>
            <PlaceView
              key={`place-${place.id}`}
              place={place}
              editing={this.state.editingSelected}
              stopEditing={this.stopEditing}
              startEditing={this.editingSelected}
            />
          </ErrorBoundary>
        )
      } else {
        return null
      }
    }

    renderCustomAttributes() {
      if (!this.state.dialogOpen) {
        return null
      }
      return <CustomAttributeModal hideSaveAsTemplate type="places" closeDialog={this.closeDialog} />
    }

    render() {
      let klasses = 'secondary-text'
      if (this.props.ui.darkMode) klasses += ' darkmode'
      return (
        <div className="place-list container-with-sub-nav">
          {this.renderSubNav()}
          {this.renderCustomAttributes()}
          <Grid fluid className="tab-body">
            <Row>
              <Col sm={3}>
                <h1 className={klasses}>
                  {i18n('Places')}{' '}
                  <Button onClick={this.handleCreateNewPlace}>
                    <Glyphicon glyph="plus" />
                  </Button>
                </h1>
                {this.renderPlaces()}
              </Col>
              <Col sm={9}>{this.renderPlaceDetails()}</Col>
            </Row>
          </Grid>
        </div>
      )
    }
  }

  PlaceListView.propTypes = {
    visiblePlaces: PropTypes.array.isRequired,
    filterIsEmpty: PropTypes.bool.isRequired,
    customAttributes: PropTypes.array.isRequired,
    customAttributesThatCanChange: PropTypes.array,
    restrictedValues: PropTypes.array,
    ui: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    customAttributeActions: PropTypes.object.isRequired,
    uiActions: PropTypes.object.isRequired,
    places: PropTypes.array,
  }

  const {
    redux,
    pltr: { actions, selectors },
  } = connector

  const {
    placeCustomAttributesThatCanChangeSelector,
    placeCustomAttributesRestrictedValues,
    visibleSortedPlacesSelector,
    placeFilterIsEmptySelector,
  } = selectors

  const CustomAttributeActions = actions.customAttribute
  const PlaceActions = actions.place
  const UIActions = actions.ui

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(
      (state) => {
        return {
          places: state.present.places,
          visiblePlaces: visibleSortedPlacesSelector(state.present),
          filterIsEmpty: placeFilterIsEmptySelector(state.present),
          customAttributes: state.present.customAttributes.places,
          customAttributesThatCanChange: placeCustomAttributesThatCanChangeSelector(state.present),
          restrictedValues: placeCustomAttributesRestrictedValues(state.present),
          ui: state.present.ui,
        }
      },
      (dispatch) => {
        return {
          actions: bindActionCreators(PlaceActions, dispatch),
          customAttributeActions: bindActionCreators(CustomAttributeActions, dispatch),
          uiActions: bindActionCreators(UIActions, dispatch),
        }
      }
    )(PlaceListView)
  }

  throw new Error('Could not connect PlaceListView')
}

export default PlaceListViewConnector
