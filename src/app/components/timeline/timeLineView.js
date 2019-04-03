import { ipcRenderer, remote } from 'electron'
import React, { Component, PropTypes } from 'react'
import PureComponent from 'react.pure.component'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Navbar, Nav, NavItem, Button, ButtonGroup, Glyphicon, Popover, OverlayTrigger, Alert } from 'react-bootstrap'
import { MPQ } from 'middlewares/helpers'
import SceneListView from 'components/timeline/sceneListView'
import LineListView from 'components/timeline/lineListView'
import FilterList from 'components/filterList'
import * as UIActions from 'actions/ui'
import i18n from 'format-message'
const win = remote.getCurrentWindow()
const dialog = remote.dialog

const ZOOM_STATES = [0.1, 0.25, 0.5, 0.75, 1, 1.5, 2, 3]
const INITIAL_ZOOM_INDEX = 4
const INITIAL_ZOOM_STATE = 'initial'
const FIT_ZOOM_STATE = 'fit'

var scrollInterval = null

class TimeLineView extends Component {
  constructor (props) {
    super(props)
    this.state = {
      filter: null,
      zoomState: INITIAL_ZOOM_STATE,
      zoomIndex: INITIAL_ZOOM_INDEX,
      scrollTarget: 0
    }
  }

  // ////////////////
  //  filtering   //
  // //////////////

  updateFilter = (filter) => {
    this.setState({ filter })
  }

  filterIsEmpty () {
    let filter = this.state.filter
    return filter == null ||
      (filter['tag'].length === 0 &&
      filter['character'].length === 0 &&
      filter['place'].length === 0)
  }

  // ////////////////
  //   zooming    //
  // //////////////

  scale () {
    var elem = this.refs.timeline
    var scale = ZOOM_STATES[this.state.zoomIndex]
    if (this.state.zoomState === FIT_ZOOM_STATE) {
      if (this.props.ui.orientation === 'horizontal') {
        scale = (window.outerWidth - 10) / elem.scrollWidth
      } else {
        // take into account navigation height
        scale = (window.outerHeight - 150) / elem.scrollHeight
      }
    }
    return scale
  }

  makeTransform () {
    if (this.state.zoomState === INITIAL_ZOOM_STATE) return {transform: INITIAL_ZOOM_STATE}
    var scale = this.scale()
    return {transform: `scale(${scale}, ${scale})`, transformOrigin: 'left top'}
  }

  increaseZoomFactor = () => {
    var newIndex = this.state.zoomIndex
    if (newIndex < ZOOM_STATES.length - 1) newIndex++
    this.setState({zoomState: null, zoomIndex: newIndex})
  }

  decreaseZoomFactor = () => {
    var newIndex = this.state.zoomIndex
    if (newIndex > 0) newIndex--
    this.setState({zoomState: null, zoomIndex: newIndex})
  }

  resetZoom = () => {
    this.setState({zoomState: INITIAL_ZOOM_STATE, zoomIndex: INITIAL_ZOOM_INDEX})
  }

  zoomIntoCard = (x, y) => {
    var scale = this.scale()
    if (scale >= 1) {
      x *= scale
    } else {
      x /= scale
    }
    this.resetZoom()
    this.scrollTo(x, y)
  }

  // ////////////////
  //  scrolling   //
  // //////////////

  scrollRight = () => {
    clearInterval(scrollInterval)
    this.setState({scrollTarget: this.state.scrollTarget + 700})
    scrollInterval = setInterval(this.increaseScroll, 25)
    setTimeout(() => { clearInterval(scrollInterval) }, 500)
  }

  scrollLeft = () => {
    clearInterval(scrollInterval)
    this.setState({scrollTarget: this.state.scrollTarget - 700})
    scrollInterval = setInterval(this.decreaseScroll, 25)
    setTimeout(() => { clearInterval(scrollInterval) }, 500)
  }

