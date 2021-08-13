import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import {
  Nav,
  NavItem,
  Button,
  ButtonGroup,
  Glyphicon,
  Popover,
  Alert,
  Dropdown,
  MenuItem,
} from 'react-bootstrap'
import { StickyTable } from 'react-sticky-table'
import { t } from 'plottr_locales'
import cx from 'classnames'
import OverlayTrigger from '../OverlayTrigger'
import UnconnectedTimelineTable from './TimelineTable'
import UnconnectedActsConfigModal from '../dialogs/ActsConfigModal'
import UnconnectedCustomAttributeModal from '../dialogs/CustomAttributeModal'
import DeleteConfirmModal from '../dialogs/DeleteConfirmModal'
import UnconnectedCustomAttrFilterList from '../CustomAttrFilterList'
import UnconnectedExportNavItem from '../export/ExportNavItem'
import { FunSpinner } from '../Spinner'
import UnconnectedSubNav from '../containers/SubNav'
import { helpers } from 'pltr/v2'

const BREAKPOINT = 890

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

  const {
    platform: { mpq, exportDisabled, templatesDisabled },
  } = connector
  const saveAsTemplate = connector.platform.template.startSaveAsTemplate

  class TimelineWrapper extends Component {
    constructor(props) {
      super(props)
      this.state = {
        mounted: false,
        beatConfigIsOpen: false,
        clearing: false,
        isSmallerThanToolbar: false,
      }
      // TODO: refactor this to use createRef
      this.tableRef = null
    }

    componentDidMount() {
      if (this.props.timelineBundle.isSmall) return

      if (this.tableRef) this.tableRef.onscroll = this.scrollHandler

      setTimeout(() => {
        this.setState({ mounted: true }, () => {
          if (this.props.timelineBundle.timelineScrollPosition == null) return
          if (this.tableRef) {
            this.tableRef.scrollTo({
              top: this.props.timelineBundle.timelineScrollPosition.y,
              left: this.props.timelineBundle.timelineScrollPosition.x,
              behavior: 'auto',
            })
          }
        })
      }, 10)

      window.addEventListener('resize', this.handleResize)
      if (window.innerWidth < BREAKPOINT) this.setState({ isSmallerThanToolbar: true })
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
      const { timelineBundle } = this.props
      if (
        nextProps.timelineBundle.currentTimeline != timelineBundle.currentTimeline ||
        nextProps.timelineBundle.orientation != timelineBundle.orientation ||
        nextProps.timelineBundle.timelineSize != timelineBundle.timelineSize
      ) {
        this.setState({ mounted: false })
        setTimeout(
          () =>
            this.setState({ mounted: true }, () => {
              if (nextProps.timelineBundle.timelineScrollPosition == null) return
              if (this.tableRef) {
                this.tableRef.scrollTo({
                  top: this.props.timelineBundle.timelineScrollPosition.y,
                  left: this.props.timelineBundle.timelineScrollPosition.x,
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
      window.removeEventListener('resize', this.handleResize)
      if (this.tableRef) {
        this.tableRef.onScroll = null
        this.tableRef = null
      }
    }

    handleResize = () => {
      this.setState({ isSmallerThanToolbar: window.innerWidth < BREAKPOINT })
    }

    clearTimeline = (e) => {
      e.stopPropagation()
      this.setState({ clearing: false })
      this.props.actions.resetTimeline(this.props.bookId)
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

      if (this.props.timelineBundle.orientation === 'vertical') {
        options.top = position
      } else {
        options.left = position
      }
      this.tableRef.scrollTo(options)
    }

    scrollDistance = () => {
      return this.props.timelineBundle.orientation === 'vertical'
        ? 2 * SCENE_CELL_HEIGHT
        : 2 * SCENE_CELL_WIDTH
    }

    scrollLeft = () => {
      mpq.push('btn_scroll_left')
      const current =
        this.props.timelineBundle.orientation === 'vertical'
          ? this.tableRef.scrollTop
          : this.tableRef.scrollLeft
      this.scrollTo(current - this.scrollDistance())
    }
    scrollRight = () => {
      mpq.push('btn_scroll_right')
      const current =
        this.props.timelineBundle.orientation === 'vertical'
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
        this.props.timelineBundle.orientation === 'vertical'
          ? this.tableRef.scrollHeight / 2 - window.innerHeight / 2
          : this.tableRef.scrollWidth / 2 - window.innerWidth / 2
      this.scrollTo(target)
    }
    scrollEnd = () => {
      mpq.push('btn_scroll_end')
      const target =
        this.props.timelineBundle.orientation === 'vertical'
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
      let orientation =
        this.props.timelineBundle.orientation === 'horizontal' ? 'vertical' : 'horizontal'
      this.props.actions.changeOrientation(orientation)
    }

    // //////////
    // expand  //
    // //////////

    toggleExpanded = () => {
      if (this.props.timelineBundle.timelineIsExpanded) {
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

    renderDelete() {
      if (!this.state.clearing) return null

      const text = t('Are you sure you want to clear everything in this timeline?')
      return (
        <DeleteConfirmModal
          onDelete={this.clearTimeline}
          onCancel={() => this.setState({ clearing: false })}
          customText={text}
          notSubmit
        />
      )
    }

    renderSubNav() {
      const { timelineBundle, actions, featureFlags } = this.props
      const { isSmallerThanToolbar } = this.state

      let glyph = 'option-vertical'
      let scrollDirectionFirst = 'menu-left'
      let scrollDirectionSecond = 'menu-right'
      if (timelineBundle.orientation === 'vertical') {
        glyph = 'option-horizontal'
        scrollDirectionFirst = 'menu-up'
        scrollDirectionSecond = 'menu-down'
      }
      const popover = () => (
        <Popover id="filter">
          <CustomAttrFilterList type="cards" showColor={true} />
        </Popover>
      )
      let filterDeclaration = (
        <Alert onClick={this.clearFilter} bsStyle="warning">
          <Glyphicon glyph="remove-sign" />
          {'  '}
          {t('Timeline is filtered')}
        </Alert>
      )
      if (timelineBundle.filterIsEmpty) {
        filterDeclaration = <span></span>
      }

      const rightItems = [
        <NavItem key="right-1">
          <Button bsSize="small" onClick={this.openBeatConfig} className="acts-tour-step1">
            <Glyphicon glyph="cog" /> {t('Settings')}
          </Button>
        </NavItem>,
        <NavItem key="right-2">
          <Dropdown id="moar-dropdown">
            <Dropdown.Toggle noCaret bsSize="small">
              <Glyphicon glyph="option-vertical" />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <MenuItem
                disabled={templatesDisabled || helpers.featureFlags.beatHierarchyIsOn(featureFlags)}
                onSelect={this.startSaveAsTemplate}
              >
                {t('Save as Template')}
              </MenuItem>
              <MenuItem divider />
              <MenuItem onSelect={() => this.setState({ clearing: true })}>
                {t('Clear Timeline')}
              </MenuItem>
            </Dropdown.Menu>
          </Dropdown>
        </NavItem>,
      ]

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
                  <Glyphicon glyph="filter" /> {t('Filter')}
                </Button>
              </OverlayTrigger>
              {filterDeclaration}
            </NavItem>
            <NavItem>
              <Button bsSize="small" onClick={this.flipOrientation}>
                <Glyphicon glyph={glyph} /> {t('Flip')}
              </Button>
            </NavItem>
            <NavItem>
              <Button bsSize="small" onClick={this.openCustomAttributesDialog}>
                <Glyphicon glyph="list" /> {t('Attributes')}
              </Button>
            </NavItem>
            <NavItem>
              <span className="subnav__container__label">{t('Zoom')}: </span>
              <ButtonGroup>
                <Button
                  bsSize="small"
                  className={cx({ active: timelineBundle.isLarge })}
                  onClick={() => actions.setTimelineSize('large')}
                  title={t('Size: large')}
                >
                  L
                </Button>
                <Button
                  bsSize="small"
                  className={cx({ active: timelineBundle.isMedium })}
                  onClick={() => actions.setTimelineSize('medium')}
                  title={t('Size: medium')}
                >
                  M
                </Button>
                <Button
                  bsSize="small"
                  className={cx({ active: timelineBundle.isSmall })}
                  onClick={() => actions.setTimelineSize('small')}
                  title={t('Size: small')}
                >
                  S
                </Button>
              </ButtonGroup>
            </NavItem>
            <NavItem>
              <span className="subnav__container__label">{t('Scroll')}: </span>
              <ButtonGroup bsSize="small">
                <Button onClick={this.scrollLeft}>
                  <Glyphicon glyph={scrollDirectionFirst} />
                </Button>
                <Button onClick={this.scrollRight}>
                  <Glyphicon glyph={scrollDirectionSecond} />
                </Button>
                <Button onClick={this.scrollBeginning}>{t('Beginning')}</Button>
                <Button onClick={this.scrollMiddle}>{t('Middle')}</Button>
                <Button onClick={this.scrollEnd}>{t('End')}</Button>
              </ButtonGroup>
            </NavItem>
            {!exportDisabled && <ExportNavItem />}
            {isSmallerThanToolbar ? rightItems : null}
          </Nav>
          {!isSmallerThanToolbar ? <Nav pullRight>{rightItems}</Nav> : null}
        </SubNav>
      )
    }

    renderBody() {
      const { timelineBundle } = this.props
      if (timelineBundle.isSmall) {
        return <TimelineTable tableRef={this.tableRef} />
      } else {
        return (
          <StickyTable
            leftColumnZ={5}
            headerZ={5}
            wrapperRef={(ref) => (this.tableRef = ref)}
            className={cx({
              darkmode: timelineBundle.darkMode,
              vertical: timelineBundle.orientation == 'vertical',
            })}
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
      if (!this.props.timelineBundle.attributesDialogIsOpen) return null

      return <CustomAttributeModal type="scenes" closeDialog={this.closeCustomAttributesDialog} />
    }

    renderBeatConfig() {
      if (!this.state.beatConfigIsOpen) return null

      return (
        <ActsConfigModal
          isDarkMode={this.props.timelineBundle.darkMode}
          closeDialog={this.closeBeatConfig}
        />
      )
    }

    render() {
      const { timelineBundle } = this.props
      return (
        <div
          id="timelineview__container"
          className={cx('container-with-sub-nav', { darkmode: timelineBundle.darkMode })}
        >
          {this.renderSubNav()}
          {this.renderCustomAttributes()}
          {this.renderBeatConfig()}
          {this.renderDelete()}
          <div id="timelineview__root" className="tab-body">
            {this.renderBody()}
          </div>
        </div>
      )
    }
  }

  TimelineWrapper.propTypes = {
    bookId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    timelineBundle: PropTypes.object.isRequired,
    featureFlags: PropTypes.object.isRequired,
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
          bookId: selectors.currentTimelineSelector(state.present),
          timelineBundle: selectors.timelineBundleSelector(state.present),
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
