import React from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'

const PlottrPopover = ({ children, id, title, noMaxWidth }) => {
  return (
    <div id={id} role="tooltip" className={cx('plottr-popover', { 'no-max-width': noMaxWidth })}>
      {title ? <h3 className="popover-title">{title}</h3> : null}
      <div className="popover-content">{children}</div>
    </div>
  )
}

PlottrPopover.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.array]),
  id: PropTypes.string.isRequired,
  title: PropTypes.string,
  noMaxWidth: PropTypes.bool,
}

export default PlottrPopover
