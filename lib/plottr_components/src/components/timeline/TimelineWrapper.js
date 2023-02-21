import React, { useEffect, useState, useRef } from 'react'
import PropTypes from 'react-proptypes'
import { StickyTable } from 'react-sticky-table'
import cx from 'classnames'
import { VscSymbolStructure } from 'react-icons/vsc'
import { CgArrowLongRight, CgArrowLongDown } from 'react-icons/cg'
import {
  HiOutlineChevronDoubleRight,
  HiOutlineChevronDoubleLeft,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineChevronUp,
  HiOutlineChevronDown,
  HiOutlineChevronDoubleDown,
  HiOutlineChevronDoubleUp,
} from 'react-icons/hi'

import { t } from 'plottr_locales'
import { helpers } from 'pltr/v2'

import UnconnectedPlottrFloater from '../PlottrFloater'
import Popover from '../PlottrPopover'
import MenuItem from '../MenuItem'
import Dropdown from '../Dropdown'
import Alert from '../Alert'
import NavItem from '../NavItem'
import Nav from '../Nav'
import ButtonGroup from '../ButtonGroup'
import Glyphicon from '../Glyphicon'
import Button from '../Button'
import FormControl from '../FormControl'
import UnconnectedTimelineTable from './TimelineTable'
import UnconnectedActsConfigModal from '../dialogs/ActsConfigModal'
import UnconnectedCustomAttributeModal from '../dialogs/CustomAttributeModal'
import DeleteConfirmModal from '../dialogs/DeleteConfirmModal'
import UnconnectedCustomAttrFilterList from '../CustomAttrFilterList'
import UnconnectedExportNavItem from '../export/ExportNavItem'
import { FunSpinner } from '../Spinner'
import UnconnectedSubNav from '../containers/SubNav'
import { checkDependencies } from '../checkDependencies'
import { withEventTargetValue } from '../withEventTargetValue'
import Scrollable from '../../utils/scrollable'
import UnconnectedCardDialog from './CardDialog'
import UnconnectedTimelineTabs from './TimelineTabs'
import DropdownButton from '../DropdownButton'
import ToolTip from '../ToolTip'

const BREAKPOINT = 890

// takes into account spacing
const SCENE_CELL_WIDTH = 175 + 17
const SCENE_CELL_HEIGHT = 74 + 40

