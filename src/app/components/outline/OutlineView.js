import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { Glyphicon, Nav, NavItem, Button, OverlayTrigger, Popover, Alert } from 'react-bootstrap'
import BeatView from 'components/outline/BeatView'
import MiniMap from 'components/outline/miniMap'
import i18n from 'format-message'
import ErrorBoundary from '../../containers/ErrorBoundary'
import ExportNavItem from '../export/ExportNavItem'
import { helpers, selectors } from 'pltr/v2'
import SubNav from '../../containers/SubNav'

const {
  cardMapSelector,
  sortedBeatsByBookSelector,
  sortedLinesByBookSelector,
  isSeriesSelector,
} = selectors
const {
  card: { cardMapping },
} = helpers

class OutlineView extends Component {
  constructor(props) {
    super(props)
    this.state = { active: 0, currentLine: null, firstRender: true }
  }

  componentDidMount() {
    setTimeout(() => this.setState({ firstRender: false }), 500)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.ui.currentTimeline != this.props.ui.currentTimeline) {
      this.setState({ firstRender: true })
      setTimeout(() => this.setState({ firstRender: false }), 500)
    }
  }

  setActive = (id) => {
    this.setState({ active: id })
  }

  filterItem = (id) => {
    if (this.state.currentLine === id) {
      this.setState({ currentLine: null })
    } else {
      this.setState({ currentLine: id })
    }
  }

  removeFilter = () => {
    this.setState({ currentLine: null })
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
    var placeholder = <span className="filter-list__placeholder"></span>
    if (this.state.currentLine === item.id) {
      placeholder = <Glyphicon glyph="eye-open" />
    }
    return (
      <li key={item.id} onMouseDown={() => this.filterItem(item.id)}>
        {placeholder} {item.title}
      </li>
    )
  }

  renderSubNav() {
    const { ui, file } = this.props
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
    if (this.state.currentLine == null) {
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
          <ExportNavItem fileName={file.fileName} bookId={ui.currentTimeline} />
        </Nav>
      </SubNav>
    )
  }

  renderBeats(cardMapping) {
    return this.props.beats.map((beat, idx) => {
      if (this.state.firstRender && idx > 2) return null
      return (
        <ErrorBoundary key={beat.id}>
          <BeatView
            beat={beat}
            cards={cardMapping[beat.id]}
            waypoint={this.setActive}
            activeFilter={!!this.state.currentLine}
          />
        </ErrorBoundary>
      )
    })
  }

  renderBody() {
    const { beats, lines, card2Dmap } = this.props
    const cardMap = cardMapping(beats, lines, card2Dmap, this.state.currentLine)
    return (
      <div className="outline__container tab-body">
        <div className="outline__minimap__placeholder">Fish are friends, not food</div>
        <ErrorBoundary>
          <MiniMap
            active={this.state.active}
            cardMapping={cardMap}
            activeFilter={!!this.state.currentLine}
          />
        </ErrorBoundary>
        <div className="outline__scenes-container">{this.renderBeats(cardMap)}</div>
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
  file: PropTypes.object.isRequired,
  ui: PropTypes.object.isRequired,
  isSeries: PropTypes.bool,
}

function mapStateToProps(state) {
  return {
    beats: sortedBeatsByBookSelector(state.present),
    lines: sortedLinesByBookSelector(state.present),
    card2Dmap: cardMapSelector(state.present),
    file: state.present.file,
    ui: state.present.ui,
    isSeries: isSeriesSelector(state.present),
  }
}

function mapDispatchToProps(dispatch) {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(OutlineView)
