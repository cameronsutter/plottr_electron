import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { PropTypes } from 'prop-types'
import { Glyphicon } from 'react-bootstrap'

import PlottrModal from 'components/PlottrModal'
import { selectors } from 'pltr/v2'

const { hierarchyLevelCount, sortedHierarchyLevels } = selectors

const modalStyles = {
  overlay: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '50%',
    position: 'relative',
    left: 'auto',
    bottom: 'auto',
    right: 'auto',
    marginTop: '-60px', // counters some !important style
    minHeight: 500,
    maxHeight: 'calc(100vh - 120px)',
  },
}

const BeatConfigModal = ({ closeDialog, levelsOfHierarchy, hierarchyLevels }) => {
  const [stagedLevelsOfHierarchy, setStagedLevelsOfHierarchy] = useState(levelsOfHierarchy)

  useEffect(() => {
    setStagedLevelsOfHierarchy(levelsOfHierarchy)
  }, [levelsOfHierarchy])

  const HierarchyLevel = ({
    name,
    autoNumber,
    textColor,
    textSize,
    borderColor,
    borderStyle,
    backgroundColor,
  }) => (
    <div className="beat-config-modal__levels-table-header">
      <div className="beat-config-modal__levels-table-cell">{name}</div>
      <div className="beat-config-modal__levels-table-cell">{autoNumber}</div>
      <div className="beat-config-modal__levels-table-cell">{textColor}</div>
      <div className="beat-config-modal__levels-table-cell">{textSize}</div>
      <div className="beat-config-modal__levels-table-cell">{borderColor}</div>
      <div className="beat-config-modal__levels-table-cell">{borderStyle}</div>
      <div className="beat-config-modal__levels-table-cell">{backgroundColor}</div>
    </div>
  )

  HierarchyLevel.propTypes = {
    name: PropTypes.string.isRequired,
    autoNumber: PropTypes.string.isRequired,
    textColor: PropTypes.string.isRequired,
    textSize: PropTypes.string.isRequired,
    borderColor: PropTypes.string.isRequired,
    borderStyle: PropTypes.string.isRequired,
    backgroundColor: PropTypes.string.isRequired,
  }

  return (
    <PlottrModal isOpen={true} onRequestClose={closeDialog} style={modalStyles}>
      <div className="beat-config-modal">
        <div className="beat-config-modal__hierarchy-count-wrapper">
          <div className="beat-config-modal__hierarchy-count-label">Levels of hierarchy</div>
          <div className="beat-config-modal__hierarchy-count-controls">
            <button
              className="beat-config-modal__hierarchy-count-adjustment-control"
              onClick={() => {
                setStagedLevelsOfHierarchy(stagedLevelsOfHierarchy - 1)
              }}
            >
              <Glyphicon glyph="minus" />
            </button>
            <input
              className="beat-config-modal__hierarchy-count"
              value={stagedLevelsOfHierarchy}
              type="text"
              onChange={(event) => setStagedLevelsOfHierarchy(event.target.value)}
            />
            <button
              className="beat-config-modal__hierarchy-count-adjustment-control"
              onClick={() => {
                setStagedLevelsOfHierarchy(stagedLevelsOfHierarchy + 1)
              }}
            >
              <Glyphicon glyph="plus" />
            </button>
          </div>
        </div>
        <div className="beat-config-modal__levels-table-header">
          <div className="beat-config-modal__levels-table-cell">Name</div>
          <div className="beat-config-modal__levels-table-cell">Auto Number</div>
          <div className="beat-config-modal__levels-table-cell">Text Color</div>
          <div className="beat-config-modal__levels-table-cell">Text Size</div>
          <div className="beat-config-modal__levels-table-cell">Border Color</div>
          <div className="beat-config-modal__levels-table-cell">Border Style</div>
          <div className="beat-config-modal__levels-table-cell">Background Color</div>
        </div>
        {hierarchyLevels.map(HierarchyLevel)}
      </div>
    </PlottrModal>
  )
}

BeatConfigModal.propTypes = {
  closeDialog: PropTypes.func.isRequired,
  levelsOfHierarchy: PropTypes.number.isRequired,
  hierarchyLevels: PropTypes.array.isRequired,
}

const mapStateToProps = (state) => ({
  levelsOfHierarchy: hierarchyLevelCount(state.present),
  hierarchyLevels: sortedHierarchyLevels(state.present),
})

export default connect(mapStateToProps)(BeatConfigModal)
