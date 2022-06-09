import classNames from 'classnames'
import React from 'react'
import PropTypes from 'prop-types'
import elementType from 'prop-types-extra/lib/elementType'

import { TabContainerContext, TabContentContext } from './context'
import { bsClass as setBsClass, prefix, splitBsPropsAndOmit } from './utils/bootstrapUtils'
import { omit } from 'lodash'

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

  activeKey: PropTypes.any,

  bsClass: PropTypes.string,

  className: PropTypes.string,
}

const defaultProps = {
  componentClass: 'div',
  animation: true,
  mountOnEnter: false,
  unmountOnExit: false,
}

const TabContent = (props) => {
  const { bsClass, className, componentClass, animation, mountOnEnter, unmountOnExit, activeKey } =
    props

  const getContext = (tabContainer) => {
    var containerActiveKey = getContainerActiveKey(tabContainer)
    const key = activeKey || containerActiveKey
    const exiting = activeKey != null && activeKey !== containerActiveKey

    return {
      $bs_tabContent: {
        bsClass,
        animation,
        activeKey: key,
        mountOnEnter,
        unmountOnExit,
        exiting,
      },
    }
  }

  const getContainerActiveKey = (tabContainer) => {
    return tabContainer && tabContainer.activeKey
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
              {...omit(elementProps, ['activeKey', 'componentClass'])}
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
