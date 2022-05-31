import classNames from 'classnames'
import React from 'react'
import PropTypes from 'prop-types'

import { bsClass, bsSizes, getClassSet, splitBsPropsAndOmit } from './utils/bootstrapUtils'
import { Size } from './utils/StyleConfig'
import ValidComponentChildren from './utils/ValidComponentChildren'
import { FormGroupContext } from './context'

const propTypes = {
  /**
   * Sets `id` on `<FormControl>` and `htmlFor` on `<FormGroup.Label>`.
   */
  controlId: PropTypes.string,
  validationState: PropTypes.oneOf(['success', 'warning', 'error', null]),
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.array]),
  className: PropTypes.string,
}

class FormGroup extends React.Component {
  constructor(props) {
    super(props)

    const { controlId, validationState } = this.props

    this.formContext = {
      $bs_formGroup: {
        controlId,
        validationState,
      },
    }
  }

  hasFeedback(children) {
    return ValidComponentChildren.some(
      children,
      (child) =>
        child.props.bsRole === 'feedback' ||
        (child.props.children && this.hasFeedback(child.props.children))
    )
  }

  render() {
    const { validationState, className, children, ...props } = this.props
    const [bsProps, elementProps] = splitBsPropsAndOmit(props, ['controlId'])

    const classes = {
      ...getClassSet(bsProps),
      'has-feedback': this.hasFeedback(children),
    }
    if (validationState) {
      classes[`has-${validationState}`] = true
    }

    return (
      <FormGroupContext.Provider value={this.formContext}>
        <div {...elementProps} className={classNames(className, classes)}>
          {children}
        </div>
      </FormGroupContext.Provider>
    )
  }
}

FormGroup.propTypes = propTypes

export default bsClass('form-group', bsSizes([Size.LARGE, Size.SMALL], FormGroup))
