import classNames from 'classnames'
import React from 'react'
import PropTypes from 'prop-types'
import { FiXCircle } from 'react-icons/fi'

import SafeAnchor from './SafeAnchor'
import createChainedFunction from './utils/createChainedFunction'

const propTypes = {
  active: PropTypes.bool,
  disabled: PropTypes.bool,
  role: PropTypes.string,
  href: PropTypes.string,
  onClick: PropTypes.func,
  onSelect: PropTypes.func,
  eventKey: PropTypes.any,
  className: PropTypes.string,
  style: PropTypes.object,
  onClose: PropTypes.func,
}

const defaultProps = {
  active: false,
  disabled: false,
}

class NavItem extends React.Component {
  constructor(props, context) {
    super(props, context)

    this.handleClick = this.handleClick.bind(this)
  }

  handleClick(e) {
    if (this.props.disabled) {
      e.preventDefault()
      return
    }

    if (this.props.onSelect) {
      this.props.onSelect(this.props.eventKey, e)
    }
  }

  render() {
    const { onClose, active, disabled, onClick, className, style, ...props } = this.props

    const key = props.activeKey

    delete props.onSelect
    delete props.eventKey

    // These are injected down by `<Nav>` for building `<SubNav>`s.
    delete props.activeKey
    delete props.activeHref

    if (!props.role) {
      if (props.href === '#') {
        props.role = 'button'
      }
    } else if (props.role === 'tab') {
      props['aria-selected'] = active
    }

    return (
      <li role="presentation" className={classNames(className, { active, disabled })} style={style}>
        <SafeAnchor
          {...props}
          disabled={disabled}
          onClick={createChainedFunction(onClick, this.handleClick)}
        >
          {onClose && active ? (
            <div className="nav-with-cross">
              {props.children}
              &nbsp;
              <FiXCircle
                onClick={() => {
                  onClose(key)
                }}
              />
            </div>
          ) : (
            props.children
          )}
        </SafeAnchor>
      </li>
    )
  }
}

NavItem.propTypes = propTypes
NavItem.defaultProps = defaultProps

export default NavItem