  scrollBeginning = () => {
    clearInterval(scrollInterval)
    this.setState({scrollTarget: 0})
    scrollInterval = setInterval(this.decreaseScroll, 25)
    setTimeout(() => { clearInterval(scrollInterval) }, 3000)
  }

  scrollMiddle = () => {
    clearInterval(scrollInterval)
    var middle = (this.refs.timeline.scrollWidth / 2) - (window.outerWidth / 2)
    if (this.props.ui.orientation === 'vertical') {
      middle = (this.refs.timeline.scrollHeight / 2)
    }
    this.setState({scrollTarget: middle})
    if (document.body.scrollLeft > middle) {
      scrollInterval = setInterval(this.decreaseScroll, 25)
    } else {
      scrollInterval = setInterval(this.increaseScroll, 25)
    }
    setTimeout(() => { clearInterval(scrollInterval) }, 1500)
  }

  scrollEnd = () => {
    clearInterval(scrollInterval)
    var end = this.refs.timeline.scrollWidth - window.outerWidth
    if (this.props.ui.orientation === 'vertical') {
      end = this.refs.timeline.scrollHeight
    }
    this.setState({scrollTarget: end})
    scrollInterval = setInterval(this.increaseScroll, 25)
    setTimeout(() => { clearInterval(scrollInterval) }, 3000)
  }

  increaseScroll = () => {
    if (this.props.ui.orientation === 'vertical') {
      if (document.body.scrollTop >= this.state.scrollTarget) clearInterval(scrollInterval)
      else document.body.scrollTop += 100
    } else {
      if (document.body.scrollLeft >= this.state.scrollTarget) clearInterval(scrollInterval)
      else document.body.scrollLeft += 100
    }
  }

  decreaseScroll = () => {
    if (this.props.ui.orientation === 'vertical') {
      if (document.body.scrollTop <= this.state.scrollTarget) clearInterval(scrollInterval)
      else document.body.scrollTop -= 100
    } else {
      if (document.body.scrollLeft <= this.state.scrollTarget) clearInterval(scrollInterval)
      else document.body.scrollLeft -= 100
    }
  }

  scrollTo (x, y) {
    setTimeout(() => {
      document.body.scrollTop = y
      document.body.scrollLeft = x + 300 - (window.outerWidth / 2)
    }, 10)
  }

  // //////////////
  // flip
  // //////////////

  flipOrientation = () => {
    let orientation = this.props.ui.orientation === 'horizontal' ? 'vertical' : 'horizontal'
    this.props.actions.changeOrientation(orientation)
    this.resetZoom()
  }

  // ///////////////
  //  exporting   //
  // //////////////

  doExport = () => {
    let label = i18n('Where would you like to save the export?')
    dialog.showSaveDialog({title: label}, function (fileName) {
      if (fileName) {
        let options = {
          fileName
        }
        MPQ.push('Export')
        ipcRenderer.send('export', options, win.id)
      }
    })
  }

  // ///////////////
  //  rendering   //
  // //////////////

