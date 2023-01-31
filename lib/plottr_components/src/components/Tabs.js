import React from 'react'
import PropTypes from 'prop-types'
import requiredForA11y from 'prop-types-extra/lib/isRequiredForA11y'
import { uncontrollable } from 'uncontrollable'
import elementType from 'prop-types-extra/lib/elementType'
import { omit } from 'lodash'

import Nav from './Nav'
import NavItem from './NavItem'
import UncontrolledTabContainer from './TabContainer'
import TabContent from './TabContent'
import { bsClass as setBsClass } from './utils/bootstrapUtils'
import ValidComponentChildren from './utils/ValidComponentChildren'

const TabContainer = UncontrolledTabContainer.ControlledComponent

const propTypes = {
  /**
   * Mark the Tab with a matching `eventKey` as active.
   *
   * @controllable onSelect
   */
  activeKey: PropTypes.any,

  /**
   * Navigation style
   */
  bsStyle: PropTypes.oneOf(['tabs', 'pills']),

  /**
   * Sets a default animation strategy. Use `false` to disable, `true`
   * to enable the default `<Fade>` animation, or a react-transition-group
   * v2 `<Transition/>` component.
   */
  animation: PropTypes.oneOfType([PropTypes.bool, elementType]),

  id: requiredForA11y(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),

  /**
   * Callback fired when a Tab is selected.
   *
   * ```js
   * function (
   *   Any eventKey,
   *   SyntheticEvent event?
   * )
   * ```
   *
   * @controllable activeKey
   */
  onSelect: PropTypes.func,

  /**
   * Wait until the first "enter" transition to mount tabs (add them to the DOM)
   */
  mountOnEnter: PropTypes.bool,

  /**
   * Unmount tabs (remove it from the DOM) when it is no longer visible
   */
  unmountOnExit: PropTypes.bool,

  bsClass: PropTypes.string,

  className: PropTypes.string,

  style: PropTypes.object,

  children: PropTypes.oneOfType([PropTypes.node, PropTypes.array]),

  onCloseTab: PropTypes.func,

  onContextMenu: PropTypes.func,

  onDragOver: PropTypes.func,

  tabClasses: PropTypes.func,
}

const defaultProps = {
  bsStyle: 'tabs',
  animation: true,
  mountOnEnter: false,
  unmountOnExit: false,
}

function getDefaultActiveKey(children) {
  let defaultActiveKey
  ValidComponentChildren.forEach(children, (child) => {
    if (defaultActiveKey == null) {
      defaultActiveKey = child.props.eventKey
    }
  })

  return defaultActiveKey
}

class Tabs extends React.Component {
  constructor(props) {
    super(props)

    this.renderTab = this.renderTab.bind(this)
  }

  renderTab(child) {
    const { title, eventKey, disabled, tabClassName, noHandlers } = child.props
    if (title == null) {
      return null
    }

    if (noHandlers) {
      return (
        <NavItem
          onSelect={this.props.onSelect}
          eventKey={eventKey}
          disabled={disabled}
          className={tabClassName}
        >
          {title}
        </NavItem>
      )
    }

    return (
      <NavItem
        onSelect={this.props.onSelect}
        eventKey={eventKey}
        disabled={disabled}
        className={tabClassName}
        onClose={this.props.onCloseTab}
        onContextMenu={this.props.onContextMenu}
        onDragOver={this.props.onDragOver}
        tabClasses={this.props.tabClasses}
      >
        {title}
      </NavItem>
    )
  }

  render() {
    const {
      id,
      onSelect,
      animation,
      mountOnEnter,
      unmountOnExit,
      bsClass,
      className,
      style,
      children,
      activeKey = getDefaultActiveKey(children),
      ...props
    } = this.props

    return (
      <TabContainer
        id={id}
        activeKey={activeKey}
        onSelect={onSelect}
        className={className}
        style={style}
      >
        <div>
          <Nav {...omit(props, ['activeKey'])} activeKey={activeKey} role="tablist">
            {ValidComponentChildren.map(children, this.renderTab)}
          </Nav>

          <TabContent
            activeKey={activeKey}
            bsClass={bsClass}
            animation={animation}
            mountOnEnter={mountOnEnter}
            unmountOnExit={unmountOnExit}
          >
            {children}
          </TabContent>
        </div>
      </TabContainer>
    )
  }
}

Tabs.propTypes = propTypes
Tabs.defaultProps = defaultProps

setBsClass('tab', Tabs)

export default uncontrollable(Tabs, { activeKey: 'onSelect' })
