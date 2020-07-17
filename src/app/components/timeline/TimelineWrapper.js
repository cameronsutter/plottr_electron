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
import cx from 'classnames'
import { FunSpinner } from '../Spinner'
import { FaSave, FaExpandAlt, FaCompressAlt } from 'react-icons/fa'
import { timelineFilterIsEmptySelector } from '../../selectors/ui'

const win = remote.getCurrentWindow()
const dialog = remote.dialog

var scrollInterval = null

class TimelineWrapper extends Component {
  constructor (props) {
    super(props)
    this.state = {
      scrollLeft: 0,
      scrollTarget: 0,
      manualScroll: false,
      mounted: false,
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
    setTimeout(() => this.setState({mounted: true}), 100)
  }

  componentWillReceiveProps (nextProps) {
    const { ui } = this.props
    if (nextProps.ui.zoomState != ui.zoomState) {
      if (nextProps.ui.zoomState != 'fit') this.updateZoom(nextProps.ui)
    } else {
      this.updateZoom(nextProps.ui)
    }

    if (nextProps.ui.currentTimeline != ui.currentTimeline) {
      this.setState({mounted: false})
      setTimeout(() => this.setState({mounted: true}), 100)
    }
    if (nextProps.ui.orientation != ui.orientation) {
      this.setState({mounted: false})
      setTimeout(() => this.setState({mounted: true}), 100)
    }
    if (nextProps.ui.zoomIndex != ui.zoomIndex || nextProps.ui.zoomState != ui.zoomState) {
      this.setState({mounted: false})
      const updateIt = nextProps.ui.zoomState == 'fit' && ui.zoomState == null
      const uiProps = nextProps.ui
      setTimeout(() => {
        this.setState({mounted: true})
        if (updateIt) this.updateZoom(uiProps)
      }, 100)
    }
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
    this.props.actions.setTimelineFilter({...filter})
  }

  clearFilter = () => {
    this.props.actions.setTimelineFilter({ tag: [], character: [], place: [] })
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
    var middle = (this.tableRef.scrollWidth / 2) - (window.innerWidth / 2)
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
    if (!this.tableRef) return

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

  // //////////
  // expand  //
  // //////////

  toggleExpanded = () => {
    if (this.props.ui.timelineIsExpanded) {
      this.props.actions.collapseTimeline()
    } else {
      this.props.actions.expandTimeline()
    }
  }

  // ///////////////
  //  exporting   //
  // //////////////

  doExport = () => {
    let label = i18n('Where would you like to save the export?')
    const filters = [{name: 'Word', extensions: ['docx']}]
    const fileName = dialog.showSaveDialogSync({title: label, filters})
    if (fileName) {
      const options = { fileName, bookId: this.props.ui.currentTimeline }
      MPQ.push('Export')
      ipcRenderer.send('export', options, win.id)
    }
  }

  startSaveAsTemplate = () => {
    ipcRenderer.sendTo(win.webContents.id, 'save-as-template-start', 'plotlines') // sends this message to this same process
  }

  // ///////////////
  //  rendering   //
  // //////////////

  renderSubNav () {
    const { ui, filterIsEmpty } = this.props
    let glyph = 'option-vertical'
    let scrollDirectionFirst = 'menu-left'
    let scrollDirectionSecond = 'menu-right'

    let expandedText = null
    let expandedIcon = null
    if (ui.timelineIsExpanded) {
      expandedText = i18n('Collapse')
      expandedIcon = <FaCompressAlt />
    } else {
      expandedText = i18n('Expand')
      expandedIcon = <FaExpandAlt />
    }
    if (ui.orientation === 'vertical') {
      glyph = 'option-horizontal'
      scrollDirectionFirst = 'menu-up'
      scrollDirectionSecond = 'menu-down'
    }
    let popover = <Popover id='filter'>
      <FilterList filteredItems={this.props.ui.timelineFilter} updateItems={this.updateFilter} />
    </Popover>
    let filterDeclaration = <Alert onClick={this.clearFilter} bsStyle="warning"><Glyphicon glyph='remove-sign' />{"  "}{i18n('Timeline is filtered')}</Alert>
    if (filterIsEmpty) {
      filterDeclaration = <span></span>
    }

    return (
      <Navbar className={cx('subnav__container', {darkmode: ui.darkMode})}>
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
            <Button bsSize='small' onClick={this.toggleExpanded}>{expandedIcon}{' '}{expandedText}</Button>
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
            <Button bsSize='small' onClick={this.startSaveAsTemplate}><FaSave className='svg-save-template'/> {i18n('Save as Template')}</Button>
          </NavItem>
          <NavItem>
            <span className='subnav__container__label'>{i18n('Export')}: </span>
            <Button bsSize='small' onClick={this.doExport}><Glyphicon glyph='export' /></Button>
          </NavItem>
        </Nav>
      </Navbar>
    )
  }

  renderBody () {
    if (this.state.mounted) {
      return <TimelineTable tableRef={this.tableRef} />
    } else {
      return <FunSpinner/>
    }
  }

  render () {
    const { ui } = this.props
    return <div id='timelineview__container' className={cx('container-with-sub-nav', {darkmode: ui.darkMode})}>
      {this.renderSubNav()}
      <div id='timelineview__root'>
        <StickyTable leftColumnZ={5} headerZ={5} wrapperRef={ref => this.tableRef = ref} className={cx({darkmode: ui.darkMode, vertical: ui.orientation == 'vertical'})}>
          { this.renderBody() }
        </StickyTable>
      </div>
    </div>
  }
}

TimelineWrapper.propTypes = {
  ui: PropTypes.object.isRequired,
}

function mapStateToProps (state) {
  return {
    ui: state.present.ui,
    filterIsEmpty: timelineFilterIsEmptySelector(state.present),
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