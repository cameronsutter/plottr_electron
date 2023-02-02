import React, { useRef, useEffect, useState } from 'react'
import { PropTypes } from 'prop-types'

import { t } from 'plottr_locales'

import Glyphicon from '../Glyphicon'
import Button from '../Button'
import UnconnectedPlottrModal from '../PlottrModal'
import DeleteConfirmModal from './DeleteConfirmModal'
import DropdownButton from '../DropdownButton'
import MenuItem from '../MenuItem'
import UnconnectedHierarchyLevel from './HierarchyLevel'
import { checkDependencies } from '../checkDependencies'

const modalStyles = {
  overlay: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '75%',
    position: 'relative',
    left: 'auto',
    bottom: 'auto',
    right: 'auto',
    minHeight: 500,
    maxHeight: 'calc(100vh - 120px)',
    borderRadius: 20,
  },
}

const ActsConfigModalConnector = (connector) => {
  const PlottrModal = UnconnectedPlottrModal(connector)
  const HierarchyLevel = UnconnectedHierarchyLevel(connector)

  const {
    pltr: {
      helpers: {
        hierarchyLevels: { newHierarchyLevel },
      },
    },
    platform: { isDevelopment },
  } = connector
  checkDependencies({ newHierarchyLevel, isDevelopment })

  const ActsConfigModal = ({
    closeDialog,
    levelsOfHierarchy,
    hierarchyLevels,
    setHierarchyLevels,
    isDarkMode,
    timelineView,
    setTimelineView,
  }) => {
    const [stagedHierarchyLevels, setStagedHierarchyLevels] = useState(null)

    const levelsInputRef = useRef()

    const selectLevelsText = () => {
      if (levelsInputRef.current) {
        levelsInputRef.current.setSelectionRange(0, levelsInputRef.current.value.length)
      }
    }

    useEffect(() => {
      if (levelsInputRef.current && levelsInputRef.current === document.activeElement) {
        selectLevelsText()
      }
    }, [levelsOfHierarchy])

    const onLevelsOfHierarchyChanged = (event) => {
      const unclippedValue = parseInt(event.target.value)
      if (!unclippedValue) return

      const targetLength = Math.max(0, Math.min(3, unclippedValue))
      const currentLength = hierarchyLevels.length
      if (targetLength === currentLength) return
      else if (targetLength > currentLength) {
        let newLevels = hierarchyLevels
        for (let i = 0; i < targetLength - currentLength; ++i) {
          newLevels = [newHierarchyLevel(newLevels), ...newLevels]
        }
        setHierarchyLevels(newLevels)
      } else {
        setStagedHierarchyLevels(hierarchyLevels.slice(currentLength - targetLength))
      }
    }

    const RemoveLevelConfirmation = () =>
      stagedHierarchyLevels ? (
        <DeleteConfirmModal
          customText={t(
            "Are you sure? Removing a level will delete the timeline cards directly under this level's heading cards."
          )}
          onDelete={() => {
            setHierarchyLevels(stagedHierarchyLevels)
            setStagedHierarchyLevels(null)
          }}
          onCancel={() => {
            setStagedHierarchyLevels(null)
          }}
        />
      ) : null

    return (
      <>
        <RemoveLevelConfirmation />
        <PlottrModal isOpen={true} onRequestClose={closeDialog} style={modalStyles}>
          <div className="acts-modal__wrapper">
            <div className="acts-modal__header">
              <div>
                <h3>{t('Timeline Structure')}</h3>
                <Button onClick={closeDialog}>{t('Close')}</Button>
              </div>
              <hr />
            </div>
            <div className="acts-modal__body">
              <div className="acts-modal__timeline-controls-wrapper">
                <div className="acts-modal__timeline-view-controls">
                  <h5>{t('View')}</h5>
                  <div className="acts-modal__timeline-view-dropdown">
                    <DropdownButton
                      id="select-timeline-view"
                      className="acts-modal__select-line"
                      title={timelineView}
                    >
                      <MenuItem key={'default'} onSelect={() => setTimelineView('default')}>
                        <div className="acts-modal__timeline-view-selector">{t('Default')}</div>
                      </MenuItem>
                      <MenuItem
                        disabled={hierarchyLevels.length < 2}
                        key={'tabbed'}
                        onSelect={() => setTimelineView('tabbed')}
                        title={
                          hierarchyLevels.length < 2
                            ? t('At least two levels of hierarchy required to view as tabs')
                            : t('View timeline ith tabs for the highest level')
                        }
                      >
                        <div className="acts-modal__timeline-view-selector">{t('Tabbed')}</div>
                      </MenuItem>
                      <MenuItem key={'stacked'} onSelect={() => setTimelineView('stacked')}>
                        <div className="acts-modal__timeline-view-selector">{t('Stacked')}</div>
                      </MenuItem>
                    </DropdownButton>
                  </div>
                </div>
                <h5>{t('Levels')}</h5>
                <div className="acts-modal__hierarchy-count-controls">
                  {hierarchyLevels.length > 1 ? (
                    <button
                      className="acts-modal__hierarchy-count-adjustment-control"
                      onClick={() => {
                        if (hierarchyLevels.length > 1) {
                          setStagedHierarchyLevels(hierarchyLevels.slice(1))
                        }
                      }}
                    >
                      <Glyphicon glyph="minus" />
                    </button>
                  ) : null}
                  <input
                    ref={levelsInputRef}
                    className="acts-modal__hierarchy-count"
                    type="text"
                    value={levelsOfHierarchy}
                    onChange={onLevelsOfHierarchyChanged}
                    onFocus={selectLevelsText}
                    onKeyDown={(event) => {
                      if (event.which === 13) {
                        onLevelsOfHierarchyChanged(event)
                      }
                    }}
                  />
                  {hierarchyLevels.length < 3 ? (
                    <button
                      className="acts-modal__hierarchy-count-adjustment-control"
                      onClick={() => {
                        if (hierarchyLevels.length < 3) {
                          setHierarchyLevels([
                            newHierarchyLevel(hierarchyLevels),
                            ...hierarchyLevels,
                          ])
                        }
                      }}
                    >
                      <Glyphicon glyph="plus" />
                    </button>
                  ) : null}
                </div>
              </div>
              <div className="acts-modal__levels-table">
                <div className="acts-modal__levels-table-header">
                  <div className="acts-modal__levels-table-cell">{t('Level')}</div>
                  <div className="acts-modal__levels-table-cell">{t('Name')}</div>
                  <div className="acts-modal__levels-table-cell">{t('Text Color')}</div>
                  <div className="acts-modal__levels-table-cell">{t('Text Size')}</div>
                  <div className="acts-modal__levels-table-cell">{t('Border Color')}</div>
                  <div className="acts-modal__levels-table-cell">{t('Border Style')}</div>
                  <div className="acts-modal__levels-table-cell">{t('Background Color')}</div>
                </div>
                {hierarchyLevels.map((args, idx) => (
                  <React.Fragment key={args.level}>
                    <HierarchyLevel
                      {...args}
                      isDarkMode={isDarkMode}
                      isHighest={idx == 0}
                      isLowest={idx == 2}
                      displayLevelNumber={hierarchyLevels.length - idx}
                    />
                  </React.Fragment>
                ))}
              </div>
            </div>
            <div className="acts-modal__footer"></div>
          </div>
        </PlottrModal>
      </>
    )
  }

  ActsConfigModal.propTypes = {
    closeDialog: PropTypes.func.isRequired,
    levelsOfHierarchy: PropTypes.number.isRequired,
    hierarchyLevels: PropTypes.array.isRequired,
    isDarkMode: PropTypes.bool.isRequired,
    setHierarchyLevels: PropTypes.func.isRequired,
    timelineView: PropTypes.string.isRequired,
    setTimelineView: PropTypes.func.isRequired,
  }

  const { redux } = connector
  checkDependencies({ redux })

  if (redux) {
    const {
      pltr: { actions, selectors },
    } = connector
    const { connect } = redux
    const { hierarchyLevelCount, sortedHierarchyLevels } = selectors
    const {
      hierarchyLevels: { setHierarchyLevels },
      ui: { setTimelineView },
    } = actions

    return connect(
      (state) => ({
        levelsOfHierarchy: hierarchyLevelCount(state.present),
        hierarchyLevels: sortedHierarchyLevels(state.present),
        timelineView: selectors.timelineViewSelector(state.present),
      }),
      { setHierarchyLevels, setTimelineView }
    )(ActsConfigModal)
  }

  throw new Error('Could not connect ActsConfigModal')
}

export default ActsConfigModalConnector
