import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'react-proptypes'

import { t as i18n } from 'plottr_locales'
import { helpers } from 'pltr/v2'
import { emptyCard } from 'pltr/v2/helpers/cards'

import Grid from '../Grid'
import Alert from '../Alert'
import NavItem from '../NavItem'
import Nav from '../Nav'
import Popover from '../PlottrPopover'
import Glyphicon from '../Glyphicon'
import Row from '../Row'
import FormControl from '../FormControl'
import Button from '../Button'
import UnconnectedBeatView from './BeatView'
import UnconnectedMiniMap from './MiniMap'
import UnconnectedErrorBoundary from '../containers/ErrorBoundary'
import UnconnectedExportNavItem from '../export/ExportNavItem'
import UnconnectedSubNav from '../containers/SubNav'
import UnconnectedPlottrFloater from '../PlottrFloater'
import { checkDependencies } from '../checkDependencies'
import { withEventTargetValue } from '../withEventTargetValue'
import Scrollable from '../../utils/scrollable'

const {
  card: { cardMapping },
} = helpers

const OutlineViewConnector = (connector) => {
  const BeatView = UnconnectedBeatView(connector)
  const MiniMap = UnconnectedMiniMap(connector)
  const ErrorBoundary = UnconnectedErrorBoundary(connector)
  const ExportNavItem = UnconnectedExportNavItem(connector)
  const SubNav = UnconnectedSubNav(connector)
  const Floater = UnconnectedPlottrFloater(connector)

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
    outlineScrollPosition,
  }) => {
    const [active, setActive] = useState(0)
    const [beatsToRender, setBeatsToRender] = useState(1)
    const [filterVisible, setFilterVisible] = useState(false)
    const [isScrolling, setIsScrolling] = useState(false)

    const beatsRef = useRef(null)
    const scrollableRef = useRef(new Scrollable(() => beatsRef.current))

    useEffect(() => {
      if (beatsToRender >= beats.length) return
      window.requestIdleCallback(() => {
        setBeatsToRender(beatsToRender + 1)
      })
    }, [beats, beatsToRender, setBeatsToRender])

    useEffect(() => {
      if (
        outlineScrollPosition &&
        scrollableRef.current &&
        beatsRef.current &&
        beatsRef.current.scrollHeight >= outlineScrollPosition &&
        !isScrolling
      ) {
        setTimeout(() => {
          scrollableRef.current.scrollTo(0, outlineScrollPosition, true)
          setIsScrolling(false)
        }, 100)
      }
    }, [beatsRef?.current?.scrollHeight])

    const handleScroll = (e) => {
      setIsScrolling(true)
      actions.recordOutlineScrollPosition(beatsRef.current.scrollTop)
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

    const insertSpace = (event) => {
      const currentValue = event.target.value
      const start = event.target.selectionStart
      const end = event.target.selectionEnd
      if (event.key === ' ') {
        actions.setOutlineSearchTerm(
          currentValue.slice(0, start) + ' ' + currentValue.slice(end + 1)
        )
      }
      event.preventDefault()
      event.stopPropagation()
    }

    const renderSubNav = () => {
      const popover = () => (
        <Popover id="filter" noMaxWidth>
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
              <Floater
                rootClose
                onClose={() => {
                  setFilterVisible(false)
                }}
                open={filterVisible}
                placement="bottom"
                component={popover}
              >
                <Button
                  bsSize="small"
                  onClick={() => {
                    setFilterVisible(!filterVisible)
                  }}
                >
                  <Glyphicon glyph="filter" />
                  {i18n('Filter by Plotline')}
                </Button>
              </Floater>
              {filterDeclaration}
            </NavItem>
            <NavItem draggable="false">
              <FormControl
                onChange={withEventTargetValue(actions.setOutlineSearchTerm)}
                onKeyUp={insertSpace}
                value={outlineSearchTerm || ''}
                type="text"
                placeholder="Search"
                className="toolbar__search"
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
        beats.slice(0, beatsToRender).map((beat, idx) => {
          let hasCards = beatsWithCards.includes(beat.id)
          const beatCards = hasCards
            ? cardMapping[beat.id]
            : lines.length > 0
            ? [emptyCard(idx, beat, lines[0])]
            : []
          return (
            <ErrorBoundary key={beat.id}>
              <BeatView beat={beat} cards={beatCards} activeFilter={!!outlineFilter} />
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
              <div className="outline__grid__minimap col-md-3 col-sm-4 hidden-xs">
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
              </div>
              <div
                className="outline__grid__beats col-xs-12 col-sm-8 col-md-9"
                ref={beatsRef}
                onScroll={handleScroll}
              >
                {!!beats.length && renderBeats(cardMap)}
              </div>
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
    outlineFilter: PropTypes.object,
    currentTimeline: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    isSeries: PropTypes.bool,
    actions: PropTypes.object.isRequired,
    outlineSearchTerm: PropTypes.string,
    outlineScrollPosition: PropTypes.object,
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
          outlineScrollPosition: selectors.outlineScrollPositionSelector(state.present),
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