const TimelineWrapperConnector = (connector) => {
  const Floater = UnconnectedPlottrFloater(connector)
  const TimelineTable = UnconnectedTimelineTable(connector)
  const ActsConfigModal = UnconnectedActsConfigModal(connector)
  const CustomAttributeModal = UnconnectedCustomAttributeModal(connector)
  const CustomAttrFilterList = UnconnectedCustomAttrFilterList(connector)
  const ExportNavItem = UnconnectedExportNavItem(connector)
  const SubNav = UnconnectedSubNav(connector)
  const CardDialog = UnconnectedCardDialog(connector)
  const TimelineTabs = UnconnectedTimelineTabs(connector)

  const {
    platform: {
      file: { saveFile },
      mpq,
      exportDisabled,
      templatesDisabled,
    },
  } = connector
  const saveAsTemplate = connector.platform.template.startSaveAsTemplate
  checkDependencies({ saveFile, mpq, exportDisabled, templatesDisabled, saveAsTemplate })

  const TimelineWrapper = ({
    timelineBundle,
    bookId,
    cardsExistOnTimeline,
    actions,
    testingAndDiagnosisEnabled,
    projectActions,
    isOnWeb,
    timelineSearchTerm,
    timelineView,
    timelineTabs,
    activeTab,
    timelineViewIsStacked,
    timelineViewIsTabbed,
    hierarchyLevels,
    topLevelBeatName,
    beatActions,
    isCardDialogVisible,
    cardDialogBeatId,
    cardDialogCardId,
    cardDialogLineId,
    actConfigIsOpen,
    stickyHeaderCount,
    stickyLeftColumnCount,
  }) => {
    const [mounted, setMounted] = useState(false)
    const [clearing, setClearing] = useState(false)
    const [isSmallerThanToolbar, setIsSmallerThanToolbar] = useState(false)
    const [filterIsOpen, setFilterIsOpen] = useState(false)

    const scrollTimeoutRef = useRef(null)
    const tableRef = useRef(null)
    const scrollableRef = useRef(
      new Scrollable(() => {
        return timelineBundle.isSmall ? tableRef.current.parentElement : tableRef.current
      })
    )

    useEffect(() => {
      if (tableRef.current) tableRef.current.onscroll = scrollHandler

      setTimeout(() => {
        setMounted(true)
        if (timelineBundle.timelineScrollPosition == null) return
        if (tableRef.current) {
          scrollableRef.current.scrollTo(
            timelineBundle.timelineScrollPosition.x,
            timelineBundle.timelineScrollPosition.y,
            true
          )
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
          scrollableRef.current.scrollTo(
            timelineBundle.timelineScrollPosition.x,
            timelineBundle.timelineScrollPosition.y,
            true
          )
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
    //   Searching   //
    // ////////////////

    const insertSpace = (event) => {
      const currentValue = event.target.value
      const start = event.target.selectionStart
      const end = event.target.selectionEnd
      if (event.key === ' ') {
        actions.setTimelineSearchTerm(
          currentValue.slice(0, start) + ' ' + currentValue.slice(end + 1)
        )
      }
      event.preventDefault()
      event.stopPropagation()
    }

    // ////////////////
    //  Stress Test  //
    // ////////////////

    const spamSave = () => {
      for (let i = 0; i < 1000; ++i) {
        projectActions.withFullFileState((state) => {
          // FIXME: this is dated, but we don't need it so much so I
          // left it untouched when doing the knownFiles refactor.
          saveFile(helpers.file.filePathToFileURL(state.present.file.fileName), state.present)
        })
      }
    }

    // ////////////////
    //  hierarchies  //
    // ////////////////

    const closeBeatConfig = () => {
      actions.setActConfigIsOpen(false)
    }

    const openBeatConfig = () => {
      actions.setActConfigIsOpen(true)
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
      const options = {}

      if (timelineBundle.orientation === 'vertical') {
        options.top = position
      } else {
        options.left = position
      }

      scrollableRef.current.scrollTo(options.left, options.top)
    }

    const scrollBy = (position) => {
      const options = {}

      if (timelineBundle.orientation === 'vertical') {
        options.top = position
      } else {
        options.left = position
      }

      scrollableRef.current.scrollBy(options.left, options.top)
    }

    const scrollDistance = () => {
      return timelineBundle?.orientation === 'vertical'
        ? 2 * SCENE_CELL_HEIGHT
        : 2 * SCENE_CELL_WIDTH
    }

    const scrollLeft = () => {
      if (!tableRef.current) return
      // mpq.push('btn_scroll_left')
      scrollBy(-scrollDistance())
    }

    const scrollRight = () => {
      if (!tableRef.current) return
      // mpq.push('btn_scroll_right')
      scrollBy(scrollDistance())
    }

    const scrollBeginning = () => {
      // mpq.push('btn_scroll_beginning')
      scrollTo(0)
    }

    const scrollMiddle = () => {
      if (!tableRef.current) return
      // mpq.push('btn_scroll_middle')
      const element = timelineBundle.isSmall ? tableRef.current.parentElement : tableRef.current
      const target =
        timelineBundle?.orientation === 'vertical'
          ? element.scrollHeight / 2 - window.innerHeight / 2
          : element.scrollWidth / 2 - window.innerWidth / 2
      scrollTo(target)
    }

    const scrollEnd = () => {
      // mpq.push('btn_scroll_end')
      const element = timelineBundle.isSmall ? tableRef.current.parentElement : tableRef.current
      const target =
        timelineBundle.orientation === 'vertical' ? element.scrollHeight : element.scrollWidth

      if (tableRef.current) scrollTo(target)
    }

    const scrollHandler = (e) => {
      const position = {
        x: e.currentTarget.scrollLeft,
        y: e.currentTarget.scrollTop,
      }
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
      scrollTimeoutRef.current = setTimeout(() => {
        actions.recordTimelineScrollPosition(position)
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
      let glyph = <CgArrowLongDown style={{ marginBottom: -2, marginRight: -2 }} />
      let scrollDirectionFirst = <HiOutlineChevronLeft style={{ marginBottom: -2 }} />
      let scrollDirectionFirstEnd = <HiOutlineChevronDoubleLeft style={{ marginBottom: -2 }} />
      let scrollDirectionSecond = <HiOutlineChevronRight style={{ marginBottom: -2 }} />
      let scrollDirectionSecondEnd = <HiOutlineChevronDoubleRight style={{ marginBottom: -2 }} />
      if (timelineBundle.orientation === 'vertical') {
        glyph = <CgArrowLongRight style={{ marginBottom: -2 }} />
        scrollDirectionFirst = <HiOutlineChevronUp style={{ marginBottom: -2 }} />
        scrollDirectionFirstEnd = <HiOutlineChevronDoubleUp style={{ marginBottom: -2 }} />
        scrollDirectionSecond = <HiOutlineChevronDown style={{ marginBottom: -2 }} />
        scrollDirectionSecondEnd = <HiOutlineChevronDoubleDown style={{ marginBottom: -2 }} />
      }
      const renderPopover = () => (
        <Popover id="filter" noMaxWidth>
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
          <Button bsSize="small" onClick={openBeatConfig}>
            <VscSymbolStructure
              size={16}
              style={{ verticalAlign: 'text-bottom', marginRight: '4px' }}
            />
            {t('Structure')}
          </Button>
        </NavItem>,
        exportDisabled ? null : (
          <React.Fragment key="export-nav-item">
            <ExportNavItem noLabel />
          </React.Fragment>
        ),
        <NavItem key="right-2">
          <Dropdown id="moar-dropdown">
            <Dropdown.Toggle noCaret bsSize="small">
              <Glyphicon glyph="option-vertical" />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <MenuItem onSelect={startSaveAsTemplate}>{t('Save as Template')}</MenuItem>
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
              <Floater
                positionLeftMost
                open={filterIsOpen}
                placement="bottom"
                component={renderPopover}
                onClose={() => {
                  setFilterIsOpen(false)
                }}
                rootClose
              >
                <Button
                  bsSize="small"
                  onClick={() => {
                    setFilterIsOpen(!filterIsOpen)
                  }}
                >
                  <Glyphicon glyph="filter" /> {t('Filter')}
                </Button>
              </Floater>
              {filterDeclaration}
            </NavItem>
            <NavItem>
              <Button bsSize="small" onClick={openCustomAttributesDialog}>
                <Glyphicon glyph="list" /> {t('Attributes')}
              </Button>
            </NavItem>
            <NavItem>
              {timelineViewIsStacked && !timelineBundle.isSmall ? (
                <ToolTip id="flip-tooltip" text={t("Stacked view can't be flipped.")}>
                  <Button bsSize="small" className="disabled">
                    {glyph} {t('Flip')}
                  </Button>
                </ToolTip>
              ) : (
                <Button bsSize="small" onClick={flipOrientation}>
                  {glyph} {t('Flip')}
                </Button>
              )}
            </NavItem>
            <NavItem>
              <DropdownButton
                id="select-timeline-view"
                className="toolbar__selecet_view"
                title={hierarchyLevels.length < 2 ? 'Default' : timelineView}
              >
                <MenuItem key={'default'} onSelect={() => actions.setTimelineView('default')}>
                  <div className="toolbar__timeline-view-selector">{t('Default')}</div>
                </MenuItem>
                {hierarchyLevels.length > 1 ? (
                  <MenuItem
                    disabled={hierarchyLevels.length < 2}
                    key={'tabbed'}
                    onSelect={() => actions.setTimelineView('tabbed')}
                    title={
                      hierarchyLevels.length < 2
                        ? t('At least two levels of hierarchy required to view as tabs')
                        : t('View timeline ith tabs for the highest level')
                    }
                  >
                    <div className="toolbar__timeline-view-selector">{t('Tabbed')}</div>
                  </MenuItem>
                ) : null}
                {hierarchyLevels.length > 1 ? (
                  <MenuItem key={'stacked'} onSelect={() => actions.setTimelineView('stacked')}>
                    <div className="toolbar__timeline-view-selector">{t('Stacked')}</div>
                  </MenuItem>
                ) : null}
              </DropdownButton>
            </NavItem>
            <NavItem>
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
              <ButtonGroup bsSize="small">
                <Button onClick={scrollBeginning}>{scrollDirectionFirstEnd}</Button>
                <Button onClick={scrollLeft}>{scrollDirectionFirst}</Button>
                <Button onClick={scrollMiddle}>{t('Mid')}</Button>
                <Button onClick={scrollRight}>{scrollDirectionSecond}</Button>
                <Button onClick={scrollEnd}>{scrollDirectionSecondEnd}</Button>
              </ButtonGroup>
            </NavItem>
            {testingAndDiagnosisEnabled ? (
              <NavItem key="testing-utilities">
                <Dropdown id="moar-dropdown">
                  <Dropdown.Toggle noCaret bsSize="small">
                    <Glyphicon glyph="option-vertical" /> {t('Testing utilities')}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <MenuItem disabled={isOnWeb} onSelect={spamSave}>
                      {t('Stress test saving')}
                    </MenuItem>
                  </Dropdown.Menu>
                </Dropdown>
              </NavItem>
            ) : null}
            <NavItem draggable="false">
              <FormControl
                onChange={withEventTargetValue(actions.setTimelineSearchTerm)}
                onKeyUp={insertSpace}
                value={timelineSearchTerm || ''}
                type="text"
                placeholder="Search"
                className="toolbar__search"
              />
            </NavItem>
            {isSmallerThanToolbar ? rightItems : null}
          </Nav>
          {!isSmallerThanToolbar ? <Nav pullRight>{rightItems}</Nav> : null}
        </SubNav>
      )
    }

    const closeDialog = () => {
      actions.setCardDialogClose()
    }

    const renderCardDialog = () => {
      if (isCardDialogVisible) {
        return (
          <CardDialog
            cardId={cardDialogCardId}
            beatId={cardDialogBeatId}
            lineId={cardDialogLineId}
            closeDialog={closeDialog}
          />
        )
      }
      return null
    }

    const setTableRef = (ref) => {
      tableRef.current = ref
    }

    const renderBody = () => {
      if (timelineBundle.isSmall) {
        if (timelineView === 'tabbed') {
          return (
            <TimelineTabs
              TableComponent={() => (
                <TimelineTable
                  setTableRef={setTableRef}
                  tableRef={tableRef.current}
                  activeTab={activeTab}
                />
              )}
            />
          )
        } else {
          return (
            <TimelineTable
              setTableRef={(ref) => {
                tableRef.current = ref
              }}
              tableRef={tableRef.current}
              activeTab={activeTab}
            />
          )
        }
      } else {
        if (timelineView === 'tabbed') {
          return (
            <TimelineTabs
              TableComponent={() => (
                <StickyTable
                  leftColumnZ={5}
                  headerZ={5}
                  wrapperRef={(ref) => (tableRef.current = ref)}
                  className={cx({
                    darkmode: timelineBundle.darkMode,
                    vertical: timelineBundle.orientation == 'vertical',
                  })}
                >
                  {mounted ? (
                    <TimelineTable activeTab={activeTab} tableRef={tableRef.current} />
                  ) : (
                    <FunSpinner />
                  )}
                </StickyTable>
              )}
            />
          )
        } else {
          return (
            <StickyTable
              leftColumnZ={5}
              headerZ={5}
              wrapperRef={(ref) => (tableRef.current = ref)}
              stickyHeaderCount={stickyHeaderCount}
              leftStickyColumnCount={stickyLeftColumnCount}
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
    }

    const closeCustomAttributesDialog = () => {
      actions.closeAttributesDialog()
    }

    const renderCustomAttributes = () => {
      if (!timelineBundle.attributesDialogIsOpen) return null

      return <CustomAttributeModal type="scenes" closeDialog={closeCustomAttributesDialog} />
    }

    const renderBeatConfig = () => {
      if (!actConfigIsOpen) return null

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
        {renderCardDialog()}
        <div
          id="timelineview__root"
          className={cx('tab-body', { 'timeline-tabbed-view-body': timelineViewIsTabbed })}
        >
          {renderBody()}
        </div>
      </div>
    )
  }

  TimelineWrapper.propTypes = {
    cardsExistOnTimeline: PropTypes.bool,
    bookId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    timelineBundle: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    testingAndDiagnosisEnabled: PropTypes.bool,
    projectActions: PropTypes.object.isRequired,
    isOnWeb: PropTypes.bool,
    timelineSearchTerm: PropTypes.string,
    timelineView: PropTypes.string.isRequired,
    timelineTabs: PropTypes.array.isRequired,
    timelineViewIsStacked: PropTypes.bool,
    timelineViewIsTabbed: PropTypes.bool,
    hierarchyLevels: PropTypes.array.isRequired,
    topLevelBeatName: PropTypes.string.isRequired,
    beatActions: PropTypes.object.isRequired,
    cardDialogCardId: PropTypes.number,
    cardDialogLineId: PropTypes.number,
    cardDialogBeatId: PropTypes.number,
    isCardDialogVisible: PropTypes.bool,
    activeTab: PropTypes.number.isRequired,
    actConfigIsOpen: PropTypes.bool,
    stickyHeaderCount: PropTypes.number,
    stickyLeftColumnCount: PropTypes.number,
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
          testingAndDiagnosisEnabled: selectors.testingAndDiagnosisEnabledSelector(state.present),
          isOnWeb: selectors.isOnWebSelector(state.present),
          timelineSearchTerm: selectors.timelineSearchTermSelector(state.present),
          timelineView: selectors.timelineViewSelector(state.present),
          timelineViewIsStacked: selectors.timelineViewIsStackedSelector(state.present),
          timelineViewIsTabbed: selectors.timelineViewIsTabbedSelector(state.present),
          hierarchyLevels: selectors.sortedHierarchyLevels(state.present),
          cardDialogCardId: selectors.cardDialogCardIdSelector(state.present),
          cardDialogLineId: selectors.cardDialogLineIdSelector(state.present),
          cardDialogBeatId: selectors.cardDialogBeatIdSelector(state.present),
          isCardDialogVisible: selectors.isCardDialogVisibleSelector(state.present),
          activeTab: selectors.timelineActiveTabSelector(state.present),
          actConfigIsOpen: selectors.actConfigModalIsOpenSelector(state.present),
          stickyHeaderCount: selectors.stickyHeaderCountSelector(state.present),
          stickyLeftColumnCount: selectors.stickyLeftColumnCountSelector(state.present),
        }
      },
      (dispatch) => {
        return {
          actions: bindActionCreators(actions.ui, dispatch),
          projectActions: bindActionCreators(actions.project, dispatch),
          beatActions: bindActionCreators(actions.beat, dispatch),
        }
      }
    )(TimelineWrapper)
  }

  throw new Error('Could not connect TimelineWrapper')
}

export default TimelineWrapperConnector
