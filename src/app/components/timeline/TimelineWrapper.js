import React, { Component } from 'react'
import { ipcRenderer, remote } from 'electron'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Navbar, Nav, NavItem, Button, ButtonGroup, Glyphicon, Popover, OverlayTrigger, Alert } from 'react-bootstrap'
import { StickyTable } from 'react-sticky-table'
import 'style-loader!css-loader!react-sticky-table/dist/react-sticky-table.css'
import { MPQ } from 'middlewares/helpers'
import FilterList from 'components/filterList'
import * as UIActions from 'actions/ui'
import i18n from 'format-message'
import TimelineTable from './TimelineTable'
import { computeZoom, computeZoomKlass } from 'helpers/zoom'

const win = remote.getCurrentWindow()
const dialog = remote.dialog

var scrollInterval = null

class TimelineWrapper extends Component {
  constructor (props) {
    super(props)
    this.state = {
      filter: null,
      scrollTarget: 0
    }
  }

  componentDidMount () {
    const { zoomIndex } = this.props.ui
    if (!zoomIndex) this.props.actions.resetZoom()
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
    this.props.actions.resetZoom()
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

    // had to remove this
    // <Button onClick={() => this.props.actions.fitZoom()} >{i18n('Fit')}</Button>
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
              <Button onClick={() => this.props.actions.increaseZoom()} ><Glyphicon glyph='plus-sign' /></Button>
              <Button onClick={() => this.props.actions.decreaseZoom()} ><Glyphicon glyph='minus-sign' /></Button>
              <Button onClick={() => this.props.actions.resetZoom()} >{i18n('Reset')}</Button>
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
    const { orientation, darkMode } = this.props.ui
    let orientationKlass = orientation === 'vertical' ? 'vertical' : ''
    let containerKlasses = 'container-with-sub-nav'
    if (darkMode) containerKlasses += ' darkmode'
    // might be able to use this for zoom fit
    // const zoomStyles = computeZoom(this.refs.table, this.props.ui)
    const zoomKlass = computeZoomKlass(this.props.ui)
    return (
      <div id='timelineview__container' className={containerKlasses}>
        {this.renderSubNav()}
        <div id='timelineview__root' className={orientationKlass}>
          <StickyTable className={zoomKlass}>
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