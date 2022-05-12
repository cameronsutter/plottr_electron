import classNames from 'classnames'
import React from 'react'

import { prefix } from './utils/bootstrapUtils'
import { NavbarContext } from './context'

class NavbarHeader extends React.Component {
  render() {
    return (
      <NavbarContext.Consumer>
        {({ $bs_navbar }) => {
          const { className, ...props } = this.props
          const navbarProps = $bs_navbar || { bsClass: 'navbar' }

          const bsClassName = prefix(navbarProps, 'header')

          return <div {...props} className={classNames(className, bsClassName)} />
        }}
      </NavbarContext.Consumer>
    )
  }
}

export default NavbarHeader
