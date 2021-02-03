import React, { Component } from 'react'
import { ipcRenderer, remote } from 'electron'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {
  Navbar,
  Nav,
  NavItem,
  Button,
  ButtonGroup,
  Glyphicon,
  Popover,
  OverlayTrigger,
  Alert,
} from 'react-bootstrap'
import { StickyTable } from 'react-sticky-table'
import CustomAttrFilterList from 'components/customAttrFilterList'
import CustomAttributeModal from '../dialogs/CustomAttributeModal'
import i18n from 'format-message'
import TimelineTable from './TimelineTable'
import cx from 'classnames'
import { FunSpinner } from '../../../common/components/Spinner'
import { FaSave, FaExpandAlt, FaCompressAlt } from 'react-icons/fa'
import ExportNavItem from '../export/ExportNavItem'
import ClearNavItem from './ClearNavItem'
import { actions, selectors } from 'pltr/v2'

const win = remote.getCurrentWindow()

// takes into account spacing
const SCENE_CELL_WIDTH = 175 + 17
const SCENE_CELL_HEIGHT = 74 + 40

class TimelineWrapper extends Component {
  constructor(props) {
    super(props)
    this.state = {
      mounted: false,
    }
    // TODO: refactor this to use createRef
    this.tableRef = null
  }

  componentDidMount() {
    if (this.props.isSmall) return

    if (this.tableRef) this.tableRef.onscroll = this.scrollHandler

    setTimeout(() => {
      this.setState({ mounted: true }, () => {
        if (this.props.ui.timelineScrollPosition == null) return
        if (this.tableRef) {
          this.tableRef.scrollTo({
            top: this.props.ui.timelineScrollPosition.y,
            left: this.props.ui.timelineScrollPosition.x,
            behavior: 'auto',
          })
        }
      })
    }, 10)
  }

  componentWillReceiveProps(nextProps) {
    const { ui } = this.props

    if (
      nextProps.ui.currentTimeline != ui.currentTimeline ||
      nextProps.ui.orientation != ui.orientation ||
      nextProps.ui.timeline.size != ui.timeline.size
    ) {
      this.setState({ mounted: false })
      setTimeout(
        () =>
          this.setState({ mounted: true }, () => {
            if (nextProps.ui.timelineScrollPosition == null) return
            if (this.tableRef) {
              this.tableRef.scrollTo({
                top: this.props.ui.timelineScrollPosition.y,
                left: this.props.ui.timelineScrollPosition.x,
                behavior: 'auto',
              })
            }
          }),
        10
      )
    }
    // if () {
    //   this.setState({mounted: false})
    //   setTimeout(() => this.setState({mounted: true}), 100)
    // }
    // if () {
    //   this.setState({mounted: false})
    //   setTimeout(() => this.setState({mounted: true}), 100)
    // }
  }

  componentWillUnmount() {
    if (this.tableRef) {
      this.tableRef.onScroll = null
      this.tableRef = null
    }
  }

  // ///////////////
  //  attributes  //
  // ///////////////

  openCustomAttributesDialog = () => {
    this.props.actions.openAttributesDialog()
  }

  // //////////////
  //  filtering  //
  // //////////////

  clearFilter = () => {
    this.props.actions.setTimelineFilter({ tag: [], character: [], place: [] })
  }

  // //////////////
  //  scrolling  //
  // //////////////

  scrollTo = (position) => {
    const options = {
      behavior: 'smooth',
    }

    if (this.props.ui.orientation === 'vertical') {
      options.top = position
    } else {
      options.left = position
    }
    this.tableRef.scrollTo(options)
  }

  scrollDistance = () => {
    return this.props.ui.orientation === 'vertical' ? 2 * SCENE_CELL_HEIGHT : 2 * SCENE_CELL_WIDTH
  }

  scrollLeft = () => {
    const current =
      this.props.ui.orientation === 'vertical' ? this.tableRef.scrollTop : this.tableRef.scrollLeft
    this.scrollTo(current - this.scrollDistance())
  }
  scrollRight = () => {
    const current =
      this.props.ui.orientation === 'vertical' ? this.tableRef.scrollTop : this.tableRef.scrollLeft
    this.scrollTo(current + this.scrollDistance())
  }
  scrollBeginning = () => this.scrollTo(0)
  scrollMiddle = () => {
    const target =
      this.props.ui.orientation === 'vertical'
        ? this.tableRef.scrollHeight / 2 - window.innerHeight / 2
        : this.tableRef.scrollWidth / 2 - window.innerWidth / 2
    this.scrollTo(target)
  }
  scrollEnd = () => {
    const target =
      this.props.ui.orientation === 'vertical'
        ? this.tableRef.scrollHeight
        : this.tableRef.scrollWidth
    this.scrollTo(target)
  }

