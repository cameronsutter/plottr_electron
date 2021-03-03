import React from 'react'
import { connect } from 'react-redux'
import { PropTypes } from 'prop-types'
import { Glyphicon, ButtonToolbar, Button } from 'react-bootstrap'
import i18n from 'format-message'

import PlottrModal from 'components/PlottrModal'
import HierarchyLevel from './HierarchyLevel'

import { selectors, actions, helpers } from 'pltr/v2'

const {
  hierarchyLevels: { newHierarchyLevel },
} = helpers
const { hierarchyLevelCount, sortedHierarchyLevels } = selectors
const {
  hierarchyLevels: { setLevelsOfHierarchy, setHierarchyLevels },
} = actions

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
    marginTop: '160px', // counters some !important style
    minHeight: 500,
    maxHeight: 'calc(100vh - 120px)',
  },
}

const BeatConfigModal = ({
  closeDialog,
  levelsOfHierarchy,
  hierarchyLevels,
  setLevelsOfHierarchy,
  setHierarchyLevels,
}) => {
  return (
    <PlottrModal isOpen={true} onRequestClose={closeDialog} style={modalStyles}>
      <div className="beat-config-modal">
        <h3>{i18n('Hierarchy Configuration')}</h3>
        <div className="beat-config-modal__hierarchy-count-wrapper">
          <h4>{i18n('Levels of hierarchy')}</h4>
          <div className="beat-config-modal__hierarchy-count-controls">
            <button
              className="beat-config-modal__hierarchy-count-adjustment-control"
              onClick={() => {
                if (hierarchyLevels.length > 1) {
                  setHierarchyLevels(hierarchyLevels.slice(1))
                }
              }}
            >
              <Glyphicon glyph="minus" />
            </button>
            <input
              className="beat-config-modal__hierarchy-count"
              value={levelsOfHierarchy}
              type="text"
              onChange={(event) => setLevelsOfHierarchy(event.target.value)}
            />
            <button
              className="beat-config-modal__hierarchy-count-adjustment-control"
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
          <Button onClick={closeDialog}>{i18n('Done')}</Button>
        </ButtonToolbar>
      </div>
    </PlottrModal>
  )
}

BeatConfigModal.propTypes = {
  closeDialog: PropTypes.func.isRequired,
  levelsOfHierarchy: PropTypes.number.isRequired,
  hierarchyLevels: PropTypes.array.isRequired,
  setLevelsOfHierarchy: PropTypes.func.isRequired,
  setHierarchyLevels: PropTypes.func.isRequired,
}

const mapStateToProps = (state) => ({
  levelsOfHierarchy: hierarchyLevelCount(state.present),
  hierarchyLevels: sortedHierarchyLevels(state.present),
})

export default connect(mapStateToProps, { setLevelsOfHierarchy, setHierarchyLevels })(
  BeatConfigModal
)
