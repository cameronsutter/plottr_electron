import classNames from 'classnames'
import React from 'react'
import PropTypes from 'prop-types'
import elementType from 'prop-types-extra/lib/elementType'
import { omit } from 'lodash'

import {
  bsClass,
  bsSizes,
  bsStyles,
  getClassSet,
  prefix,
  splitBsProps,
} from './utils/bootstrapUtils'
import { Size, State, Style } from './utils/StyleConfig'

import SafeAnchor from './SafeAnchor'

const propTypes = {
  active: PropTypes.bool,
  disabled: PropTypes.bool,
  block: PropTypes.bool,
  onClick: PropTypes.func,
  componentClass: elementType,
  href: PropTypes.string,
  /**
   * Defines HTML button type attribute
   * @defaultValue 'button'
   */
  type: PropTypes.oneOf(['button', 'reset', 'submit']),
  className: PropTypes.string,
  ref: PropTypes.object,
}

const defaultProps = {
  active: false,
  block: false,
  disabled: false,
}

const Button = (props, ref) => {
  const { active, block, className } = props
  const [bsProps, elementProps] = splitBsProps(props)

  const classes = {
    ...getClassSet(bsProps),
    active,
    [prefix(bsProps, 'block')]: block,
  }
  const fullClassName = classNames(className, classes)

  const renderAnchor = (elementProps, className) => {
    return (
      <SafeAnchor
        {...elementProps}
        ref={ref}
        className={classNames(className, elementProps.disabled && 'disabled')}
      />
    )
  }

  const renderButton = ({ componentClass, ...elementProps }, className) => {
    const Component = componentClass || 'button'

    return (
      <Component
        {...omit(elementProps, ['innerRef'])}
        ref={ref}
        type={elementProps.type || 'button'}
        className={className}
      />
    )
  }

  if (elementProps.href) {
    return renderAnchor(elementProps, fullClassName)
  }

  return renderButton(elementProps, fullClassName)
}

Button.propTypes = propTypes
Button.defaultProps = defaultProps

export default bsClass(
  'btn',
  bsSizes(
    [Size.LARGE, Size.SMALL, Size.XSMALL],
    bsStyles(
      [...Object.values(State), Style.DEFAULT, Style.PRIMARY, Style.LINK],
      Style.DEFAULT,
      React.forwardRef(Button)
    )
  )
)
