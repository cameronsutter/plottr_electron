import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import {
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
import { t as i18n } from 'plottr_locales'
import UnconnectedTimelineTable from './TimelineTable'
import cx from 'classnames'
import UnconnectedActsConfigModal from '../dialogs/ActsConfigModal'
import UnconnectedCustomAttributeModal from '../dialogs/CustomAttributeModal'
import UnconnectedCustomAttrFilterList from '../CustomAttrFilterList'
import UnconnectedExportNavItem from '../export/ExportNavItem'
import { FunSpinner } from '../Spinner'
import UnconnectedSubNav from '../containers/SubNav'
import { FaSave } from 'react-icons/fa'
import { VscSymbolStructure } from 'react-icons/vsc'
import UnconnectedClearNavItem from './ClearNavItem'
import { helpers } from 'pltr/v2'

// takes into account spacing
const SCENE_CELL_WIDTH = 175 + 17
const SCENE_CELL_HEIGHT = 74 + 40

const TimelineWrapperConnector = (connector) => {
  const TimelineTable = UnconnectedTimelineTable(connector)
  const ActsConfigModal = UnconnectedActsConfigModal(connector)
  const CustomAttributeModal = UnconnectedCustomAttributeModal(connector)
  const CustomAttrFilterList = UnconnectedCustomAttrFilterList(connector)
  const ExportNavItem = UnconnectedExportNavItem(connector)
  const SubNav = UnconnectedSubNav(connector)
  const ClearNavItem = UnconnectedClearNavItem(connector)

  const {
    platform: { mpq },
  } = connector
  const saveAsTemplate = connector.platform.template.startSaveAsTemplate

  class TimelineWrapper extends Component {
    constructor(props) {
      super(props)
      this.state = {
        mounted: false,
        beatConfigIsOpen: false,
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

    UNSAFE_componentWillReceiveProps(nextProps) {
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

    // ////////////////
    //  hierarchies  //
    // ////////////////

    closeBeatConfig = () => {
      this.setState({
        beatConfigIsOpen: false,
      })
      if (this.props.tour.run && this.props.tour.stepIndex === 4)
        this.props.tourActions.tourNext('next')
    }

    openBeatConfig = () => {
      this.setState({
        beatConfigIsOpen: true,
      })
      if (this.props.tour.run && this.props.tour.stepIndex === 0)
        this.props.tourActions.tourNext('next')
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
      this.props.actions.setTimelineFilter({ tag: [], character: [], place: [], color: [] })
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
      mpq.push('btn_scroll_left')
      const current =
        this.props.ui.orientation === 'vertical'
          ? this.tableRef.scrollTop
          : this.tableRef.scrollLeft
      this.scrollTo(current - this.scrollDistance())
    }
    scrollRight = () => {
      mpq.push('btn_scroll_right')
      const current =
        this.props.ui.orientation === 'vertical'
          ? this.tableRef.scrollTop
          : this.tableRef.scrollLeft
      this.scrollTo(current + this.scrollDistance())
    }
    scrollBeginning = () => {
      mpq.push('btn_scroll_beginning')
      this.scrollTo(0)
    }
    scrollMiddle = () => {
      mpq.push('btn_scroll_middle')
      const target =
        this.props.ui.orientation === 'vertical'
          ? this.tableRef.scrollHeight / 2 - window.innerHeight / 2
          : this.tableRef.scrollWidth / 2 - window.innerWidth / 2
      this.scrollTo(target)
    }
    scrollEnd = () => {
      mpq.push('btn_scroll_end')
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
      saveAsTemplate('plotlines')
    }

    // ///////////////
    //  rendering   //
    // //////////////

    renderSubNav() {
      const { ui, filterIsEmpty, featureFlags, isSmall, isMedium, isLarge, actions } = this.props
      const gatedByBeatHierarchy = helpers.featureFlags.gatedByBeatHierarchy(featureFlags)

      let glyph = 'option-vertical'
      let scrollDirectionFirst = 'menu-left'
      let scrollDirectionSecond = 'menu-right'
      if (ui.orientation === 'vertical') {
        glyph = 'option-horizontal'
        scrollDirectionFirst = 'menu-up'
        scrollDirectionSecond = 'menu-down'
      }
      let popover = (
        <Popover id="filter">
          <CustomAttrFilterList type="cards" showColor={true} />
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
            {gatedByBeatHierarchy(() => (
              <NavItem>
                <Button bsSize="small" onClick={this.openBeatConfig} className="acts-tour-step1">
                  <VscSymbolStructure
                    size={16}
                    style={{ verticalAlign: 'text-bottom', marginRight: '4px' }}
                  />
                  {i18n('Structure')}
                </Button>
              </NavItem>
            ))}
            <NavItem>
              <span className="subnav__container__label">{i18n('Zoom')}: </span>
              <ButtonGroup>
                <Button
                  bsSize="small"
                  className={cx({ active: isLarge })}
                  onClick={() => actions.setTimelineSize('large')}
                  title={i18n('Size: large')}
                >
                  L
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
                  className={cx({ active: isSmall })}
                  onClick={() => actions.setTimelineSize('small')}
                  title={i18n('Size: small')}
                >
                  S
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
            <NavItem>
              <Button bsSize="small" onClick={this.startSaveAsTemplate}>
                <FaSave className="svg-save-template" /> {i18n('Save as Template')}
              </Button>
            </NavItem>
            <ClearNavItem />
            <ExportNavItem />
          </Nav>
        </SubNav>
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
            {this.state.mounted ? (
              <TimelineTable
                tableRef={this.tableRef}
                scrollTo={(position) => this.scrollTo(position)}
              />
            ) : (
              <FunSpinner />
            )}
          </StickyTable>
        )
      }
    }

    closeCustomAttributesDialog = () => {
      this.props.actions.closeAttributesDialog()
    }

    renderCustomAttributes() {
      if (!this.props.ui.attributesDialogIsOpen) return null

      return <CustomAttributeModal type="scenes" closeDialog={this.closeCustomAttributesDialog} />
    }

    renderBeatConfig() {
      return helpers.featureFlags.gatedByBeatHierarchy(this.props.featureFlags)(() => {
        if (!this.state.beatConfigIsOpen) return null

        return <ActsConfigModal closeDialog={this.closeBeatConfig} />
      })
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
          {this.renderBeatConfig()}
          <div id="timelineview__root" className="tab-body">
            {this.renderBody()}
          </div>
        </div>
      )
    }
  }

  TimelineWrapper.propTypes = {
    ui: PropTypes.object.isRequired,
    isSmall: PropTypes.bool,
    isMedium: PropTypes.bool,
    isLarge: PropTypes.bool,
    featureFlags: PropTypes.object.isRequired,
    filterIsEmpty: PropTypes.bool.isRequired,
    actions: PropTypes.object.isRequired,
    tourActions: PropTypes.object.isRequired,
    tour: PropTypes.object.isRequired,
  }

  const {
    redux,
    pltr: { selectors, actions },
  } = connector

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(
      (state) => {
        return {
          ui: state.present.ui,
          filterIsEmpty: selectors.timelineFilterIsEmptySelector(state.present),
          isSmall: selectors.isSmallSelector(state.present),
          isMedium: selectors.isMediumSelector(state.present),
          isLarge: selectors.isLargeSelector(state.present),
          featureFlags: selectors.featureFlags(state.present),
          tour: selectors.tourSelector(state.present),
        }
      },
      (dispatch) => {
        return {
          actions: bindActionCreators(actions.ui, dispatch),
          tourActions: bindActionCreators(actions.tour, dispatch),
        }
      }
    )(TimelineWrapper)
  }

  throw new Error('Could not connect TimelineWrapper')
}

export default TimelineWrapperConnector
