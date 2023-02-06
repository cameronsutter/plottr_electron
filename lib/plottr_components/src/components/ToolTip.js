import React from 'react'
import { PropTypes } from 'prop-types'
import Tooltip from 'rc-tooltip'

import 'rc-tooltip/assets/bootstrap.css'

const ToolTip = ({ id, text, children, placement }) => {
  return (
    <Tooltip
      id={id}
      placement={placement || 'top'}
      trigger={['hover']}
      overlay={<span style={{ fontSize: '16px' }}>{text}</span>}
      overlayInnerStyle={{
        maxWidth: '300px',
      }}
    >
      {children}
    </Tooltip>
  )
}

ToolTip.propTypes = {
  id: PropTypes.string.isRequired,
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.array]),
  text: PropTypes.string.isRequired,
  placement: PropTypes.oneOf([
    'left',
    'right',
    'top',
    'bottom',
    'topLeft',
    'topRight',
    'bottomLeft',
    'bottomRight',
    'rightTop',
    'rightBottom',
    'leftTop',
    'leftBottom',
  ]),
}

export default ToolTip
