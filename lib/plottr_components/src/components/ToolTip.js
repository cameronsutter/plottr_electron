import React from 'react'
import { PropTypes } from 'prop-types'
import Tooltip from 'rc-tooltip'

import 'rc-tooltip/assets/bootstrap.css'

const ToolTip = ({ id, text, children }) => {
  return (
    <Tooltip
      id={id}
      placement="top"
      trigger={['hover']}
      overlay={<span style={{ fontSize: '16px' }}>{text}</span>}
    >
      {children}
    </Tooltip>
  )
}

ToolTip.propTypes = {
  id: PropTypes.string.isRequired,
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.array]),
  text: PropTypes.string.isRequired,
}

export default ToolTip