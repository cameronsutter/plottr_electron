import React, { Component } from 'react'
import { ipcRenderer, remote } from 'electron'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Navbar, Nav, NavItem, Button, ButtonGroup, Glyphicon, Popover, OverlayTrigger, Alert } from 'react-bootstrap'
import { StickyTable } from 'react-sticky-table'
import { MPQ } from 'middlewares/helpers'
import FilterList from 'components/filterList'
import * as UIActions from 'actions/ui'
import i18n from 'format-message'
import TimelineTable from './TimelineTable'
import { computeZoom } from 'helpers/zoom'
import { FIT_ZOOM_STATE, ZOOM_STATES } from '../../constants/zoom_states'

const win = remote.getCurrentWindow()
const dialog = remote.dialog

var scrollInterval = null

class TimelineWrapper extends Component {
  constructor (props) {
    super(props)
    this.state = {
      filter: null,
      scrollLeft: 0,
      scrollTarget: 0,
      manualScroll: false,
    }
    this.tableRef = null
  }

  componentDidMount () {
    this.tableRef.onscroll = this.scrollHandler
    const { zoomIndex } = this.props.ui
    if (!zoomIndex) {
      this.props.actions.resetZoom()
    } else {
      this.updateZoom(this.props.ui)
    }
  }

  componentWillReceiveProps (nextProps) {
    this.updateZoom(nextProps.ui)
  }

  componentWillUnmount () {
    this.tableRef.onScroll = null
    this.tableRef = null
  }

  // ////////////
  //  zooming  //
  // ////////////

  updateZoom = (uiProps) => {
    const zoomScale = computeZoom(this.tableRef, uiProps)
    this.tableRef.children[0].style.transform = zoomScale;
  }

  zoomLabel = () => {
    if (this.props.ui.zoomState === FIT_ZOOM_STATE) return 'fit'
    return `${ZOOM_STATES[this.props.ui.zoomIndex]}x`
  }

  // //////////////
  //  filtering  //
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

  // //////////////
  //  scrolling  //
  // //////////////

  scrollDistance = () => {
    if (this.props.ui.orientation === 'vertical') return window.innerHeight - 165
    return window.innerWidth - 200
  }

  scrollRight = () => {
    this.setState({manualScroll: true})
    clearInterval(scrollInterval)
    this.setState({scrollTarget: this.state.scrollTarget + this.scrollDistance()})
    scrollInterval = setInterval(this.increaseScroll, 10)
    setTimeout(() => { clearInterval(scrollInterval) }, 500)
  }

  scrollLeft = () => {
    this.setState({manualScroll: true})
    clearInterval(scrollInterval)
    this.setState({scrollTarget: this.state.scrollTarget - this.scrollDistance()})
    scrollInterval = setInterval(this.decreaseScroll, 10)
    setTimeout(() => { clearInterval(scrollInterval) }, 500)
  }

  scrollBeginning = () => {
    this.setState({manualScroll: true})
    clearInterval(scrollInterval)
    this.setState({scrollTarget: 0})
    scrollInterval = setInterval(this.decreaseScroll, 10)
    setTimeout(() => { clearInterval(scrollInterval) }, 3000)
  }

  scrollMiddle = () => {
    this.setState({manualScroll: true})
    clearInterval(scrollInterval)
    var middle = (this.tableRef.scrollWidth / 2)
    if (this.props.ui.orientation === 'vertical') {
      middle = (this.tableRef.scrollHeight / 2)
    }
    this.setState({scrollTarget: middle})
    if (this.tableRef.scrollLeft > middle) {
      scrollInterval = setInterval(this.decreaseScroll, 10)
    } else {
      scrollInterval = setInterval(this.increaseScroll, 10)
    }
    setTimeout(() => { clearInterval(scrollInterval) }, 1500)
  }

  scrollEnd = () => {
    this.setState({manualScroll: true})
    clearInterval(scrollInterval)
    var end = this.tableRef.scrollWidth
    if (this.props.ui.orientation === 'vertical') {
      end = this.tableRef.scrollHeight
    }
    this.setState({scrollTarget: end})
    scrollInterval = setInterval(this.increaseScroll, 10)
    setTimeout(() => { clearInterval(scrollInterval) }, 3000)
  }

  increaseScroll = () => {
    if (this.props.ui.orientation === 'vertical') {
      if (this.tableRef.scrollTop >= this.state.scrollTarget) this.clearManualScroll()
      else this.tableRef.scrollTop += 100
    } else {
      if (this.tableRef.scrollLeft >= this.state.scrollTarget) this.clearManualScroll()
      else this.tableRef.scrollLeft += 100
    }
  }

  decreaseScroll = () => {
    if (this.props.ui.orientation === 'vertical') {
      if (this.tableRef.scrollTop <= this.state.scrollTarget) this.clearManualScroll()
      else this.tableRef.scrollTop -= 100
    } else {
      if (this.tableRef.scrollLeft <= this.state.scrollTarget) this.clearManualScroll()
      else this.tableRef.scrollLeft -= 100
    }
  }

  clearManualScroll = () => {
    clearInterval(scrollInterval)
    this.setState({manualScroll: false})
  }

  scrollTo (x, y) {
    setTimeout(() => {
      this.tableRef.scrollTop = y
      this.tableRef.scrollLeft = x + 300 - (window.outerWidth / 2)
    }, 10)
  }

  scrollHandler = (e) => {
    if (!this.state.manualScroll) this.updateScrollLeft(this.props.ui.orientation)
  }

  updateScrollLeft = (orientation = 'horizontal') => {
    let newScrollLeft = this.tableRef.scrollLeft
    if (orientation === 'vertical') {
      newScrollLeft = this.tableRef.scrollHeight
    }
    this.setState({scrollLeft: newScrollLeft, scrollTarget: newScrollLeft})
  }

  // ////////
  // flip  //
  // ////////

  flipOrientation = () => {
    let orientation = this.props.ui.orientation === 'horizontal' ? 'vertical' : 'horizontal'
    this.props.actions.changeOrientation(orientation)
    this.props.actions.resetZoom()
    this.updateScrollLeft(orientation)
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
            <span className='subnav__container__label'>{i18n('Zoom')}</span>
            <span className='subnav__container__label'> ({this.zoomLabel()}): </span>
            <ButtonGroup bsSize='small'>
              <Button onClick={this.props.actions.increaseZoom} ><Glyphicon glyph='plus-sign' /></Button>
              <Button onClick={this.props.actions.decreaseZoom} ><Glyphicon glyph='minus-sign' /></Button>
              <Button onClick={this.props.actions.fitZoom} >{i18n('Fit')}</Button>
              <Button onClick={this.props.actions.resetZoom} >{i18n('Reset')}</Button>
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
    const { darkMode } = this.props.ui
    let containerKlasses = 'container-with-sub-nav'
    if (darkMode) containerKlasses += ' darkmode'
    let tableKlass = darkMode ? 'darkmode' : ''
    return (
      <div id='timelineview__container' className={containerKlasses}>
        {this.renderSubNav()}
        <div id='timelineview__root'>
          <StickyTable wrapperRef={ref => this.tableRef = ref} className={tableKlass}>
            <TimelineTable
              filter={this.state.filter}
              filterIsEmpty={this.filterIsEmpty()}
            />
          </StickyTable>
        </div>
      </div>
    )
  }
}

TimelineWrapper.propTypes = {
  ui: PropTypes.object.isRequired,
}

function mapStateToProps (state) {
  return {
    ui: state.ui,
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(UIActions, dispatch),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TimelineWrapper)