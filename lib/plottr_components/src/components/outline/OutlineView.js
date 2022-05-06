import React, { useState, useEffect } from 'react'
import PropTypes from 'react-proptypes'
import {
  FormControl,
  Glyphicon,
  Nav,
  NavItem,
  Button,
  Popover,
  Alert,
  Grid,
  Row,
  Col,
} from 'react-bootstrap'
import UnconnectedOverlayTrigger from '../OverlayTrigger'
import UnconnectedBeatView from './BeatView'
import UnconnectedMiniMap from './MiniMap'
import UnconnectedErrorBoundary from '../containers/ErrorBoundary'
import UnconnectedExportNavItem from '../export/ExportNavItem'
import UnconnectedSubNav from '../containers/SubNav'
import { t as i18n } from 'plottr_locales'
import { helpers } from 'pltr/v2'
import { emptyCard } from 'pltr/v2/helpers/cards'

import { checkDependencies } from '../checkDependencies'
import { withEventTargetValue } from '../withEventTargetValue'

const {
  card: { cardMapping },
} = helpers

const OutlineViewConnector = (connector) => {
  const BeatView = UnconnectedBeatView(connector)
  const MiniMap = UnconnectedMiniMap(connector)
  const ErrorBoundary = UnconnectedErrorBoundary(connector)
  const ExportNavItem = UnconnectedExportNavItem(connector)
  const SubNav = UnconnectedSubNav(connector)
  const OverlayTrigger = UnconnectedOverlayTrigger(connector)

  const {
    platform: { exportDisabled, log },
  } = connector
  checkDependencies({ exportDisabled, log })

  const OutlineView = ({
    currentTimeline,
    outlineFilter,
    actions,
    lines,
    beats,
    allCards,
    card2Dmap,
    outlineSearchTerm,
  }) => {
    const [active, setActive] = useState(0)
    const [firstRender, setFirstRender] = useState(true)

    useEffect(() => {
      setTimeout(() => setFirstRender(false), 500)
    }, [])

    useEffect(() => {
      setFirstRender(true)
      setTimeout(() => setFirstRender(false), 500)
    }, [currentTimeline])

    const fixMe = () => {
      log.warn('OutlineView waypoint needs fixing')
    }

    const filterItem = (id) => {
      actions.setOutlineFilter(id)
    }

    const removeFilter = () => {
      actions.setOutlineFilter(null)
    }

    // ///////////////
    //  rendering   //
    // //////////////

    const renderFilterItem = (item) => {
      var placeholder = <span className="filter-list__placeholder"></span>
      if (
        (Array.isArray(outlineFilter) && outlineFilter.includes(item.id)) ||
        (!Array.isArray(outlineFilter) && outlineFilter === item.id)
      ) {
        placeholder = <Glyphicon glyph="eye-open" />
      }
      return (
        <li key={item.id} onMouseDown={() => filterItem(item.id)}>
          {placeholder} {item.title}
        </li>
      )
    }

    const renderFilterList = () => {
      var items = lines.map((i) => {
        return renderFilterItem(i)
      })
      return <ul className="filter-list__list">{items}</ul>
    }

    const renderSubNav = () => {
      const popover = () => (
        <Popover id="filter">
          <div className="filter-list">{renderFilterList()}</div>
        </Popover>
      )
      let filterDeclaration = (
        <Alert onClick={removeFilter} bsStyle="warning">
          <Glyphicon glyph="remove-sign" />
          {'  '}
          {i18n('Outline is filtered')}
        </Alert>
      )
      if (!outlineFilter) {
        filterDeclaration = <span></span>
      }
      return (
        <SubNav>
          <Nav bsStyle="pills">
            <NavItem>
              <OverlayTrigger
                containerPadding={20}
                trigger="click"
                rootClose
                placement="bottom"
                overlay={popover}
              >
                <Button bsSize="small">
                  <Glyphicon glyph="filter" />
                  {i18n('Filter by Plotline')}
                </Button>
              </OverlayTrigger>
              {filterDeclaration}
            </NavItem>
            <NavItem>
              <FormControl
                onChange={withEventTargetValue(actions.setOutlineSearchTerm)}
                value={outlineSearchTerm}
                type="text"
                placeholder="Search"
              />
            </NavItem>
          </Nav>
          {!exportDisabled && (
            <Nav pullRight>
              <ExportNavItem />
            </Nav>
          )}
        </SubNav>
      )
    }

    const renderBeats = (cardMapping) => {
      let beatsWithCards = allCards.map((card) => card.beatId)

      return (
        !!beats.length &&
        !!beatsWithCards.length &&
        beats.map((beat, idx) => {
          if (firstRender && idx > 2) return null
          let hasCards = beatsWithCards.includes(beat.id)
          const beatCards = hasCards
            ? cardMapping[beat.id]
            : lines.length > 0
            ? [emptyCard(idx, beat, lines[0])]
            : []
          return (
            <ErrorBoundary key={beat.id}>
              <BeatView
                beat={beat}
                cards={beatCards}
                waypoint={fixMe}
                activeFilter={!!outlineFilter}
              />
            </ErrorBoundary>
          )
        })
      )
    }

    const renderBody = () => {
      const cardMap = cardMapping(beats, lines, card2Dmap, outlineFilter)
      return (
        <div className="outline__container tab-body">
          <Grid fluid className="outline__grid">
            <Row>
              <Col xsHidden sm={4} md={3} className="outline__grid__minimap">
                <ErrorBoundary>
                  {!!lines.length && (
                    <MiniMap
                      active={active}
                      handleActive={setActive}
                      cardMapping={cardMap}
                      activeFilter={!!outlineFilter}
                    />
                  )}
                </ErrorBoundary>
              </Col>
              <Col xs={12} sm={8} md={9} className="outline__grid__beats">
                {!!beats.length && renderBeats(cardMap)}
              </Col>
            </Row>
          </Grid>
        </div>
      )
    }

    return (
      <div className="container-with-sub-nav">
        {renderSubNav()}
        {renderBody()}
      </div>
    )
  }

  OutlineView.propTypes = {
    beats: PropTypes.array.isRequired,
    lines: PropTypes.array.isRequired,
    card2Dmap: PropTypes.object.isRequired,
    allCards: PropTypes.array,
    outlineFilter: PropTypes.object.isRequired,
    currentTimeline: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    isSeries: PropTypes.bool,
    actions: PropTypes.object.isRequired,
    outlineSearchTerm: PropTypes.string.isRequired,
  }

  const {
    redux,
    pltr: { selectors, actions },
  } = connector
  checkDependencies({ redux, selectors, actions })

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(
      (state) => {
        return {
          beats: selectors.visibleSortedBeatsByBookIgnoringCollapsedSelector(state.present),
          lines: selectors.sortedLinesByBookSelector(state.present),
          beatMapping: selectors.sparceBeatMap(state.present),
          card2Dmap: selectors.outlineSearchedCardMapSelector(state.present),
          outlineFilter: selectors.outlineFilterSelector(state.present),
          allCards: selectors.allCardsSelector(state.present),
          isSeries: selectors.isSeriesSelector(state.present),
          outlineSearchTerm: selectors.outlineSearchTermSelector(state.present),
        }
      },
      (dispatch) => {
        return {
          actions: bindActionCreators(actions.ui, dispatch),
        }
      }
    )(OutlineView)
  }

  throw new Error('Could not connect OutlineView')
}

export default OutlineViewConnector
