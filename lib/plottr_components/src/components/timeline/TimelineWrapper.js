import React, { useEffect, useState, useRef } from 'react'
import PropTypes from 'react-proptypes'
import { Nav, NavItem, Alert, Dropdown, MenuItem } from 'react-bootstrap'
import { StickyTable } from 'react-sticky-table'
import cx from 'classnames'
import { VscSymbolStructure } from 'react-icons/vsc'

import { t } from 'plottr_locales'
import { helpers } from 'pltr/v2'

import ButtonGroup from '../ButtonGroup'
import Popover from '../Popover'
import Glyphicon from '../Glyphicon'
import Button from '../Button'
import UnconnectedOverlayTrigger from '../OverlayTrigger'
import UnconnectedTimelineTable from './TimelineTable'
import UnconnectedActsConfigModal from '../dialogs/ActsConfigModal'
import UnconnectedCustomAttributeModal from '../dialogs/CustomAttributeModal'
import DeleteConfirmModal from '../dialogs/DeleteConfirmModal'
import UnconnectedCustomAttrFilterList from '../CustomAttrFilterList'
import UnconnectedExportNavItem from '../export/ExportNavItem'
import { FunSpinner } from '../Spinner'
import UnconnectedSubNav from '../containers/SubNav'
import { checkDependencies } from '../checkDependencies'

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
  const OverlayTrigger = UnconnectedOverlayTrigger(connector)

  const {
    platform: { mpq, exportDisabled, templatesDisabled },
  } = connector
  const saveAsTemplate = connector.platform.template.startSaveAsTemplate
  checkDependencies({ mpq, exportDisabled, templatesDisabled, saveAsTemplate })

  const TimelineWrapper = ({
    timelineBundle,
    bookId,
    tour,
    tourActions,
    cardsExistOnTimeline,
    actions,
    featureFlags,
  }) => {
    const [mounted, setMounted] = useState(false)
    const [beatConfigIsOpen, setBeatConfigIsOpen] = useState(false)
    const [clearing, setClearing] = useState(false)
    const [isSmallerThanToolbar, setIsSmallerThanToolbar] = useState(false)

    const scrollTimeoutRef = useRef(null)
    const tableRef = useRef(null)

    useEffect(() => {
      if (timelineBundle.isSmall) return

      if (tableRef.current) tableRef.current.onscroll = scrollHandler

      setTimeout(() => {
        setMounted(true)
        if (timelineBundle.timelineScrollPosition == null) return
        if (tableRef.current) {
          tableRef.current.scrollTo({
            top: timelineBundle.timelineScrollPosition.y,
            left: timelineBundle.timelineScrollPosition.x,
            behavior: 'auto',
          })
        }
      }, 10)

      window.addEventListener('resize', handleResize)
      if (window.innerWidth < BREAKPOINT) setIsSmallerThanToolbar(true)
    }, [])

    useEffect(() => {
      setMounted(false)
      setTimeout(() => setMounted(true), 10)
    }, [timelineBundle.currentTimeline, timelineBundle.orientation, timelineBundle.timelineSize])

    useEffect(() => {
      if (mounted) {
        if (timelineBundle.timelineScrollPosition == null) return
        if (tableRef.current) {
          tableRef.current.scrollTo({
            top: timelineBundle.timelineScrollPosition.y,
            left: timelineBundle.timelineScrollPosition.x,
            behavior: 'auto',
          })
        }
      }
    }, [mounted])

    useEffect(() => {
      return () => {
        window.removeEventListener('resize', handleResize)
        if (tableRef.current) {
          tableRef.current.onScroll = null
          tableRef.current = null
        }
      }
    }, [])

    const handleResize = () => {
      setIsSmallerThanToolbar(window.innerWidth < BREAKPOINT)
    }

    const clearTimeline = (e) => {
      e.stopPropagation()
      setClearing(false)
      actions.resetTimeline(bookId)
    }

    // ////////////////
    //  hierarchies  //
    // ////////////////

    const closeBeatConfig = () => {
      setBeatConfigIsOpen(false)
      if (tour.run && tour.stepIndex === 4) tourActions.tourNext('next')
    }

    const openBeatConfig = () => {
      setBeatConfigIsOpen(true)
      if (tour.run && tour.stepIndex === 0) tourActions.tourNext('next')
    }

    // ///////////////
    //  attributes  //
    // ///////////////

    const openCustomAttributesDialog = () => {
      actions.openAttributesDialog()
    }

    // //////////////
    //  filtering  //
    // //////////////

    const clearFilter = () => {
      actions.setTimelineFilter({ tag: [], character: [], place: [], color: [] })
    }

    // //////////////
    //  scrolling  //
    // //////////////

    const scrollTo = (position) => {
      const options = {
        behavior: 'smooth',
      }

      if (timelineBundle.orientation === 'vertical') {
        options.top = position
      } else {
        options.left = position
      }

      const ref = timelineBundle.isSmall ? tableRef.current.parentElement : tableRef.current

      ref.scrollTo(options)
    }

    const scrollDistance = () => {
      return timelineBundle?.orientation === 'vertical'
        ? 2 * SCENE_CELL_HEIGHT
        : 2 * SCENE_CELL_WIDTH
    }

    const scrollLeft = () => {
      if (!tableRef.current) return
      mpq.push('btn_scroll_left')
      const current =
        timelineBundle?.orientation === 'vertical'
          ? tableRef.current.scrollTop
          : tableRef.current.scrollLeft
      scrollTo(current - scrollDistance())
    }

    const scrollRight = () => {
      if (!tableRef.current) return
      mpq.push('btn_scroll_right')
      const current =
        timelineBundle?.orientation === 'vertical'
          ? tableRef.current.scrollTop
          : tableRef.current.scrollLeft
      scrollTo(current + scrollDistance())
    }

    const scrollBeginning = () => {
      mpq.push('btn_scroll_beginning')
      scrollTo(0)
    }

    const scrollMiddle = () => {
      if (!tableRef.current) return
      mpq.push('btn_scroll_middle')
      const target =
        timelineBundle?.orientation === 'vertical'
          ? tableRef.current.scrollHeight / 2 - window.innerHeight / 2
          : tableRef.current.scrollWidth / 2 - window.innerWidth / 2
      scrollTo(target)
    }

    const scrollEnd = () => {
      mpq.push('btn_scroll_end')
      const target =
        timelineBundle.orientation === 'vertical'
          ? tableRef.current.scrollHeight
          : tableRef.current.scrollWidth

      if (tableRef.current) scrollTo(target)
    }

    const scrollHandler = (e) => {
      const position = {
        x: e.currentTarget.scrollLeft,
        y: e.currentTarget.scrollTop,
      }
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
      scrollTimeoutRef.current = setTimeout(() => {
        actions.recordScrollPosition(position)
      }, 500)
    }

    // ////////
    // flip  //
    // ////////

    const flipOrientation = () => {
      let orientation = timelineBundle.orientation === 'horizontal' ? 'vertical' : 'horizontal'
      actions.changeOrientation(orientation)
    }

    // ///////////////
    //  exporting   //
    // //////////////

    const startSaveAsTemplate = () => {
      if (cardsExistOnTimeline) saveAsTemplate('plotlines')

      return false
    }

    // ///////////////
    //  rendering   //
    // //////////////

    const renderDelete = () => {
      if (!clearing) return null

      const text = t('Are you sure you want to clear everything in this timeline?')
      return (
        <DeleteConfirmModal
          onDelete={clearTimeline}
          onCancel={() => setClearing(false)}
          customText={text}
          notSubmit
        />
      )
    }

    const renderSubNav = () => {
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
        <Alert onClick={clearFilter} bsStyle="warning">
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
          <Button bsSize="small" onClick={openBeatConfig} className="acts-tour-step1">
            <VscSymbolStructure
              size={16}
              style={{ verticalAlign: 'text-bottom', marginRight: '4px' }}
            />
            {t('Structure')}
          </Button>
        </NavItem>,
        <NavItem key="right-2">
          <Dropdown id="moar-dropdown">
            <Dropdown.Toggle noCaret bsSize="small">
              <Glyphicon glyph="option-vertical" />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <MenuItem
                disabled={
                  !cardsExistOnTimeline ||
                  templatesDisabled ||
                  helpers.featureFlags.beatHierarchyIsOn(featureFlags)
                }
                onSelect={startSaveAsTemplate}
              >
                {t('Save as Template')}
              </MenuItem>
              <MenuItem divider />
              <MenuItem onSelect={() => setClearing(true)}>{t('Clear Timeline')}</MenuItem>
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
              <Button bsSize="small" onClick={flipOrientation}>
                <Glyphicon glyph={glyph} /> {t('Flip')}
              </Button>
            </NavItem>
            <NavItem>
              <Button bsSize="small" onClick={openCustomAttributesDialog}>
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
                <Button onClick={scrollLeft}>
                  <Glyphicon glyph={scrollDirectionFirst} />
                </Button>
                <Button onClick={scrollRight}>
                  <Glyphicon glyph={scrollDirectionSecond} />
                </Button>
                <Button onClick={scrollBeginning}>{t('Beginning')}</Button>
                <Button onClick={scrollMiddle}>{t('Middle')}</Button>
                <Button onClick={scrollEnd}>{t('End')}</Button>
              </ButtonGroup>
            </NavItem>
            {!exportDisabled && <ExportNavItem />}
            {isSmallerThanToolbar ? rightItems : null}
          </Nav>
          {!isSmallerThanToolbar ? <Nav pullRight>{rightItems}</Nav> : null}
        </SubNav>
      )
    }

    const renderBody = () => {
      if (timelineBundle.isSmall) {
        return (
          <TimelineTable
            setTableRef={(ref) => {
              tableRef.current = ref
            }}
            tableRef={tableRef.current}
          />
        )
      } else {
        return (
          <StickyTable
            leftColumnZ={5}
            headerZ={5}
            wrapperRef={(ref) => (tableRef.current = ref)}
            className={cx({
              darkmode: timelineBundle.darkMode,
              vertical: timelineBundle.orientation == 'vertical',
            })}
          >
            {mounted ? <TimelineTable tableRef={tableRef.current} /> : <FunSpinner />}
          </StickyTable>
        )
      }
    }

    const closeCustomAttributesDialog = () => {
      actions.closeAttributesDialog()
    }

    const renderCustomAttributes = () => {
      if (!timelineBundle.attributesDialogIsOpen) return null

      return <CustomAttributeModal type="scenes" closeDialog={closeCustomAttributesDialog} />
    }

    const renderBeatConfig = () => {
      if (!beatConfigIsOpen) return null

      return <ActsConfigModal isDarkMode={timelineBundle.darkMode} closeDialog={closeBeatConfig} />
    }

    return (
      <div
        id="timelineview__container"
        className={cx('container-with-sub-nav', { darkmode: timelineBundle.darkMode })}
      >
        {renderSubNav()}
        {renderCustomAttributes()}
        {renderBeatConfig()}
        {renderDelete()}
        <div id="timelineview__root" className="tab-body">
          {renderBody()}
        </div>
      </div>
    )
  }

  TimelineWrapper.propTypes = {
    cardsExistOnTimeline: PropTypes.bool,
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
  checkDependencies({ redux, selectors, actions })

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(
      (state) => {
        return {
          cardsExistOnTimeline: selectors.cardsExistOnTimelineSelector(state.present),
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
