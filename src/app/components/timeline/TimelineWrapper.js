import React, { Component } from 'react'
import { ipcRenderer, remote } from 'electron'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Navbar, Nav, NavItem, Button, ButtonGroup, Glyphicon, Popover, OverlayTrigger, Alert } from 'react-bootstrap'
import { StickyTable } from 'react-sticky-table'
import FilterList from 'components/filterList'
import * as UIActions from 'actions/ui'
import i18n from 'format-message'
import TimelineTable from './TimelineTable'
import cx from 'classnames'
import { FunSpinner } from '../Spinner'
import { FaSave, FaExpandAlt, FaCompressAlt } from 'react-icons/fa'
import { timelineFilterIsEmptySelector, currentTimelineSelector } from '../../selectors/ui'
import ExportNavItem from '../export/ExportNavItem'
import ClearNavItem from './ClearNavItem'

const win = remote.getCurrentWindow()

// takes into account spacing
const SCENE_CELL_WIDTH = 175 + 17;
const SCENE_CELL_HEIGHT = 74 + 40; 

class TimelineWrapper extends Component {
  constructor (props) {
    super(props)
    this.state = {
      mounted: false,
    }
    this.tableRef = null
  }

  componentDidMount () {
    this.tableRef.onscroll = this.scrollHandler

    setTimeout(() => {
      this.setState({mounted: true}, () => {
        if (this.props.ui.timelineScrollPosition == null) return;
        this.tableRef.scrollTo({
          top: this.props.ui.timelineScrollPosition.y,
          left: this.props.ui.timelineScrollPosition.x,
          behavior: 'auto'
        });
      })
    }, 100)
  }

  componentWillReceiveProps (nextProps) {
    const { ui } = this.props

    if (nextProps.ui.currentTimeline != ui.currentTimeline) {
      this.setState({mounted: false})
      setTimeout(() => this.setState({mounted: true}), 100)
    }
    if (nextProps.ui.orientation != ui.orientation) {
      this.setState({mounted: false})
      setTimeout(() => this.setState({mounted: true}), 100)
    }
  }

  componentWillUnmount () {
    this.tableRef.onScroll = null
    this.tableRef = null
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

  scrollTo = (position) => {
    const options = {
      behavior: 'smooth',
    };

    if (this.props.ui.orientation === 'vertical') {
      options.top = position
    } else {
      options.left = position
    }
    this.tableRef.scrollTo(options);
  }

  scrollDistance = () => {
    return this.props.ui.orientation === 'vertical' ? 2 * SCENE_CELL_HEIGHT : 2 * SCENE_CELL_WIDTH;
  }

  scrollLeft = () => {
    const current = this.props.ui.orientation === 'vertical'
      ? this.tableRef.scrollTop
      : this.tableRef.scrollLeft;
    this.scrollTo(current - this.scrollDistance());
  }
  scrollRight = () => {
    const current = this.props.ui.orientation === 'vertical'
      ? this.tableRef.scrollTop
      : this.tableRef.scrollLeft;
    this.scrollTo(current + this.scrollDistance());
  }
  scrollBeginning = () => this.scrollTo(0);
  scrollMiddle = () => {
    const target = this.props.ui.orientation === 'vertical'
      ? (this.tableRef.scrollHeight / 2) - (window.innerHeight / 2)
      : (this.tableRef.scrollWidth / 2) - (window.innerWidth / 2);
    this.scrollTo(target);
  }
  scrollEnd = () => {
    const target = this.props.ui.orientation === 'vertical'
      ? this.tableRef.scrollHeight
      : this.tableRef.scrollWidth;
    this.scrollTo(target);
  }

  scrollHandler = (e) => {
    const position = {
      x: e.currentTarget.scrollLeft,
      y: e.currentTarget.scrollTop,
    };
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.props.actions.recordScrollPosition(position);
    }, 500)
  }

  // ////////
  // flip  //
  // ////////

  flipOrientation = () => {
    let orientation = this.props.ui.orientation === 'horizontal' ? 'vertical' : 'horizontal'
    this.props.actions.changeOrientation(orientation)
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

  startSaveAsTemplate = () => {
    ipcRenderer.sendTo(win.webContents.id, 'save-as-template-start', 'plotlines') // sends this message to this same process
  }

  // ///////////////
  //  rendering   //
  // //////////////

  renderSubNav () {
    const { ui, file, filterIsEmpty, canSaveTemplate } = this.props
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
            <span className='subnav__container__label'>{i18n('Scroll')}: </span>
            <ButtonGroup bsSize='small'>
              <Button onClick={this.scrollLeft} ><Glyphicon glyph={scrollDirectionFirst} /></Button>
              <Button onClick={this.scrollRight} ><Glyphicon glyph={scrollDirectionSecond} /></Button>
              <Button onClick={this.scrollBeginning} >{i18n('Beginning')}</Button>
              <Button onClick={this.scrollMiddle} >{i18n('Middle')}</Button>
              <Button onClick={this.scrollEnd} >{i18n('End')}</Button>
            </ButtonGroup>
          </NavItem>
          {canSaveTemplate ? <NavItem>
            <Button bsSize='small' onClick={this.startSaveAsTemplate}><FaSave className='svg-save-template'/> {i18n('Save as Template')}</Button>
          </NavItem> : null }
          <ClearNavItem />
          <ExportNavItem fileName={file.fileName} bookId={ui.currentTimeline}/>
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
  file: PropTypes.object.isRequired,
  ui: PropTypes.object.isRequired,
  filterIsEmpty: PropTypes.bool.isRequired,
  canSaveTemplate: PropTypes.bool.isRequired,
}

function mapStateToProps (state) {
  return {
    file: state.present.file,
    ui: state.present.ui,
    filterIsEmpty: timelineFilterIsEmptySelector(state.present),
    canSaveTemplate: currentTimelineSelector(state.present) == 1,
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
