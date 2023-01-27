import React, { useEffect, useState, useRef } from 'react'
import PropTypes from 'react-proptypes'
import { StickyTable } from 'react-sticky-table'
import cx from 'classnames'
import { VscSymbolStructure } from 'react-icons/vsc'
import { CgArrowLongRight, CgArrowLongDown } from 'react-icons/cg'

import { t } from 'plottr_locales'
import { helpers } from 'pltr/v2'

import Tabs from '../Tabs'
import Tab from '../Tab'
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
    featureFlags,
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
    timelineTabBeatIds,
    isCardDialogVisible,
    cardDialogBeatId,
    cardDialogCardId,
    cardDialogLineId,
  }) => {
    const [mounted, setMounted] = useState(false)
    const [beatConfigIsOpen, setBeatConfigIsOpen] = useState(false)
    const [clearing, setClearing] = useState(false)
    const [isSmallerThanToolbar, setIsSmallerThanToolbar] = useState(false)
    const [filterIsOpen, setFilterIsOpen] = useState(false)
    const [beatToDelete, setBeatToDelete] = useState(null)

    const scrollTimeoutRef = useRef(null)
    const tableRef = useRef(null)
    const scrollableRef = useRef(
      new Scrollable(() => {
        return timelineBundle.isSmall ? tableRef.current.parentElement : tableRef.current
      })
    )

    useEffect(() => {
      if (timelineBundle.isSmall) return

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
      setBeatConfigIsOpen(false)
    }

    const openBeatConfig = () => {
      setBeatConfigIsOpen(true)
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
    //   structure  //
    // ///////////////

    const handleSetActiveTab = (x) => {
      if (typeof x === 'number') {
        actions.setTimelineActiveTab(x)
      }
    }

    // ///////////////
    //  beat tabs   //
    // ///////////////

    const deleteBeat = (beatId) => {
      setBeatToDelete(beatId)
    }

    // ///////////////
    //  rendering   //
    // //////////////

    const renderDeleteBeat = () => {
      if (!beatToDelete) return null

      return (
        <DeleteConfirmModal
          onDelete={() => {
            beatActions.deleteBeat(beatToDelete, bookId)
            setBeatToDelete(null)
          }}
          onCancel={() => setBeatToDelete(null)}
          customText="Are you sure you want to delete this tab and all it's beats and cards?"
          notSubmit
        />
      )
    }

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
      let scrollDirectionFirst = 'menu-left'
      let scrollDirectionSecond = 'menu-right'
      if (timelineBundle.orientation === 'vertical') {
        glyph = <CgArrowLongRight style={{ marginBottom: -2 }} />
        scrollDirectionFirst = 'menu-up'
        scrollDirectionSecond = 'menu-down'
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
              <Button
                bsSize="small"
                onClick={flipOrientation}
                disabled={timelineViewIsStacked && !timelineBundle.isSmall}
              >
                {glyph} {t('Flip')}
              </Button>
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

    const renderAddTopLevel = () => {
      const addTopLevelbeatTitle = (
        <Glyphicon
          glyph="plus"
          title={t(`Add ${topLevelBeatName}`)}
          onClick={() => {
            beatActions.appendTopLevelBeat(bookId)
          }}
        />
      )

      return <Tab key="add-top-level-beat-tab" title={addTopLevelbeatTitle} />
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

    const renderBody = () => {
      if (timelineBundle.isSmall) {
        if (timelineView === 'tabbed') {
          return (
            <Tabs activeKey={activeTab} onSelect={handleSetActiveTab} onCloseTab={deleteBeat}>
              {[
                ...timelineTabs.map((tabName, index) => {
                  return (
                    <Tab
                      key={timelineTabBeatIds[index]}
                      eventKey={timelineTabBeatIds[index]}
                      title={tabName}
                      className="timeline__tab"
                    >
                      <TimelineTable
                        setTableRef={(ref) => {
                          tableRef.current = ref
                        }}
                        tableRef={tableRef.current}
                        activeTab={activeTab}
                      />
                    </Tab>
                  )
                }),
                renderAddTopLevel(),
              ]}
            </Tabs>
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
            <Tabs activeKey={activeTab} onSelect={handleSetActiveTab} onCloseTab={deleteBeat}>
              {[
                ...timelineTabs.map((tabName, index) => {
                  return (
                    <Tab
                      key={timelineTabBeatIds[index]}
                      eventKey={timelineTabBeatIds[index]}
                      title={tabName}
                      className="timeline__tab"
                    >
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
                    </Tab>
                  )
                }),
                renderAddTopLevel(),
              ]}
            </Tabs>
          )
        } else {
          return (
            <StickyTable
              leftColumnZ={5}
              headerZ={5}
              wrapperRef={(ref) => (tableRef.current = ref)}
              stickyHeaderCount={timelineViewIsStacked ? hierarchyLevels.length : 1}
              className={cx({
                darkmode: timelineBundle.darkMode,
                vertical: timelineBundle.orientation == 'vertical',
              })}
            >
              {mounted ? (
                <TimelineTable tableRef={tableRef.current} activeTab={activeTab} />
              ) : (
                <FunSpinner />
              )}
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
      if (!beatConfigIsOpen) return null

      return <ActsConfigModal isDarkMode={timelineBundle.darkMode} closeDialog={closeBeatConfig} />
    }

    return (
      <>
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
        {renderDeleteBeat()}
      </>
    )
  }

  TimelineWrapper.propTypes = {
    cardsExistOnTimeline: PropTypes.bool,
    bookId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    timelineBundle: PropTypes.object.isRequired,
    featureFlags: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    testingAndDiagnosisEnabled: PropTypes.bool,
    projectActions: PropTypes.object.isRequired,
    isOnWeb: PropTypes.bool,
    timelineSearchTerm: PropTypes.string,
    timelineView: PropTypes.string.isRequired,
    timelineTabs: PropTypes.array.isRequired,
    activeTab: PropTypes.number.isRequired,
    timelineViewIsStacked: PropTypes.bool,
    timelineViewIsTabbed: PropTypes.bool,
    hierarchyLevels: PropTypes.array.isRequired,
    topLevelBeatName: PropTypes.string.isRequired,
    beatActions: PropTypes.object.isRequired,
    timelineTabBeatIds: PropTypes.array.isRequired,
    cardDialogCardId: PropTypes.number,
    cardDialogLineId: PropTypes.number,
    cardDialogBeatId: PropTypes.number,
    isCardDialogVisible: PropTypes.bool,
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
          testingAndDiagnosisEnabled: selectors.testingAndDiagnosisEnabledSelector(state.present),
          isOnWeb: selectors.isOnWebSelector(state.present),
          timelineSearchTerm: selectors.timelineSearchTermSelector(state.present),
          timelineView: selectors.timelineViewSelector(state.present),
          timelineTabs: selectors.timelineTabsSelector(state.present),
          timelineTabBeatIds: selectors.timelineTabBeatIdsSelector(state.present),
          activeTab: selectors.timelineActiveTabSelector(state.present),
          timelineViewIsStacked: selectors.timelineViewIsStackedSelector(state.present),
          timelineViewIsTabbed: selectors.timelineViewIsTabbedSelector(state.present),
          hierarchyLevels: selectors.sortedHierarchyLevels(state.present),
          topLevelBeatName: selectors.topLevelBeatNameSelector(state.present),
          cardDialogCardId: selectors.cardDialogCardIdSelector(state.present),
          cardDialogLineId: selectors.cardDialogLineIdSelector(state.present),
          cardDialogBeatId: selectors.cardDialogBeatIdSelector(state.present),
          isCardDialogVisible: selectors.isCardDialogVisibleSelector(state.present),
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
