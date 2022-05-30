import classNames from 'classnames'
import React from 'react'
import PropTypes from 'prop-types'

import { bsClass, getClassSet, splitBsProps } from './utils/bootstrapUtils'

class ButtonToolbar extends React.Component {
  render() {
    const { className, ...props } = this.props
    const [bsProps, elementProps] = splitBsProps(props)

    const classes = getClassSet(bsProps)

    return <div {...elementProps} role="toolbar" className={classNames(className, classes)} />
  }
}

ButtonToolbar.propTypes = {
  className: PropTypes.string,
}

export default bsClass('btn-toolbar', ButtonToolbar)
