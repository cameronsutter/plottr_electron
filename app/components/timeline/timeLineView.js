import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Navbar, Nav, NavItem, Button, ButtonGroup, Glyphicon } from 'react-bootstrap'
import SceneListView from 'components/timeline/sceneListView'
import LineListView from 'components/timeline/lineListView'

const ZOOM_STATES = [0.1, 0.25, 0.5, 0.75, 1, 1.5, 2, 3]
const INITIAL_ZOOM_INDEX = 4
const INITIAL_ZOOM_STATE = 'initial'
const FIT_ZOOM_STATE = 'fit'

class TimeLineView extends Component {
  constructor (props) {
    super(props)
    this.state = {filteredItems: this.defaultFilteredItemsObj(), zoomState: INITIAL_ZOOM_STATE, zoomIndex: INITIAL_ZOOM_INDEX}
  }

  defaultFilteredItemsObj () {
    return {tag: [], character: [], place: []}
  }

  filterItem (type, id) {
    var filteredItems = this.state.filteredItems
    if (filteredItems[type].indexOf(id) === -1) {
      filteredItems[type].push(id)
    } else {
      var index = filteredItems[type].indexOf(id)
      if (index !== -1) filteredItems[type].splice(index, 1)
    }
    this.setState({filteredItems: filteredItems})
  }

  filterList (type, list) {
    var filteredItems = this.state.filteredItems
    if (filteredItems[type].length > 0) {
      filteredItems[type] = []
    } else {
      filteredItems[type] = list.map((item) => item.id)
    }
    this.setState({filteredItems: filteredItems})
  }

  makeTransform () {
    var elem = this.refs.timeline
    var scale = ZOOM_STATES[this.state.zoomIndex]
    if (this.state.zoomState === INITIAL_ZOOM_STATE) return {transform: INITIAL_ZOOM_STATE}
    else if (this.state.zoomState === FIT_ZOOM_STATE) scale = window.outerWidth / elem.scrollWidth

    return {transform: `scale(${scale}, ${scale})`, transformOrigin: 'left top'}
  }

  increaseZoomFactor () {
    var newIndex = this.state.zoomIndex
    if (newIndex < ZOOM_STATES.length - 1) newIndex++
    this.setState({zoomState: null, zoomIndex: newIndex})
  }

  decreaseZoomFactor () {
    var newIndex = this.state.zoomIndex
    if (newIndex > 0) newIndex--
    this.setState({zoomState: null, zoomIndex: newIndex})
  }

  render () {
    var styles = this.makeTransform()
    return (
      <div id='timelineview__container' className='container-with-sub-nav'>
        <Navbar className='subnav__container'>
          <Nav bsStyle='pills' >
            <NavItem>
              <Button bsSize='small' ><Glyphicon glyph='filter' /> Filter</Button>
            </NavItem>
            <NavItem>
              <span>Zoom: </span>
              <ButtonGroup bsSize='small'>
                <Button onClick={this.increaseZoomFactor.bind(this)} ><Glyphicon glyph='plus-sign' /></Button>
                <Button onClick={this.decreaseZoomFactor.bind(this)} ><Glyphicon glyph='minus-sign' /></Button>
                <Button onClick={() => this.setState({zoomState: FIT_ZOOM_STATE, zoomIndex: INITIAL_ZOOM_INDEX})} >Fit</Button>
                <Button onClick={() => this.setState({zoomState: INITIAL_ZOOM_STATE, zoomIndex: INITIAL_ZOOM_INDEX})} >Reset</Button>
              </ButtonGroup>
            </NavItem>
          </Nav>
        </Navbar>
        <div id='timelineview__root' ref='timeline' style={styles}>
          <SceneListView filterItem={this.filterItem.bind(this)} filterList={this.filterList.bind(this)} filteredItems={this.state.filteredItems} />
          <LineListView sceneMap={this.sceneMapping()} filteredItems={this.state.filteredItems} />
        </div>
      </div>
    )
  }
  // <div className='subnav__container well'>
  // <Button bsSize='small' ><Glyphicon glyph='filter' /> Filter</Button>
  // <Button bsSize='small' ><Glyphicon glyph='zoom-in' /> Zoom In</Button>
  // <Button bsSize='small' ><Glyphicon glyph='search' /> Normal</Button>
  // <Button bsSize='small' ><Glyphicon glyph='zoom-out' /> Zoom Out</Button>
  // </div>

  sceneMapping () {
    var mapping = {}
    this.props.scenes.forEach((s) => {
      mapping[s.position] = s.id
    })
    return mapping
  }
}

TimeLineView.propTypes = {
  scenes: PropTypes.array.isRequired
}

function mapStateToProps (state) {
  return {
    scenes: state.scenes
  }
}

function mapDispatchToProps (dispatch) {
  return {}
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TimeLineView)
