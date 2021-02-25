import React from 'react'
import { PropTypes } from 'prop-types'

const HierarchyLevel = ({
  name,
  autoNumber,
  textColor,
  textSize,
  borderColor,
  borderStyle,
  backgroundColor,
}) => (
  <div className="beat-config-modal__levels-table-row">
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

export default HierarchyLevel
