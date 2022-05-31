import React from 'react'
import PropTypes from 'prop-types'

const PlottrPopover = ({ children, id, title }) => {
  return (
    <div id={id} role="tooltip" className="plottr-popover">
      {title ? <h3 className="popover-title">{title}</h3> : null}
      <div className="popover-content">{children}</div>
    </div>
  )
}

PlottrPopover.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.array]),
  id: PropTypes.string.isRequired,
  title: PropTypes.string,
}

export default PlottrPopover
