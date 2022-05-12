import classNames from 'classnames'
import React from 'react'

import { prefix } from './utils/bootstrapUtils'
import { NavbarContext } from './context'

class NavbarBrand extends React.Component {
  render() {
    return (
      <NavbarContext.Consumer>
        {({ $bs_navbar }) => {
          const { className, children, ...props } = this.props
          const navbarProps = $bs_navbar || { bsClass: 'navbar' }

          const bsClassName = prefix(navbarProps, 'brand')

          if (React.isValidElement(children)) {
            return React.cloneElement(children, {
              className: classNames(children.props.className, className, bsClassName),
            })
          }

          return (
            <span {...props} className={classNames(className, bsClassName)}>
              {children}
            </span>
          )
        }}
      </NavbarContext.Consumer>
    )
  }
}

export default NavbarBrand
