import React, { useState, useEffect } from 'react'
import PropTypes from 'react-proptypes'
import cx from 'classnames'
import { Glyphicon, Nav, NavItem, Button, Popover, Alert, Grid, Row, Col } from 'react-bootstrap'
import UnconnectedOverlayTrigger from '../OverlayTrigger'
import UnconnectedCustomAttributeModal from '../dialogs/CustomAttributeModal'
import UnconnectedCustomAttrFilterList from '../CustomAttrFilterList'
import UnconnectedErrorBoundary from '../containers/ErrorBoundary'
import UnconnectedSortList from '../SortList'
import UnconnectedSubNav from '../containers/SubNav'
import UnconnectedPlaceView from './PlaceView'
import UnconnectedPlaceItem from './PlaceItem'
import { t as i18n } from 'plottr_locales'
import { newIds } from 'pltr/v2'

import { checkDependencies } from '../checkDependencies'

const { nextId } = newIds

const detailID = (places, placeDetailId) => {
  if (places.length == 0) return null

  let id = places[0].id

  // check for the currently active one
  if (placeDetailId != null) {
    let activePlace = places.find((pl) => pl.id === placeDetailId)
    if (activePlace) id = activePlace.id
  }

  return id
}

const PlaceListViewConnector = (connector) => {
  const CustomAttributeModal = UnconnectedCustomAttributeModal(connector)
  const CustomAttrFilterList = UnconnectedCustomAttrFilterList(connector)
  const ErrorBoundary = UnconnectedErrorBoundary(connector)
  const SortList = UnconnectedSortList(connector)
  const SubNav = UnconnectedSubNav(connector)
  const PlaceView = UnconnectedPlaceView(connector)
  const PlaceItem = UnconnectedPlaceItem(connector)
  const OverlayTrigger = UnconnectedOverlayTrigger(connector)

  const PlaceListView = ({
    visiblePlaces,
    filterIsEmpty,
    customAttributes,
    customAttributesThatCanChange,
    restrictedValues,
    darkMode,
    actions,
    customAttributeActions,
    uiActions,
    places,
    placeSort,
  }) => {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [placeDetailId, setPlaceDetailId] = useState(null)
    const [editingSelected, setEditingSelected] = useState(false)

    useEffect(() => {
      setPlaceDetailId(detailID(visiblePlaces, placeDetailId))
    }, [visiblePlaces])

    const editSelected = () => {
      setEditingSelected(true)
    }

    const stopEditing = () => {
      setEditingSelected(false)
    }

    const closeDialog = () => {
      setDialogOpen(false)
    }

    const handleCreateNewPlace = () => {
      const id = nextId(places)
      actions.addPlace()
      setPlaceDetailId(id)
      setEditingSelected(true)
    }

    const renderSubNav = () => {
      const filterPopover = () => (
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
      const sortPopover = () => (
        <Popover id="sort">
          <SortList type={'places'} />
        </Popover>
      )
      let sortGlyph = 'sort-by-attributes'
      if (placeSort.includes('~desc')) sortGlyph = 'sort-by-attributes-alt'
      return (
        <SubNav>
          <Nav bsStyle="pills">
            <NavItem>
              <Button bsSize="small" onClick={handleCreateNewPlace}>
                <Glyphicon glyph="plus" /> {i18n('New')}
              </Button>
            </NavItem>
            <NavItem>
              <Button bsSize="small" onClick={() => setDialogOpen(true)}>
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

    const renderVisiblePlaces = () => {
      return visiblePlaces.map((pl) => (
        <PlaceItem
          key={pl.id}
          place={pl}
          selected={pl.id == placeDetailId}
          startEdit={editingSelected}
          stopEdit={stopEditing}
          select={() => setPlaceDetailId(pl.id)}
        />
      ))
    }

    const renderPlaces = () => {
      return (
        <div className={cx('place-list__list', 'list-group', { darkmode: darkMode })}>
          {renderVisiblePlaces()}
        </div>
      )
    }

    const renderPlaceDetails = () => {
      let place = places.find((pl) => pl.id === placeDetailId)
      if (place) {
        return (
          <ErrorBoundary>
            <PlaceView
              key={`place-${place.id}`}
              place={place}
              editing={editingSelected}
              stopEditing={stopEditing}
              startEditing={editSelected}
            />
          </ErrorBoundary>
        )
      } else {
        return null
      }
    }

    const renderCustomAttributes = () => {
      if (!dialogOpen) {
        return null
      }
      return <CustomAttributeModal hideSaveAsTemplate type="places" closeDialog={closeDialog} />
    }

    let klasses = 'secondary-text'
    if (darkMode) klasses += ' darkmode'
    return (
      <div className="place-list container-with-sub-nav">
        {renderSubNav()}
        {renderCustomAttributes()}
        <Grid fluid className="tab-body">
          <Row>
            <Col sm={3}>
              <h1 className={klasses}>
                {i18n('Places')}{' '}
                <Button onClick={handleCreateNewPlace}>
                  <Glyphicon glyph="plus" />
                </Button>
              </h1>
              {renderPlaces()}
            </Col>
            <Col sm={9}>{renderPlaceDetails()}</Col>
          </Row>
        </Grid>
      </div>
    )
  }

  PlaceListView.propTypes = {
    visiblePlaces: PropTypes.array.isRequired,
    filterIsEmpty: PropTypes.bool.isRequired,
    customAttributes: PropTypes.array.isRequired,
    customAttributesThatCanChange: PropTypes.array,
    restrictedValues: PropTypes.array,
    darkMode: PropTypes.bool.isRequired,
    actions: PropTypes.object.isRequired,
    customAttributeActions: PropTypes.object.isRequired,
    uiActions: PropTypes.object.isRequired,
    places: PropTypes.array,
    placeSort: PropTypes.string.isRequired,
  }

  const {
    redux,
    pltr: { actions, selectors },
  } = connector
  checkDependencies({ redux, actions, selectors })

  const CustomAttributeActions = actions.customAttribute
  const PlaceActions = actions.place
  const UIActions = actions.ui

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(
      (state) => {
        return {
          places: state.present.places,
          visiblePlaces: selectors.visibleSortedPlacesSelector(state.present),
          filterIsEmpty: selectors.placeFilterIsEmptySelector(state.present),
          customAttributes: state.present.customAttributes.places,
          customAttributesThatCanChange: selectors.placeCustomAttributesThatCanChangeSelector(
            state.present
          ),
          restrictedValues: selectors.placeCustomAttributesRestrictedValues(state.present),
          darkMode: selectors.isDarkModeSelector(state.present),
          placeSort: selectors.placeSortSelector(state.present),
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
