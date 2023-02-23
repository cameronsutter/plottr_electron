import React from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'

const PlottrPopover = ({ children, id, title, noMaxWidth, contentStyleOverride }) => {
  return (
    <div id={id} role="tooltip" className={cx('plottr-popover', { 'no-max-width': noMaxWidth })}>
      {title ? <h3 className="popover-title">{title}</h3> : null}
      <div
        style={{ ...(contentStyleOverride ? contentStyleOverride : {}) }}
        className="popover-content"
      >
        {children}
      </div>
    </div>
  )
}

PlottrPopover.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.array]),
  id: PropTypes.string.isRequired,
  title: PropTypes.string,
  noMaxWidth: PropTypes.bool,
  contentStyleOverride: PropTypes.object,
}

export default PlottrPopover
