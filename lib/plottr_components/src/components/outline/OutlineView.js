import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { Glyphicon, Nav, NavItem, Button, Popover, Alert, Grid, Row, Col } from 'react-bootstrap'
import OverlayTrigger from '../OverlayTrigger'
import UnconnectedBeatView from './BeatView'
import UnconnectedMiniMap from './MiniMap'
import UnconnectedErrorBoundary from '../containers/ErrorBoundary'
import UnconnectedExportNavItem from '../export/ExportNavItem'
import UnconnectedSubNav from '../containers/SubNav'
import { t as i18n } from 'plottr_locales'
import { helpers } from 'pltr/v2'
import { emptyCard } from 'pltr/v2/helpers/cards'

const {
  card: { cardMapping },
} = helpers

const OutlineViewConnector = (connector) => {
  const BeatView = UnconnectedBeatView(connector)
  const MiniMap = UnconnectedMiniMap(connector)
  const ErrorBoundary = UnconnectedErrorBoundary(connector)
  const ExportNavItem = UnconnectedExportNavItem(connector)
  const SubNav = UnconnectedSubNav(connector)

  const {
    platform: { exportDisabled },
  } = connector

  class OutlineView extends Component {
    constructor(props) {
      super(props)
      this.state = { active: 0, firstRender: true }
    }

    componentDidMount() {
      setTimeout(() => this.setState({ firstRender: false }), 500)
    }

    // Fixme: according to the React docs this will only work until 17
    // and in their experience is the cause of many errors.
    // (https://reactjs.org/docs/react-component.html#unsafe_componentwillreceiveprops)
    UNSAFE_componentWillReceiveProps(nextProps) {
      if (nextProps.ui.currentTimeline != this.props.ui.currentTimeline) {
        this.setState({ firstRender: true })
        setTimeout(() => this.setState({ firstRender: false }), 500)
      }
    }

    setActive = (id) => {
      this.setState({ active: id })
    }

    fixMe = () => {
      console.warn('OutlineView waypoint needs fixing')
    }

    filterItem = (id) => {
      const { actions } = this.props
      actions.setOutlineFilter(id)
    }

    removeFilter = () => {
      this.props.actions.setOutlineFilter(null)
    }

    // ///////////////
    //  rendering   //
    // //////////////

    renderFilterList() {
      var items = this.props.lines.map((i) => {
        return this.renderFilterItem(i)
      })
      return <ul className="filter-list__list">{items}</ul>
    }

    renderFilterItem(item) {
      const { ui } = this.props
      var placeholder = <span className="filter-list__placeholder"></span>
      if (
        (Array.isArray(ui.outlineFilter) && ui.outlineFilter.includes(item.id)) ||
        (!Array.isArray(ui.outlineFilter) && ui.outlineFilter === item.id)
      ) {
        placeholder = <Glyphicon glyph="eye-open" />
      }
      return (
        <li key={item.id} onMouseDown={() => this.filterItem(item.id)}>
          {placeholder} {item.title}
        </li>
      )
    }

    renderSubNav() {
      const { ui } = this.props
      const popover = () => (
        <Popover id="filter">
          <div className="filter-list">{this.renderFilterList()}</div>
        </Popover>
      )
      let filterDeclaration = (
        <Alert onClick={this.removeFilter} bsStyle="warning">
          <Glyphicon glyph="remove-sign" />
          {'  '}
          {i18n('Outline is filtered')}
        </Alert>
      )
      if (!ui.outlineFilter || !ui.outlineFilter.length) {
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
          </Nav>
          {!exportDisabled && (
            <Nav pullRight>
              <ExportNavItem />
            </Nav>
          )}
        </SubNav>
      )
    }

    renderBeats(cardMapping) {
      const { beats, ui, allCards, lines } = this.props
      let beatsWithCards = allCards.map((card) => card.beatId)

      return (
        !!beats.length &&
        beats.map((beat, idx) => {
          if (this.state.firstRender && idx > 2) return null
          let hasCards = beatsWithCards.includes(beat.id)
          const beatCards = hasCards ? cardMapping[beat.id] : [emptyCard(idx, beat, lines[0])]
          return (
            <ErrorBoundary key={beat.id}>
              <BeatView
                beat={beat}
                cards={beatCards}
                waypoint={this.fixMe}
                activeFilter={!!ui.outlineFilter}
              />
            </ErrorBoundary>
          )
        })
      )
    }

    renderBody() {
      const { beats, lines, card2Dmap, ui } = this.props
      const cardMap = cardMapping(beats, lines, card2Dmap, ui.outlineFilter)
      return (
        <div className="outline__container tab-body">
          <Grid fluid className="outline__grid">
            <Row>
              <Col xsHidden sm={4} md={3} className="outline__grid__minimap">
                <ErrorBoundary>
                  <MiniMap
                    active={this.state.active}
                    handleActive={this.setActive}
                    cardMapping={cardMap}
                    activeFilter={!!ui.outlineFilter}
                  />
                </ErrorBoundary>
              </Col>
              <Col xs={12} sm={8} md={9} className="outline__grid__beats">
                {!!beats.length && this.renderBeats(cardMap)}
              </Col>
            </Row>
          </Grid>
        </div>
      )
    }

    render() {
      return (
        <div className="container-with-sub-nav">
          {this.renderSubNav()}
          {this.renderBody()}
        </div>
      )
    }
  }

  OutlineView.propTypes = {
    beats: PropTypes.array.isRequired,
    lines: PropTypes.array.isRequired,
    card2Dmap: PropTypes.object.isRequired,
    allCards: PropTypes.array,
    ui: PropTypes.object.isRequired,
    isSeries: PropTypes.bool,
    actions: PropTypes.object.isRequired,
  }

  const {
    redux,
    pltr: { selectors, actions },
  } = connector
  const {
    cardMapSelector,
    sortedBeatsByBookSelector,
    sortedLinesByBookSelector,
    isSeriesSelector,
    allCardsSelector,
  } = selectors

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(
      (state) => {
        return {
          beats: sortedBeatsByBookSelector(state.present),
          lines: sortedLinesByBookSelector(state.present),
          card2Dmap: cardMapSelector(state.present),
          allCards: allCardsSelector(state.present),
          ui: state.present.ui,
          isSeries: isSeriesSelector(state.present),
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
