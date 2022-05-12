import classNames from 'classnames'
import React from 'react'
import PropTypes from 'prop-types'

import { prefix } from './utils/bootstrapUtils'
import createChainedFunction from './utils/createChainedFunction'
import { NavbarContext } from './context'

const propTypes = {
  onClick: PropTypes.func,
  /**
   * The toggle content, if left empty it will render the default toggle (seen above).
   */
  children: PropTypes.node,
}

class NavbarToggle extends React.Component {
  render() {
    return (
      <NavbarContext.Consumer>
        {({ $bs_navbar }) => {
          const { onClick, className, children, ...props } = this.props
          const navbarProps = $bs_navbar || { bsClass: 'navbar' }

          const buttonProps = {
            type: 'button',
            ...props,
            onClick: createChainedFunction(onClick, navbarProps.onToggle),
            className: classNames(
              className,
              prefix(navbarProps, 'toggle'),
              !navbarProps.expanded && 'collapsed'
            ),
          }

          if (children) {
            return <button {...buttonProps}>{children}</button>
          }

          return (
            <button {...buttonProps}>
              <span className="sr-only">Toggle navigation</span>
              <span className="icon-bar" />
              <span className="icon-bar" />
              <span className="icon-bar" />
            </button>
          )
        }}
      </NavbarContext.Consumer>
    )
  }
}

NavbarToggle.propTypes = propTypes

export default NavbarToggle
