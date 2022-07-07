import React, { useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import { IoIosReturnRight } from 'react-icons/io'
import LeaderLine from 'leader-line'

import { t } from 'plottr_locales'

import Button from '../Button'
import UnconnectedPlottrModal from '../PlottrModal'

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

const PlotlineModalConnector = (connector) => {
  const PlottrModal = UnconnectedPlottrModal(connector)

  const PlotlineModal = ({
    sourceHierarchyLevels,
    destinationHierarchyLevels,
    closeDialog,
    action,
    isDarkMode,
  }) => {
    const [resolveSpace, setResolveSpace] = useState('add')
    const [align, setAlign] = useState('bottom')

    const levelRefs = useRef({})

    useEffect(() => {
      if (!levelRefs.current) return () => {}

      const levelsInSource = sourceHierarchyLevels.length
      const levelsInDestination = destinationHierarchyLevels.length

      const lines = []

      if (levelsInSource < levelsInDestination) {
        if (align === 'bottom') {
          const startIndexInDestination = levelsInDestination - levelsInSource
          sourceHierarchyLevels.forEach((level, idx) => {
            const sourceRef = levelRefs.current[`before-${idx}`]
            const destinationRef = levelRefs.current[`after-${startIndexInDestination + idx}`]
            if (!sourceRef || !destinationRef) return
            const newLine = new LeaderLine(sourceRef, destinationRef, {
              dash: { animation: true },
              hide: true,
            })
            lines.push(newLine)
            window.requestIdleCallback(() => {
              newLine.show('draw')
            })
          })
        } else if (align === 'top') {
          const startIndexInDestination = 0
          sourceHierarchyLevels.forEach((level, idx) => {
            const sourceRef = levelRefs.current[`before-${idx}`]
            const destinationRef = levelRefs.current[`after-${startIndexInDestination + idx}`]
            if (!sourceRef || !destinationRef) return
            const newLine = new LeaderLine(sourceRef, destinationRef, {
              dash: { animation: true },
              hide: true,
            })
            lines.push(newLine)
            window.requestIdleCallback(() => {
              newLine.show('draw')
            })
          })
        }
      }
      // TODO: more cases & fewer in destination
      return () => {
        lines.forEach((line) => {
          line.remove()
        })
      }
    }, [resolveSpace, align])

    const title =
      action === 'move'
        ? t('How do you want things to look after moving the plot line?')
        : action === 'apply-template'
        ? t('How do you want things to look after applying the template?')
        : t('How do you want things to look?')

    return (
      <PlottrModal isOpen={true} onRequestClose={closeDialog} style={modalStyles}>
        <div className="plotline-modal__wrapper">
          <div className="plotline-modal__header">
            <div>
              <h3>{title}</h3>
              <Button onClick={closeDialog}>{t('Close')}</Button>
            </div>
            <hr />
          </div>
          <div className="plotline-modal__body">
            <div className="plotline-modal__options">
              <fieldset>
                <legend>Resolve space:</legend>
                <div>
                  <input
                    type="radio"
                    id="add"
                    name="resolve-space"
                    value="add"
                    checked={resolveSpace === 'add'}
                    onClick={() => {
                      setResolveSpace('add')
                    }}
                  />
                  <label htmlFor="add">Add levels</label>
                </div>
                <div>
                  <input
                    type="radio"
                    id="keep-bottom"
                    name="resolve-space"
                    value="keep-bottom"
                    checked={resolveSpace === 'keep-bottom'}
                    onClick={() => {
                      setResolveSpace('keep-bottom')
                    }}
                  />
                  <label htmlFor="keep-bottom">Keep bottom</label>
                </div>
                <div>
                  <input
                    type="radio"
                    id="keep-top"
                    name="resolve-space"
                    value="keep-top"
                    checked={resolveSpace === 'keep-top'}
                    onClick={() => {
                      setResolveSpace('keep-top')
                    }}
                  />
                  <label htmlFor="keep-top">Keep top</label>
                </div>
              </fieldset>
              <fieldset>
                <legend>Alignment:</legend>
                <div>
                  <input
                    type="radio"
                    id="bottom"
                    name="alignment"
                    value="bottom"
                    checked={align === 'bottom'}
                    onClick={() => {
                      setAlign('bottom')
                    }}
                  />
                  <label htmlFor="bottom">Bottom</label>
                </div>
                <div>
                  <input
                    type="radio"
                    id="top"
                    name="alignment"
                    value="top"
                    checked={align === 'top'}
                    onClick={() => {
                      setAlign('top')
                    }}
                  />
                  <label htmlFor="top">Top</label>
                </div>
              </fieldset>
            </div>
            <div className="plotline-modal__preview">
              <div className="plotline-modal__preview-before">
                <h5>{t('Before')}</h5>
                <div className="acts-modal__levels-table">
                  {sourceHierarchyLevels.map((level, idx) => {
                    if (idx > 0) {
                      return (
                        <div
                          className="plotline-modal__preview-level"
                          ref={(ref) => {
                            levelRefs.current[`before-${idx}`] = ref
                          }}
                        >
                          <span style={{ width: 20 * idx }} />
                          <IoIosReturnRight />
                          &nbsp;
                          <div key={level.name}>{level.name}</div>
                        </div>
                      )
                    }
                    return (
                      <div
                        className="plotline-modal__preview-level"
                        key={level.name}
                        ref={(ref) => {
                          levelRefs.current[`before-${idx}`] = ref
                        }}
                      >
                        {level.name}
                      </div>
                    )
                  })}
                </div>
              </div>
              <div className="plotline-modal__preview-divider">&nbsp;</div>
              <div className="plotline-modal__preview-after">
                <h5>{t('After')}</h5>
                <div className="acts-modal__levels-table">
                  {destinationHierarchyLevels.map((level, idx) => {
                    if (idx > 0) {
                      return (
                        <div
                          className="plotline-modal__preview-level"
                          ref={(ref) => {
                            levelRefs.current[`after-${idx}`] = ref
                          }}
                        >
                          <span style={{ width: 20 * idx }} />
                          <IoIosReturnRight />
                          &nbsp;
                          <div key={level.name}>{level.name}</div>
                        </div>
                      )
                    }
                    return (
                      <div
                        className="plotline-modal__preview-level"
                        key={level.name}
                        ref={(ref) => {
                          levelRefs.current[`after-${idx}`] = ref
                        }}
                      >
                        {level.name}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
          <div className="acts-modal__footer"></div>
        </div>
      </PlottrModal>
    )
  }

  PlotlineModal.propTypes = {
    closeDialog: PropTypes.func.isRequired,
    action: PropTypes.oneOf(['move', 'apply-template']),
    isDarkMode: PropTypes.bool,
    sourceHierarchyLevels: PropTypes.array.isRequired,
    destinationHierarchyLevels: PropTypes.array.isRequired,
  }

  const {
    redux,
    pltr: { selectors },
  } = connector

  if (redux) {
    const { connect } = redux

    return connect((state) => {
      return {
        isDarkMode: selectors.isDarkModeSelector(state.present),
        sourceHierarchyLevels: [
          {
            name: 'Chapter',
            level: 1,
            autoNumber: true,
            textSize: 24,
            borderStyle: 'DASHED',
            backgroundColor: 'none',
            textColor: '#78be20',
            borderColor: '#78be20',
            dark: {
              textColor: '#baed79',
              borderColor: '#baed79',
            },
            light: {
              textColor: '#78be20',
              borderColor: '#78be20',
            },
          },
          {
            name: 'Scene',
            level: 2,
            autoNumber: true,
            textSize: 24,
            borderStyle: 'NONE',
            backgroundColor: 'none',
            textColor: '#0b1117',
            borderColor: '#6cace4',
            dark: {
              borderColor: '#c9e6ff',
              textColor: '#c9e6ff',
            },
            light: {
              borderColor: '#6cace4',
              textColor: '#0b1117',
            },
          },
        ],
        destinationHierarchyLevels: [
          {
            name: 'Act',
            level: 0,
            autoNumber: true,
            textSize: 24,
            borderStyle: 'SOLID',
            backgroundColor: 'none',
            textColor: '#e5554f',
            borderColor: '#e5554f',
            dark: {
              textColor: '#ffb8b5',
              borderColor: '#ffb8b5',
            },
            light: {
              textColor: '#e5554f',
              borderColor: '#e5554f',
            },
          },
          {
            name: 'Chapter',
            level: 1,
            autoNumber: true,
            textSize: 24,
            borderStyle: 'DASHED',
            backgroundColor: 'none',
            textColor: '#78be20',
            borderColor: '#78be20',
            dark: {
              textColor: '#baed79',
              borderColor: '#baed79',
            },
            light: {
              textColor: '#78be20',
              borderColor: '#78be20',
            },
          },
          {
            name: 'Scene',
            level: 2,
            autoNumber: true,
            textSize: 24,
            borderStyle: 'NONE',
            backgroundColor: 'none',
            textColor: '#0b1117',
            borderColor: '#6cace4',
            dark: {
              borderColor: '#c9e6ff',
              textColor: '#c9e6ff',
            },
            light: {
              borderColor: '#6cace4',
              textColor: '#0b1117',
            },
          },
        ],
      }
    })(PlotlineModal)
  }

  throw new Error('Could not connect PlotlineModal')
}

export default PlotlineModalConnector
