import React, { useRef, useEffect, useState } from 'react'
import { PropTypes } from 'prop-types'
import { Glyphicon, Button } from 'react-bootstrap'
import { t } from 'plottr_locales'
import UnconnectedPlottrModal from '../PlottrModal'
import DeleteConfirmModal from './DeleteConfirmModal'
import UnconnectedHierarchyLevel from './HierarchyLevel'

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
  } = connector

  const ActsConfigModal = ({
    closeDialog,
    levelsOfHierarchy,
    hierarchyLevels,
    setHierarchyLevels,
    tourNext,
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
            "Are you sure? Removing a level will delete the level's cards from all books across the project."
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
                <h3>{t('Act Structure')}</h3>
                <Button onClick={closeDialog} className="acts-tour-step5">
                  {t('Close')}
                </Button>
              </div>
              <hr />
            </div>
            <div className="acts-modal__body">
              <div className="acts-modal__hierarchy-count-wrapper">
                <h5>{t('Levels')}</h5>
                <div className="acts-modal__hierarchy-count-controls">
                  {hierarchyLevels.length > 1 ? (
                    <button
                      className="acts-modal__hierarchy-count-adjustment-control acts-tour-step3"
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
                    className="acts-modal__hierarchy-count acts-tour-step2"
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
                  <div className="acts-modal__levels-table-cell">{t('Name')}</div>
                  <div className="acts-modal__levels-table-cell">{t('Auto Number')}</div>
                  <div className="acts-modal__levels-table-cell">{t('Text Color')}</div>
                  <div className="acts-modal__levels-table-cell">{t('Text Size')}</div>
                  <div className="acts-modal__levels-table-cell">{t('Border Color')}</div>
                  <div className="acts-modal__levels-table-cell">{t('Border Style')}</div>
                  <div className="acts-modal__levels-table-cell">{t('Background Color')}</div>
                </div>
                {hierarchyLevels.map((args, idx) => (
                  <React.Fragment key={args.level}>
                    <HierarchyLevel {...args} isHighest={idx == 0} isLowest={idx == 2} />
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
    setHierarchyLevels: PropTypes.func.isRequired,
    tourNext: PropTypes.func.isRequired,
  }

  const { redux } = connector

  if (redux) {
    const {
      pltr: { actions, selectors },
    } = connector
    const { connect } = redux
    const { hierarchyLevelCount, sortedHierarchyLevels } = selectors
    const {
      hierarchyLevels: { setHierarchyLevels },
      tour: { tourNext },
    } = actions

    return connect(
      (state) => ({
        levelsOfHierarchy: hierarchyLevelCount(state.present),
        hierarchyLevels: sortedHierarchyLevels(state.present),
        tourState: selectors.tourSelector(state.present),
      }),
      { setHierarchyLevels, tourNext }
    )(ActsConfigModal)
  }

  throw new Error('Could not connect ActsConfigModal')
}

export default ActsConfigModalConnector
