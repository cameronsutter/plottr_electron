import classNames from 'classnames'
import React from 'react'
import { FormGroupContext } from './context'

import Glyphicon from './Glyphicon'
import { bsClass, getClassSet, splitBsProps } from './utils/bootstrapUtils'

const defaultProps = {
  bsRole: 'feedback',
}

class FormControlFeedback extends React.Component {
  getGlyph(validationState) {
    switch (validationState) {
      case 'success':
        return 'ok'
      case 'warning':
        return 'warning-sign'
      case 'error':
        return 'remove'
      default:
        return null
    }
  }

  renderDefaultFeedback(formGroup, className, classes, elementProps) {
    const glyph = this.getGlyph(formGroup && formGroup.validationState)
    if (!glyph) {
      return null
    }

    return <Glyphicon {...elementProps} glyph={glyph} className={classNames(className, classes)} />
  }

  render() {
    return (
      <FormGroupContext.Consumer>
        {({ $bs_formGroup }) => {
          const { className, children, ...props } = this.props
          const [bsProps, elementProps] = splitBsProps(props)

          const classes = getClassSet(bsProps)

          if (!children) {
            return this.renderDefaultFeedback($bs_formGroup, className, classes, elementProps)
          }

          const child = React.Children.only(children)
          return React.cloneElement(child, {
            ...elementProps,
            className: classNames(child.props.className, className, classes),
          })
        }}
      </FormGroupContext.Consumer>
    )
  }
}

FormControlFeedback.defaultProps = defaultProps

export default bsClass('form-control-feedback', FormControlFeedback)
