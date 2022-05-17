import classNames from 'classnames'
import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import elementType from 'prop-types-extra/lib/elementType'

import { TabContainerContext, TabContentContext } from './context'
import { bsClass as setBsClass, prefix, splitBsPropsAndOmit } from './utils/bootstrapUtils'

const propTypes = {
  componentClass: elementType,

  /**
   * Sets a default animation strategy for all children `<TabPane>`s. Use
   * `false` to disable, `true` to enable the default `<Fade>` animation or
   * a react-transition-group v2 `<Transition/>` component.
   */
  animation: PropTypes.oneOfType([PropTypes.bool, elementType]),

  /**
   * Wait until the first "enter" transition to mount tabs (add them to the DOM)
   */
  mountOnEnter: PropTypes.bool,

  /**
   * Unmount tabs (remove it from the DOM) when they are no longer visible
   */
  unmountOnExit: PropTypes.bool,
}

const defaultProps = {
  componentClass: 'div',
  animation: true,
  mountOnEnter: false,
  unmountOnExit: false,
}

const TabContent = (props) => {
  const { bsClass, className, componentClass, animation, mountOnEnter, unmountOnExit } = props

  // Active entries in state will be `null` unless `animation` is set. Need
  // to track active child in case keys swap and the active child changes
  // but the active key does not.
  const [setActiveKey, activeKey] = useState(null)
  const [setActiveChild, activeChild] = useState(null)

  const getContext = (tabContainer) => {
    const stateActiveKey = activeKey
    const containerActiveKey = getContainerActiveKey(tabContainer)

    const activeKey = stateActiveKey != null ? stateActiveKey : containerActiveKey
    const exiting = stateActiveKey != null && stateActiveKey !== containerActiveKey

    return {
      $bs_tabContent: {
        bsClass,
        animation,
        activeKey,
        mountOnEnter,
        unmountOnExit,
        onPaneEnter: handlePaneEnter(tabContainer),
        onPaneExited: handlePaneExited,
        exiting,
      },
    }
  }

  // componentWillReceiveProps(nextProps) {
  //   if (!nextProps.animation && this.state.activeChild) {
  //     this.setState({ activeKey: null, activeChild: null })
  //   }
  // }

  const getContainerActiveKey = (tabContainer) => {
    return tabContainer && tabContainer.activeKey
  }

  const handlePaneEnter = (tabContainer) => (child, childKey) => {
    if (!animation) {
      return false
    }

    // It's possible that this child should be transitioning out.
    if (childKey !== getContainerActiveKey(tabContainer)) {
      return false
    }

    setActiveKey(childKey)
    setActiveChild(child)

    return true
  }

  const handlePaneExited = (child) => {
    if (activeChild !== null) {
      setActiveChild(null)
      return
    }

    setActiveKey(null)
    setActiveChild(null)
  }

  return (
    <TabContainerContext.Consumer>
      {({ $bs_tabContainer }) => {
        const [bsProps, elementProps] = splitBsPropsAndOmit(props, [
          'animation',
          'mountOnEnter',
          'unmountOnExit',
        ])
        const Component = componentClass

        return (
          <TabContentContext.Provider value={getContext($bs_tabContainer)}>
            <Component
              {...elementProps}
              className={classNames(className, prefix(bsProps, 'content'))}
            />
          </TabContentContext.Provider>
        )
      }}
    </TabContainerContext.Consumer>
  )
}

TabContent.propTypes = propTypes
TabContent.defaultProps = defaultProps

export default setBsClass('tab', TabContent)