  renderSubNav () {
    let glyph = 'option-vertical'
    let scrollDirectionFirst = 'menu-left'
    let scrollDirectionSecond = 'menu-right'
    if (this.props.ui.orientation === 'vertical') {
      glyph = 'option-horizontal'
      scrollDirectionFirst = 'menu-up'
      scrollDirectionSecond = 'menu-down'
    }
    let popover = <Popover id='filter'>
      <FilterList filteredItems={this.state.filter} updateItems={this.updateFilter}/>
    </Popover>
    let filterDeclaration = <Alert bsStyle="warning">{i18n('Timeline is filtered')}</Alert>
    if (this.filterIsEmpty()) {
      filterDeclaration = <span></span>
    }
    let subNavKlasses = 'subnav__container'
    if (this.props.ui.darkMode) subNavKlasses += ' darkmode'
    return (
      <Navbar className={subNavKlasses}>
        <Nav bsStyle='pills' >
          <NavItem>
            <OverlayTrigger containerPadding={20} trigger='click' rootClose placement='bottom' overlay={popover}>
              <Button bsSize='small'><Glyphicon glyph='filter' /> {i18n('Filter')}</Button>
            </OverlayTrigger>
            {filterDeclaration}
          </NavItem>
          <NavItem>
            <Button bsSize='small' onClick={this.flipOrientation}><Glyphicon glyph={glyph} /> {i18n('Flip')}</Button>
          </NavItem>
          <NavItem>
            <span className='subnav__container__label'>{i18n('Zoom')}: </span>
            <ButtonGroup bsSize='small'>
              <Button onClick={this.increaseZoomFactor} ><Glyphicon glyph='plus-sign' /></Button>
              <Button onClick={this.decreaseZoomFactor} ><Glyphicon glyph='minus-sign' /></Button>
              <Button onClick={() => this.setState({zoomState: FIT_ZOOM_STATE, zoomIndex: INITIAL_ZOOM_INDEX})} >{i18n('Fit')}</Button>
              <Button onClick={this.resetZoom} >{i18n('Reset')}</Button>
            </ButtonGroup>
          </NavItem>
          <NavItem>
            <span className='subnav__container__label'>{i18n('Scroll')}: </span>
            <ButtonGroup bsSize='small'>
              <Button onClick={this.scrollLeft} ><Glyphicon glyph={scrollDirectionFirst} /></Button>
              <Button onClick={this.scrollRight} ><Glyphicon glyph={scrollDirectionSecond} /></Button>
              <Button onClick={this.scrollBeginning} >{i18n('Beginning')}</Button>
              <Button onClick={this.scrollMiddle} >{i18n('Middle')}</Button>
              <Button onClick={this.scrollEnd} >{i18n('End')}</Button>
            </ButtonGroup>
          </NavItem>
          <NavItem>
            <span className='subnav__container__label'>{i18n('Export')}: </span>
            <Button bsSize='small' onClick={this.doExport}><Glyphicon glyph='export' /></Button>
          </NavItem>
        </Nav>
      </Navbar>
    )
  }

  render () {
    let styles = this.makeTransform()
    let isZoomed = (this.state.zoomState !== INITIAL_ZOOM_STATE) && (this.state.zoomIndex <= INITIAL_ZOOM_INDEX)
    let orientation = this.props.ui.orientation === 'vertical' ? 'vertical' : ''
    // zoomFactor allows us to scale cards and scenes in a ratio that fits the scale determined by zoomState
    let zoomFactor = this.state.zoomState === FIT_ZOOM_STATE ? FIT_ZOOM_STATE : ZOOM_STATES[this.state.zoomIndex]
    let containerKlasses = 'container-with-sub-nav'
    if (this.props.ui.darkMode) containerKlasses += ' darkmode'
    return (
      <div id='timelineview__container' className={containerKlasses}>
        {this.renderSubNav()}
        <div id='timelineview__root' className={orientation} ref='timeline' style={styles}>
          <SceneListView isZoomed={isZoomed} />
          <LineListView
            sceneMap={this.sceneMapping()}
            filteredItems={this.state.filter}
            isZoomed={isZoomed} />
        </div>
      </div>
    )
  }

  sceneMapping () {
    var mapping = {}
    this.props.scenes.forEach((s) => {
      mapping[s.position] = s.id
    })
    return mapping
  }
}

TimeLineView.propTypes = {
  scenes: PropTypes.array.isRequired,
  tags: PropTypes.array.isRequired,
  characters: PropTypes.array.isRequired,
  places: PropTypes.array.isRequired,
  ui: PropTypes.object.isRequired,
}

function mapStateToProps (state) {
  return {
    scenes: state.scenes,
    tags: state.tags,
    characters: state.characters,
    places: state.places,
    ui: state.ui,
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(UIActions, dispatch)
  }
}

const Pure = PureComponent(TimeLineView)

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Pure)
