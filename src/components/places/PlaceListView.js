import React, { useState, useEffect } from 'react'
import PropTypes from 'react-proptypes'
import cx from 'classnames'
import { flatten } from 'lodash'
import {
  Glyphicon,
  Nav,
  NavItem,
  Button,
  Popover,
  Alert,
  Grid,
  Row,
  Col,
  FormControl,
} from 'react-bootstrap'

import { t as i18n } from 'plottr_locales'
import { newIds } from 'pltr/v2'

import UnconnectedOverlayTrigger from '../OverlayTrigger'
import UnconnectedPlaceCategoriesModal from './PlaceCategoriesModal'
import UnconnectedCustomAttributeModal from '../dialogs/CustomAttributeModal'
import UnconnectedCustomAttrFilterList from '../CustomAttrFilterList'
import UnconnectedErrorBoundary from '../containers/ErrorBoundary'
import UnconnectedSortList from '../SortList'
import UnconnectedSubNav from '../containers/SubNav'
import UnconnectedPlaceView from './PlaceView'
import UnconnectedPlaceItem from './PlaceItem'

import { checkDependencies } from '../checkDependencies'
import { withEventTargetValue } from '../withEventTargetValue'

const { nextId } = newIds

const detailID = (placeCategories, placeDetailId) => {
  const places = flatten(Object.values(placeCategories))
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
  const PlaceCategoriesModal = UnconnectedPlaceCategoriesModal(connector)
  const CustomAttrFilterList = UnconnectedCustomAttrFilterList(connector)
  const ErrorBoundary = UnconnectedErrorBoundary(connector)
  const SortList = UnconnectedSortList(connector)
  const SubNav = UnconnectedSubNav(connector)
  const PlaceView = UnconnectedPlaceView(connector)
  const PlaceItem = UnconnectedPlaceItem(connector)
  const OverlayTrigger = UnconnectedOverlayTrigger(connector)

  const PlaceListView = ({
    visiblePlacesByCategory,
    categories,
    filterIsEmpty,
    customAttributes,
    customAttributesThatCanChange,
    restrictedValues,
    darkMode,
    actions,
    placeSearchTerm,
    customAttributeActions,
    uiActions,
    places,
    placeSort,
  }) => {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [placeDetailId, setPlaceDetailId] = useState(null)
    const [editingSelected, setEditingSelected] = useState(false)
    const [categoriesOpen, setCategoriesOpen] = useState(false)

    useEffect(() => {
      setPlaceDetailId(detailID(visiblePlacesByCategory, placeDetailId))
    }, [visiblePlacesByCategory])

    const editSelected = () => {
      setEditingSelected(true)
    }

    const stopEditing = () => {
      setEditingSelected(false)
    }

    const closeDialog = () => {
      setCategoriesOpen(false)
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
              <Button bsSize="small" onClick={() => setCategoriesOpen(true)}>
                <Glyphicon glyph="list" /> {i18n('Categories')}
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
            <NavItem>
              <FormControl
                onChange={withEventTargetValue(uiActions.setPlacesSearchTerm)}
                value={placeSearchTerm}
                type="text"
                placeholder="Search"
              />
            </NavItem>
          </Nav>
        </SubNav>
      )
    }

    const renderVisiblePlacesByCategory = (categoryId) => {
      const places =
        categoryId === null
          ? [
              ...(visiblePlacesByCategory[null] || []),
              ...(visiblePlacesByCategory[undefined] || []),
            ]
          : visiblePlacesByCategory[categoryId]

      if (!places) return []

      return places.map((pl) => (
        <PlaceItem
          key={pl.id}
          place={pl}
          selected={pl.id == placeDetailId}
          startEdit={editSelected}
          stopEdit={stopEditing}
          select={() => setPlaceDetailId(pl.id)}
        />
      ))
    }

    const renderCategory = (category) => {
      const placesInCategory = renderVisiblePlacesByCategory(category.id)
      if (!placesInCategory.length) return null
      return (
        <div key={`category-${category.id}`}>
          <h2 className="place-list__category-title">{category.name}</h2>
          <div className={cx('place-list__list', 'list-group', { darkmode: darkMode })}>
            {placesInCategory}
          </div>
        </div>
      )
    }

    const renderPlaces = () => {
      return [...categories, { id: null, name: i18n('Uncategorized') }].map(renderCategory)
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

    const renderCategoriesModal = () => {
      if (!categoriesOpen) return null

      return <PlaceCategoriesModal closeDialog={closeDialog} />
    }

    let klasses = 'secondary-text'
    if (darkMode) klasses += ' darkmode'
    return (
      <div className="place-list container-with-sub-nav">
        {renderSubNav()}
        {renderCustomAttributes()}
        {renderCategoriesModal()}
        <Grid fluid className="tab-body">
          <Row>
            <Col sm={3}>
              <h1 className={klasses}>
                {i18n('Places')}{' '}
                <Button onClick={handleCreateNewPlace}>
                  <Glyphicon glyph="plus" />
                </Button>
              </h1>
              <div className="place-list__category-list">{renderPlaces()}</div>
            </Col>
            <Col sm={9}>{renderPlaceDetails()}</Col>
          </Row>
        </Grid>
      </div>
    )
  }

  PlaceListView.propTypes = {
    visiblePlacesByCategory: PropTypes.array.isRequired,
    categories: PropTypes.array.isRequired,
    filterIsEmpty: PropTypes.bool.isRequired,
    customAttributes: PropTypes.array.isRequired,
    customAttributesThatCanChange: PropTypes.array,
    restrictedValues: PropTypes.array,
    darkMode: PropTypes.bool.isRequired,
    actions: PropTypes.object.isRequired,
    customAttributeActions: PropTypes.object.isRequired,
    placeSearchTerm: PropTypes.string,
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
          visiblePlacesByCategory: selectors.visibleSortedSearchedPlacesByCategorySelector(
            state.present
          ),
          categories: selectors.sortedPlaceCategoriesSelector(state.present),
          filterIsEmpty: selectors.placeFilterIsEmptySelector(state.present),
          customAttributes: state.present.customAttributes.places,
          customAttributesThatCanChange: selectors.placeCustomAttributesThatCanChangeSelector(
            state.present
          ),
          restrictedValues: selectors.placeCustomAttributesRestrictedValues(state.present),
          darkMode: selectors.isDarkModeSelector(state.present),
          placeSort: selectors.placeSortSelector(state.present),
          placeSearchTerm: selectors.placesSearchTermSelector(state.present),
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
