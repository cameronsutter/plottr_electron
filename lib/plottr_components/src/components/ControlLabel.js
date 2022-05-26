import classNames from 'classnames'
import React from 'react'
import PropTypes from 'prop-types'
import warning from 'warning'

import { bsClass, getClassSet, splitBsProps } from './utils/bootstrapUtils'
import { FormGroupContext } from './context'

const propTypes = {
  /**
   * Uses `controlId` from `<FormGroup>` if not explicitly specified.
   */
  htmlFor: PropTypes.string,
  srOnly: PropTypes.bool,
  className: PropTypes.string,
}

const defaultProps = {
  srOnly: false,
}

class ControlLabel extends React.Component {
  render() {
    return (
      <FormGroupContext.Consumer>
        {({ $bs_formGroup }) => {
          const formGroup = $bs_formGroup
          const controlId = formGroup && formGroup.controlId

          const { htmlFor = controlId, srOnly, className, ...props } = this.props
          const [bsProps, elementProps] = splitBsProps(props)

          warning(
            controlId == null || htmlFor === controlId,
            '`controlId` is ignored on `<ControlLabel>` when `htmlFor` is specified.'
          )

          const classes = {
            ...getClassSet(bsProps),
            'sr-only': srOnly,
          }
          return (
            <label {...elementProps} htmlFor={htmlFor} className={classNames(className, classes)} />
          )
        }}
      </FormGroupContext.Consumer>
    )
  }
}

ControlLabel.propTypes = propTypes
ControlLabel.defaultProps = defaultProps

export default bsClass('control-label', ControlLabel)
