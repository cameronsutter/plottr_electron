import classNames from 'classnames'
import React from 'react'
import PropTypes from 'prop-types'

import { bsClass, getClassSet, splitBsProps } from './utils/bootstrapUtils'

class HelpBlock extends React.Component {
  render() {
    const { className, ...props } = this.props
    const [bsProps, elementProps] = splitBsProps(props)

    const classes = getClassSet(bsProps)

    return <span {...elementProps} className={classNames(className, classes)} />
  }
}

HelpBlock.propTypes = {
  className: PropTypes.string,
}

export default bsClass('help-block', HelpBlock)
