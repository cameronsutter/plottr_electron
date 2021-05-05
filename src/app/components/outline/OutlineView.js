import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Glyphicon, Nav, NavItem, Button, OverlayTrigger, Popover, Alert } from 'react-bootstrap'
import BeatView from 'components/outline/BeatView'
import MiniMap from 'components/outline/miniMap'
import { t as i18n } from 'plottr_locales'
import { ErrorBoundary, ExportNavItem, SubNav } from 'connected-components'
import { helpers, selectors, actions } from 'pltr/v2'

const {
  cardMapSelector,
  visibleSortedBeatsByBookSelector,
  sortedLinesByBookSelector,
  isSeriesSelector,
} = selectors
const {
  card: { cardMapping },
} = helpers

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
    let popover = (
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
        <Nav pullRight>
          <ExportNavItem />
        </Nav>
      </SubNav>
    )
  }

  renderBeats(cardMapping) {
    const { beats, ui } = this.props
    return (
      !!beats.length &&
      beats.map((beat, idx) => {
        if (this.state.firstRender && idx > 2) return null
        return (
          <ErrorBoundary key={beat.id}>
            <BeatView
              beat={beat}
              cards={cardMapping[beat.id]}
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
        <div className="outline__minimap__placeholder">Fish are friends, not food</div>
        <ErrorBoundary>
          <MiniMap
            active={this.state.active}
            handleActive={this.setActive}
            cardMapping={cardMap}
            activeFilter={!!ui.outlineFilter}
          />
        </ErrorBoundary>
        <div className="outline__scenes-container">{this.renderBeats(cardMap)}</div>
      </div>
    )
  }

  render() {
    const { beats } = this.props
    return (
      <div className="container-with-sub-nav">
        {this.renderSubNav()}
        {!!beats.length && this.renderBody()}
      </div>
    )
  }
}

OutlineView.propTypes = {
  beats: PropTypes.array.isRequired,
  lines: PropTypes.array.isRequired,
  card2Dmap: PropTypes.object.isRequired,
  ui: PropTypes.object.isRequired,
  isSeries: PropTypes.bool,
  actions: PropTypes.object.isRequired,
}

function mapStateToProps(state) {
  return {
    beats: visibleSortedBeatsByBookSelector(state.present),
    lines: sortedLinesByBookSelector(state.present),
    card2Dmap: cardMapSelector(state.present),
    ui: state.present.ui,
    isSeries: isSeriesSelector(state.present),
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(actions.ui, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(OutlineView)