  scrollHandler = (e) => {
    const position = {
      x: e.currentTarget.scrollLeft,
      y: e.currentTarget.scrollTop,
    }
    clearTimeout(this.timeout)
    this.timeout = setTimeout(() => {
      this.props.actions.recordScrollPosition(position)
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

  renderSubNav() {
    const {
      ui,
      file,
      filterIsEmpty,
      canSaveTemplate,
      isSmall,
      isMedium,
      isLarge,
      actions,
    } = this.props
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
    let popover = (
      <Popover id="filter">
        <CustomAttrFilterList type="cards" />
      </Popover>
    )
    let filterDeclaration = (
      <Alert onClick={this.clearFilter} bsStyle="warning">
        <Glyphicon glyph="remove-sign" />
        {'  '}
        {i18n('Timeline is filtered')}
      </Alert>
    )
    if (filterIsEmpty) {
      filterDeclaration = <span></span>
    }

    return (
      <Navbar className={cx('subnav__container', { darkmode: ui.darkMode })}>
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
                <Glyphicon glyph="filter" /> {i18n('Filter')}
              </Button>
            </OverlayTrigger>
            {filterDeclaration}
          </NavItem>
          <NavItem>
            <Button bsSize="small" onClick={this.flipOrientation}>
              <Glyphicon glyph={glyph} /> {i18n('Flip')}
            </Button>
          </NavItem>
          <NavItem>
            <Button bsSize="small" onClick={this.openCustomAttributesDialog}>
              <Glyphicon glyph="list" /> {i18n('Attributes')}
            </Button>
          </NavItem>
          <NavItem>
            <Button bsSize="small" onClick={this.toggleExpanded}>
              {expandedIcon} {expandedText}
            </Button>
          </NavItem>
          <NavItem>
            <span className="subnav__container__label">{i18n('Zoom')}: </span>
            <ButtonGroup>
              <Button
                bsSize="small"
                className={cx({ active: isSmall })}
                onClick={() => actions.setTimelineSize('small')}
                title={i18n('Size: small')}
              >
                S
              </Button>
              <Button
                bsSize="small"
                className={cx({ active: isMedium })}
                onClick={() => actions.setTimelineSize('medium')}
                title={i18n('Size: medium')}
              >
                M
              </Button>
              <Button
                bsSize="small"
                className={cx({ active: isLarge })}
                onClick={() => actions.setTimelineSize('large')}
                title={i18n('Size: large')}
              >
                L
              </Button>
            </ButtonGroup>
          </NavItem>
          <NavItem>
            <span className="subnav__container__label">{i18n('Scroll')}: </span>
            <ButtonGroup bsSize="small">
              <Button onClick={this.scrollLeft}>
                <Glyphicon glyph={scrollDirectionFirst} />
              </Button>
              <Button onClick={this.scrollRight}>
                <Glyphicon glyph={scrollDirectionSecond} />
              </Button>
              <Button onClick={this.scrollBeginning}>{i18n('Beginning')}</Button>
              <Button onClick={this.scrollMiddle}>{i18n('Middle')}</Button>
              <Button onClick={this.scrollEnd}>{i18n('End')}</Button>
            </ButtonGroup>
          </NavItem>
          {canSaveTemplate ? (
            <NavItem>
              <Button bsSize="small" onClick={this.startSaveAsTemplate}>
                <FaSave className="svg-save-template" /> {i18n('Save as Template')}
              </Button>
            </NavItem>
          ) : null}
          <ClearNavItem />
          <ExportNavItem fileName={file.fileName} bookId={ui.currentTimeline} />
        </Nav>
      </Navbar>
    )
  }

  renderBody() {
    const { ui, isSmall } = this.props
    if (isSmall) {
      return <TimelineTable tableRef={this.tableRef} />
    } else {
      return (
        <StickyTable
          leftColumnZ={5}
          headerZ={5}
          wrapperRef={(ref) => (this.tableRef = ref)}
          className={cx({ darkmode: ui.darkMode, vertical: ui.orientation == 'vertical' })}
        >
          {this.state.mounted ? <TimelineTable tableRef={this.tableRef} /> : <FunSpinner />}
        </StickyTable>
      )
    }
  }

  closeDialog = () => {
    this.props.actions.closeAttributesDialog()
  }

  renderCustomAttributes() {
    if (!this.props.ui.attributesDialogIsOpen) return null

    return <CustomAttributeModal type="scenes" closeDialog={this.closeDialog} />
  }

  render() {
    const { ui } = this.props
    return (
      <div
        id="timelineview__container"
        className={cx('container-with-sub-nav', { darkmode: ui.darkMode })}
      >
        {this.renderSubNav()}
        {this.renderCustomAttributes()}
        <div id="timelineview__root">{this.renderBody()}</div>
      </div>
    )
  }
}

TimelineWrapper.propTypes = {
  file: PropTypes.object.isRequired,
  ui: PropTypes.object.isRequired,
  isSmall: PropTypes.bool,
  isMedium: PropTypes.bool,
  isLarge: PropTypes.bool,
  filterIsEmpty: PropTypes.bool.isRequired,
  canSaveTemplate: PropTypes.bool.isRequired,
  actions: PropTypes.object.isRequired,
}

function mapStateToProps(state) {
  return {
    file: state.present.file,
    ui: state.present.ui,
    filterIsEmpty: selectors.timelineFilterIsEmptySelector(state.present),
    canSaveTemplate: selectors.currentTimelineSelector(state.present) == 1,
    isSmall: selectors.isSmallSelector(state.present),
    isMedium: selectors.isMediumSelector(state.present),
    isLarge: selectors.isLargeSelector(state.present),
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(actions.ui, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TimelineWrapper)
