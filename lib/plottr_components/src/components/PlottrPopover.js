import React from 'react'
import PropTypes from 'prop-types'

const PlottrPopover = ({ children, id, title }) => {
  return (
    <div id={id} role="tooltip" className="plottr_popover">
      <h3 className="popover-title">{title}</h3>
      <div className="popover-content">{children}</div>
    </div>
  )
}

PlottrPopover.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.array]),
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
}

export default PlottrPopover
