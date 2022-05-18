import classNames from 'classnames'
import keycode from 'keycode'
import React, { cloneElement } from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import all from 'prop-types-extra/lib/all'
import warning from 'warning'

import { bsClass, bsStyles, getClassSet, prefix, splitBsProps } from './utils/bootstrapUtils'
import createChainedFunction from './utils/createChainedFunction'
import ValidComponentChildren from './utils/ValidComponentChildren'
import { NavbarContext, TabContainerContext } from './context'

// TODO: Should we expose `<NavItem>` as `<Nav.Item>`?

// TODO: This `bsStyle` is very unlike the others. Should we rename it?

// TODO: `pullRight` and `pullLeft` don't render right outside of `navbar`.
// Consider renaming or replacing them.

const propTypes = {
  /**
   * Marks the NavItem with a matching `eventKey` as active. Has a
   * higher precedence over `activeHref`.
   */
  activeKey: PropTypes.any,

  /**
   * Marks the child NavItem with a matching `href` prop as active.
   */
  activeHref: PropTypes.string,

  /**
   * NavItems are be positioned vertically.
   */
  stacked: PropTypes.bool,

  justified: all(PropTypes.bool, ({ justified, navbar }) =>
    justified && navbar ? Error('justified navbar `Nav`s are not supported') : null
  ),

  /**
   * A callback fired when a NavItem is selected.
   *
   * ```js
   * function (
   *  Any eventKey,
   *  SyntheticEvent event?
   * )
   * ```
   */
  onSelect: PropTypes.func,

  /**
   * ARIA role for the Nav, in the context of a TabContainer, the default will
   * be set to "tablist", but can be overridden by the Nav when set explicitly.
   *
   * When the role is set to "tablist" NavItem focus is managed according to
   * the ARIA authoring practices for tabs:
   * https://www.w3.org/TR/2013/WD-wai-aria-practices-20130307/#tabpanel
   */
  role: PropTypes.string,

  /**
   * Apply styling an alignment for use in a Navbar. This prop will be set
   * automatically when the Nav is used inside a Navbar.
   */
  navbar: PropTypes.bool,

  /**
   * Float the Nav to the right. When `navbar` is `true` the appropriate
   * contextual classes are added as well.
   */
  pullRight: PropTypes.bool,

  /**
   * Float the Nav to the left. When `navbar` is `true` the appropriate
   * contextual classes are added as well.
   */
  pullLeft: PropTypes.bool,

  className: PropTypes.string,

  children: PropTypes.oneOfType([PropTypes.node, PropTypes.array]),
}

const defaultProps = {
  justified: false,
  pullRight: false,
  pullLeft: false,
  stacked: false,
}

class Nav extends React.Component {
  componentDidUpdate() {
    if (!this._needsRefocus) {
      return
    }

    this._needsRefocus = false

    const { activeKey, activeHref, children } = this.props

    const activeChild = ValidComponentChildren.find(children, (child) =>
      this.isActive(child, activeKey, activeHref)
    )

    const childrenArray = ValidComponentChildren.toArray(children)
    const activeChildIndex = childrenArray.indexOf(activeChild)

    const childNodes = ReactDOM.findDOMNode(this).children
    const activeNode = childNodes && childNodes[activeChildIndex]

    if (!activeNode || !activeNode.firstChild) {
      return
    }

    activeNode.firstChild.focus()
  }

  getNextActiveChild(offset) {
    const { children } = this.props
    const validChildren = children.filter(
      (child) => child.props.eventKey != null && !child.props.disabled
    )
    const { activeKey, activeHref } = this.props

    const activeChild = ValidComponentChildren.find(children, (child) =>
      this.isActive(child, activeKey, activeHref)
    )

    // This assumes the active child is not disabled.
    const activeChildIndex = validChildren.indexOf(activeChild)
    if (activeChildIndex === -1) {
      // Something has gone wrong. Select the first valid child we can find.
      return validChildren[0]
    }

    let nextIndex = activeChildIndex + offset
    const numValidChildren = validChildren.length

    if (nextIndex >= numValidChildren) {
      nextIndex = 0
    } else if (nextIndex < 0) {
      nextIndex = numValidChildren - 1
    }

    return validChildren[nextIndex]
  }

  getTabProps(child, navRole, active, onSelect) {
    let { id, 'aria-controls': controls, role, onKeyDown, tabIndex } = child.props

    if (navRole === 'tablist') {
      role = role || 'tab'
      onKeyDown = createChainedFunction(
        (event) => this.handleTabKeyDown(onSelect, event),
        onKeyDown
      )
      tabIndex = active ? tabIndex : -1
    }

    return {
      id,
      role,
      onKeyDown,
      'aria-controls': controls,
      tabIndex,
    }
  }

  handleTabKeyDown(onSelect, event) {
    let nextActiveChild

    switch (event.keyCode) {
      case keycode.codes.left:
      case keycode.codes.up:
        nextActiveChild = this.getNextActiveChild(-1)
        break
      case keycode.codes.right:
      case keycode.codes.down:
        nextActiveChild = this.getNextActiveChild(1)
        break
      default:
        // It was a different key; don't handle this keypress.
        return
    }

    event.preventDefault()

    if (onSelect && nextActiveChild && nextActiveChild.props.eventKey != null) {
      onSelect(nextActiveChild.props.eventKey)
    }

    this._needsRefocus = true
  }

  isActive({ props }, activeKey, activeHref) {
    if (
      props.active ||
      (activeKey != null && props.eventKey === activeKey) ||
      (activeHref && props.href === activeHref)
    ) {
      return true
    }

    return props.active
  }

  render() {
    return (
      <NavbarContext.Consumer>
        {({ $bs_navbar }) => {
          const {
            stacked,
            justified,
            onSelect,
            role: propsRole,
            navbar: propsNavbar,
            pullRight,
            pullLeft,
            activeKey,
            activeHref,
            className,
            children,
            ...props
          } = this.props

          const role = propsRole || null

          const [bsProps, elementProps] = splitBsProps(props)

          const classes = {
            ...getClassSet(bsProps),
            [prefix(bsProps, 'stacked')]: stacked,
            [prefix(bsProps, 'justified')]: justified,
          }

          const navbar = propsNavbar != null ? propsNavbar : $bs_navbar
          let pullLeftClassName
          let pullRightClassName

          if (navbar) {
            const navbarProps = $bs_navbar || { bsClass: 'navbar' }

            classes[prefix(navbarProps, 'nav')] = true

            pullRightClassName = prefix(navbarProps, 'right')
            pullLeftClassName = prefix(navbarProps, 'left')
          } else {
            pullRightClassName = 'pull-right'
            pullLeftClassName = 'pull-left'
          }

          classes[pullRightClassName] = pullRight
          classes[pullLeftClassName] = pullLeft

          return (
            <ul {...elementProps} role={role} className={classNames(className, classes)}>
              {ValidComponentChildren.map(children, (child) => {
                const active = this.isActive(child, activeKey, activeHref)
                const childOnSelect = createChainedFunction(
                  child.props.onSelect,
                  onSelect,
                  navbar && navbar.onSelect
                )

                return cloneElement(child, {
                  ...this.getTabProps(child, role, active, childOnSelect),
                  active,
                  activeKey,
                  activeHref,
                  onSelect: childOnSelect,
                })
              })}
            </ul>
          )
        }}
      </NavbarContext.Consumer>
    )
  }
}

Nav.propTypes = propTypes
Nav.defaultProps = defaultProps

export default bsClass('nav', bsStyles(['tabs', 'pills'], Nav))
