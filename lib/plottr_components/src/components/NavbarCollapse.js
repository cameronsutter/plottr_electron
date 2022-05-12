import React from 'react'

import Collapse from './Collapse'
import { prefix } from './utils/bootstrapUtils'
import { NavbarContext } from './context'

class NavbarCollapse extends React.Component {
  render() {
    return (
      <NavbarContext.Consumer>
        {({ $bs_navbar }) => {
          const { children, ...props } = this.props
          const navbarProps = $bs_navbar || { bsClass: 'navbar' }

          const bsClassName = prefix(navbarProps, 'collapse')

          return (
            <Collapse in={navbarProps.expanded} {...props}>
              <div className={bsClassName}>{children}</div>
            </Collapse>
          )
        }}
      </NavbarContext.Consumer>
    )
  }
}

export default NavbarCollapse
