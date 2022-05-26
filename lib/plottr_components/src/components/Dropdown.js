import classNames from 'classnames'
import activeElement from 'dom-helpers/activeElement'
import contains from 'dom-helpers/query/contains'
import keycode from 'keycode'
import React, { cloneElement, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import all from 'prop-types-extra/lib/all'
import elementType from 'prop-types-extra/lib/elementType'
import isRequiredForA11y from 'prop-types-extra/lib/isRequiredForA11y'
import { uncontrollable } from 'uncontrollable'

import ButtonGroup from './ButtonGroup'
import DropdownMenu from './DropdownMenu'
import DropdownToggle from './DropdownToggle'
import { bsClass as setBsClass, prefix } from './utils/bootstrapUtils'
import createChainedFunction from './utils/createChainedFunction'
import { exclusiveRoles, requiredRoles } from './utils/PropTypes'
import ValidComponentChildren from './utils/ValidComponentChildren'

const TOGGLE_ROLE = DropdownToggle.defaultProps.bsRole
const MENU_ROLE = DropdownMenu.defaultProps.bsRole

const propTypes = {
  /**
   * The menu will open above the dropdown button, instead of below it.
   */
  dropup: PropTypes.bool,

  /**
   * An html id attribute, necessary for assistive technologies, such as screen readers.
   * @type {string|number}
   * @required
   */
  id: isRequiredForA11y(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),

  componentClass: elementType,

  /**
   * The children of a Dropdown may be a `<Dropdown.Toggle>` or a `<Dropdown.Menu>`.
   * @type {node}
   */
  children: all(requiredRoles(TOGGLE_ROLE, MENU_ROLE), exclusiveRoles(MENU_ROLE)),

  /**
   * Whether or not component is disabled.
   */
  disabled: PropTypes.bool,

  /**
   * Align the menu to the right side of the Dropdown toggle
   */
  pullRight: PropTypes.bool,

  /**
   * Whether or not the Dropdown is visible.
   *
   * @controllable onToggle
   */
  open: PropTypes.bool,

  defaultOpen: PropTypes.bool,

  /**
   * A callback fired when the Dropdown wishes to change visibility. Called with the requested
   * `open` value, the DOM event, and the source that fired it: `'click'`,`'keydown'`,`'rootClose'`, or `'select'`.
   *
   * ```js
   * function(Boolean isOpen, Object event, { String source }) {}
   * ```
   * @controllable open
   */
  onToggle: PropTypes.func,

  /**
   * A callback fired when a menu item is selected.
   *
   * ```js
   * (eventKey: any, event: Object) => any
   * ```
   */
  onSelect: PropTypes.func,

  /**
   * If `'menuitem'`, causes the dropdown to behave like a menu item rather than
   * a menu button.
   */
  role: PropTypes.string,

  /**
   * Which event when fired outside the component will cause it to be closed
   *
   * *Note: For custom dropdown components, you will have to pass the
   * `rootCloseEvent` to `<RootCloseWrapper>` in your custom dropdown menu
   * component ([similarly to how it is implemented in `<Dropdown.Menu>`](https://github.com/react-bootstrap/react-bootstrap/blob/v0.31.5/src/DropdownMenu.js#L115-L119)).*
   */
  rootCloseEvent: PropTypes.oneOf(['click', 'mousedown']),

  /**
   * @private
   */
  onMouseEnter: PropTypes.func,
  /**
   * @private
   */
  onMouseLeave: PropTypes.func,
  className: PropTypes.string,
  bsClass: PropTypes.string,
}

const defaultProps = {
  componentClass: ButtonGroup,
}

const Dropdown = ({
  componentClass: Component,
  id,
  dropup,
  disabled,
  pullRight,
  open,
  onSelect,
  role,
  bsClass,
  className,
  rootCloseEvent,
  children,
  onToggle,
  ...props
}) => {
  const _focusInDropdown = useRef(false)
  const lastOpenEventType = useRef(null)
  const menu = useRef()
  const toggle = useRef()

  const focusNextOnOpen = () => {
    if (!menu.current || !menu.current.focusNext) {
      return
    }

    if (lastOpenEventType.current === 'keydown' || role === 'menuitem') {
      menu.current.focusNext()
    }
  }

  useEffect(() => {
    focusNextOnOpen()
  }, [])

  useEffect(() => {
    if (open && menu.current) {
      _focusInDropdown.current = contains(menu.current, activeElement(document))
    } else if (!open && toggle.current) {
      _focusInDropdown.current = false
      focus()
    }
  }, [open])

  const focus = () => {
    if (toggle.current && toggle.current.focus) {
      toggle.current.focus()
    }
  }

  const handleClick = (event) => {
    if (disabled) {
      return
    }

    toggleOpen(event, { source: 'click' })
  }

  const handleClose = (event, eventDetails) => {
    if (!open) {
      return
    }

    toggleOpen(event, eventDetails)
  }

  const handleKeyDown = (event) => {
    if (disabled) {
      return
    }

    switch (event.keyCode) {
      case keycode.codes.down:
        if (!open) {
          toggleOpen(event, { source: 'keydown' })
        } else if (menu.current.focusNext) {
          menu.current.focusNext()
        }
        event.preventDefault()
        break
      case keycode.codes.esc:
      case keycode.codes.tab:
        handleClose(event, { source: 'keydown' })
        break
      default:
    }
  }

  const toggleOpen = (event, eventDetails) => {
    let open = !open

    if (open) {
      lastOpenEventType.current = eventDetails.source
    }

    if (onToggle) {
      onToggle(open, event, eventDetails)
    }
  }

  const renderMenu = (child, { id, onSelect, rootCloseEvent, ...props }) => {
    return cloneElement(child, {
      ...props,
      menu,
      labelledBy: id,
      bsClass: prefix(props, 'menu'),
      onClose: createChainedFunction(child.props.onClose, handleClose),
      onSelect: createChainedFunction(child.props.onSelect, onSelect, (key, event) =>
        handleClose(event, { source: 'select' })
      ),
      rootCloseEvent,
    })
  }

  const renderToggle = (child, props) => {
    return cloneElement(child, {
      ...props,
      toggle,
      bsClass: prefix(props, 'toggle'),
      onClick: createChainedFunction(child.props.onClick, handleClick),
      onKeyDown: createChainedFunction(child.props.onKeyDown, handleKeyDown),
    })
  }

  const classes = {
    [bsClass]: true,
    open,
    disabled,
  }

  if (dropup) {
    classes[bsClass] = false
    classes.dropup = true
  }

  // This intentionally forwards bsSize and bsStyle (if set) to the
  // underlying component, to allow it to render size and style variants.

  return (
    <Component {...props} className={classNames(className, classes)}>
      {ValidComponentChildren.map(children, (child) => {
        switch (child.props.bsRole) {
          case TOGGLE_ROLE:
            return renderToggle(child, {
              id,
              disabled,
              open,
              role,
              bsClass,
            })
          case MENU_ROLE:
            return renderMenu(child, {
              id,
              open,
              pullRight,
              bsClass,
              onSelect,
              rootCloseEvent,
            })
          default:
            return child
        }
      })}
    </Component>
  )
}

Dropdown.propTypes = propTypes
Dropdown.defaultProps = defaultProps

setBsClass('dropdown', Dropdown)

const UncontrolledDropdown = uncontrollable(Dropdown, { open: 'onToggle' })

UncontrolledDropdown.Toggle = DropdownToggle
UncontrolledDropdown.Menu = DropdownMenu

export default UncontrolledDropdown
