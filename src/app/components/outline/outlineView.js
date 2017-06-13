import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash'
import { Glyphicon, Nav, Navbar, NavItem, Button, OverlayTrigger, Popover, Alert } from 'react-bootstrap'
import SceneView from 'components/outline/sceneView'
import MiniMap from 'components/outline/miniMap'

class OutlineView extends Component {
  constructor (props) {
    super(props)
    this.state = {affixed: false, active: '', currentLine: null}
  }

  cardMapping () {
    var mapping = {}
    this.props.scenes.forEach(s =>
      mapping[s.id] = this.sortedSceneCards(s.id)
    )
    return mapping
  }

  labelMap () {
    var mapping = {}
    this.props.tags.forEach((t) => {
      mapping[t.title.toLowerCase()] = t.color
    })
    this.props.characters.forEach((c) => {
      mapping[c.name.toLowerCase()] = c.color
    })
    this.props.places.forEach((p) => {
      mapping[p.name.toLowerCase()] = p.color
    })
    return mapping
  }

  lineIsVisible (id) {
    return this.state.currentLine ? id === this.state.currentLine : true
  }

  sortedSceneCards (sceneId) {
    var cards = this.findSceneCards(sceneId)
    const lines = _.sortBy(this.props.lines, 'position')
    var sorted = []
    lines.forEach((l) => {
      var card = _.find(cards, {lineId: l.id})
      if (card && this.lineIsVisible(l.id)) {
        sorted.push(card)
      }
    })
    return sorted
  }

  findSceneCards (sceneId) {
    return this.props.cards.filter(c =>
      c.sceneId === sceneId
    )
  }

  setActive (title) {
    this.setState({active: title})
  }

  filterItem (id) {
    if (this.state.currentLine === id) {
      this.setState({currentLine: null})
    } else {
      this.setState({currentLine: id})
    }
  }

  renderFilterList () {
    var items = this.props.lines.map((i) => {
      return this.renderFilterItem(i)
    })
    return (
      <ul className='filter-list__list'>
        {items}
      </ul>
    )
  }

  renderFilterItem (item) {
    var placeholder = <span className='filter-list__placeholder'></span>
    if (this.state.currentLine === item.id) {
      placeholder = <Glyphicon glyph='eye-open' />
    }
    return (<li key={item.id} onMouseDown={() => this.filterItem(item.id)}>
        {placeholder}{item.title}
      </li>
    )
  }

  renderSubNav () {
    let popover = <Popover id='filter'>
      <div className='filter-list'>
        {this.renderFilterList()}
      </div>
    </Popover>
    let filterDeclaration = <Alert bsStyle="warning">Outline is filtered</Alert>
    if (this.state.currentLine == null) {
      filterDeclaration = <span></span>
    }
    return (
      <Navbar className='subnav__container'>
        <Nav bsStyle='pills' >
          <NavItem>
            <OverlayTrigger containerPadding={20} trigger='click' rootClose placement='bottom' overlay={popover}>
              <Button bsSize='small'><Glyphicon glyph='filter' /> Filter by storyline</Button>
            </OverlayTrigger>
            {filterDeclaration}
          </NavItem>
        </Nav>
      </Navbar>
    )
  }

  renderScenes (cardMapping) {
    const scenes = _.sortBy(this.props.scenes, 'position')
    return scenes.map(s =>
      <SceneView key={s.id} scene={s} cards={cardMapping[s.id]} labelMap={this.labelMap()} waypoint={this.setActive.bind(this)} />
    )
  }

  render () {
    var cardMapping = this.cardMapping()
    return (
      <div className='outline__container container-with-sub-nav'>
        {this.renderSubNav()}
        <div className='outline__minimap__placeholder'>you didn&apos;t see anything</div>
        <MiniMap active={this.state.active} cardMapping={cardMapping} />
        <div className='outline__scenes-container'>
          {this.renderScenes(cardMapping)}
        </div>
      </div>
    )
  }
}

OutlineView.propTypes = {
  scenes: PropTypes.array.isRequired,
  lines: PropTypes.array.isRequired,
  cards: PropTypes.array.isRequired,
  tags: PropTypes.array.isRequired,
  characters: PropTypes.array.isRequired,
  places: PropTypes.array.isRequired
}

function mapStateToProps (state) {
  return {
    scenes: state.scenes,
    lines: state.lines,
    cards: state.cards,
    tags: state.tags,
    characters: state.characters,
    places: state.places
  }
}

function mapDispatchToProps (dispatch) {
  return {}
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OutlineView)
