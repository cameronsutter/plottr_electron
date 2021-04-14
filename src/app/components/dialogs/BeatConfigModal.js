import React, { useRef, useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { PropTypes } from 'prop-types'
import { Glyphicon, ButtonToolbar, Button } from 'react-bootstrap'
import { DeleteConfirmModal } from 'connected-components'
import { t as i18n } from 'plottr_locales'

import PlottrModal from 'components/PlottrModal'
import HierarchyLevel from './HierarchyLevel'

import { selectors, actions, helpers } from 'pltr/v2'

const {
  hierarchyLevels: { newHierarchyLevel },
} = helpers
const { hierarchyLevelCount, sortedHierarchyLevels } = selectors
const {
  hierarchyLevels: { setHierarchyLevels },
  tour: { tourNext }
} = actions

const modalStyles = {
  overlay: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '65%',
    position: 'relative',
    left: 'auto',
    bottom: 'auto',
    right: 'auto',
    marginTop: '160px', // counters some !important style
    minHeight: 500,
    maxHeight: 'calc(100vh - 120px)'
  },
}

const BeatConfigModal = ({
  closeDialog,
  levelsOfHierarchy,
  hierarchyLevels,
  setHierarchyLevels,
  tourNext
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
        customText={i18n('Are you sure?  (Removing levels may delete scene cards!)')}
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
        <div className="beat-config-modal">
          <h3>{i18n('Act Structure')}</h3>
          <div className="beat-config-modal__hierarchy-count-wrapper">
            <h4>{i18n('Levels of hierarchy')}</h4>
            <div className="beat-config-modal__hierarchy-count-controls">
              <button
                className="beat-config-modal__hierarchy-count-adjustment-control acts-tour-step3"
                onClick={() => {
                  if (hierarchyLevels.length > 1) {
                    setStagedHierarchyLevels(hierarchyLevels.slice(1))
                  }
                }}
              >
                <Glyphicon glyph="minus" />
              </button>
              <input
                ref={levelsInputRef}
                className="beat-config-modal__hierarchy-count"
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
              <button
                className="beat-config-modal__hierarchy-count-adjustment-control acts-tour-step2"
                onClick={() => {
                  if (hierarchyLevels.length < 3) {
                    setHierarchyLevels([newHierarchyLevel(hierarchyLevels), ...hierarchyLevels])
                  }
                }}
              >
                <Glyphicon glyph="plus" />
              </button>
            </div>
          </div>
          <div className="beat-config-modal__levels-table">
            <div className="beat-config-modal__levels-table-header">
              <div className="beat-config-modal__levels-table-cell">Name</div>
              <div className="beat-config-modal__levels-table-cell">Auto Number</div>
              <div className="beat-config-modal__levels-table-cell">Text Color</div>
              <div className="beat-config-modal__levels-table-cell">Text Size</div>
              <div className="beat-config-modal__levels-table-cell">Border Color</div>
              <div className="beat-config-modal__levels-table-cell">Border Style</div>
              <div className="beat-config-modal__levels-table-cell">Background Color</div>
            </div>
            {hierarchyLevels.map((args) => (
              <React.Fragment key={args.level}>
                <HierarchyLevel {...args} />
              </React.Fragment>
            ))}
          </div>
          <ButtonToolbar className="beat-config-modal__button-bar">
            <Button onClick={closeDialog} className="acts-tour-step5">{i18n('Done')}</Button>
          </ButtonToolbar>
        </div>
      </PlottrModal>
    </>
  )
}

BeatConfigModal.propTypes = {
  closeDialog: PropTypes.func.isRequired,
  levelsOfHierarchy: PropTypes.number.isRequired,
  hierarchyLevels: PropTypes.array.isRequired,
  setHierarchyLevels: PropTypes.func.isRequired,
}

const mapStateToProps = (state) => ({
  levelsOfHierarchy: hierarchyLevelCount(state.present),
  hierarchyLevels: sortedHierarchyLevels(state.present),
  tourState: selectors.tourSelector(state.present)
})

export default connect(mapStateToProps, { setHierarchyLevels, tourNext })(BeatConfigModal)
