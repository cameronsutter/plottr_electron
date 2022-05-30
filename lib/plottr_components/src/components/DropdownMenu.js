import classNames from 'classnames'
import keycode from 'keycode'
import React, { useRef } from 'react'
import { useRootClose } from 'react-overlays'
import PropTypes from 'prop-types'

import { bsClass, getClassSet, prefix, splitBsPropsAndOmit } from './utils/bootstrapUtils'
import createChainedFunction from './utils/createChainedFunction'
import ValidComponentChildren from './utils/ValidComponentChildren'

const defaultProps = {
  bsRole: 'menu',
  pullRight: false,
}

const UnforwardedDropdownMenu = (
  { open, pullRight, labelledBy, onSelect, className, children, onClose, ...props },
  forwardedRef
) => {
  const ref = useRef()

  const handleRootClose = (event) => {
    event.preventDefault()
    event.stopPropagation()
    onClose(event, { source: 'rootClose' })
  }

  useRootClose(ref, handleRootClose, { disabled: !open })

  const getFocusableMenuItems = () => {
    if (!ref.current) {
      return []
    }

    return Array.from(ref.current.querySelectorAll('[tabIndex="-1"]'))
  }

  const getItemsAndActiveIndex = () => {
    const items = getFocusableMenuItems()
    const activeIndex = items.indexOf(document.activeElement)

    return { items, activeIndex }
  }

  const focusNext = () => {
    const { items, activeIndex } = getItemsAndActiveIndex()
    if (items.length === 0) {
      return
    }

    const nextIndex = activeIndex === items.length - 1 ? 0 : activeIndex + 1
    items[nextIndex].focus()
  }

  const focusPrevious = () => {
    const { items, activeIndex } = getItemsAndActiveIndex()
    if (items.length === 0) {
      return
    }

    const prevIndex = activeIndex === 0 ? items.length - 1 : activeIndex - 1
    items[prevIndex].focus()
  }

  const handleKeyDown = (event) => {
    switch (event.keyCode) {
      case keycode.codes.down:
        focusNext()
        event.preventDefault()
        break
      case keycode.codes.up:
        focusPrevious()
        event.preventDefault()
        break
      case keycode.codes.esc:
      case keycode.codes.tab:
        onClose(event, { source: 'keydown' })
        break
      default:
    }
  }

  const [bsProps, elementProps] = splitBsPropsAndOmit(props, ['onClose'])

  const classes = {
    ...getClassSet(bsProps),
    [prefix(bsProps, 'right')]: pullRight,
  }

  return (
    <ul
      {...elementProps}
      ref={ref}
      role="menu"
      className={classNames(className, classes)}
      aria-labelledby={labelledBy}
    >
      {ValidComponentChildren.map(children, (child) =>
        React.cloneElement(child, {
          onKeyDown: createChainedFunction(child.props.onKeyDown, handleKeyDown),
          onSelect: createChainedFunction(child.props.onSelect, onSelect),
        })
      )}
    </ul>
  )
}

UnforwardedDropdownMenu.propTypes = {
  open: PropTypes.bool,
  pullRight: PropTypes.bool,
  labelledBy: PropTypes.node,
  onSelect: PropTypes.func,
  className: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.array]),
  onClose: PropTypes.func,
}

const DropdownMenu = React.forwardRef(UnforwardedDropdownMenu)

DropdownMenu.defaultProps = defaultProps

export default bsClass('dropdown-menu', DropdownMenu)
