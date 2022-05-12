import classNames from 'classnames'
import React from 'react'
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

const contextTypes = {
  $bs_tabContainer: PropTypes.shape({
    activeKey: PropTypes.any,
  }),
}

class TabContent extends React.Component {
  constructor(props) {
    super(props)

    this.handlePaneEnter = this.handlePaneEnter.bind(this)
    this.handlePaneExited = this.handlePaneExited.bind(this)

    // Active entries in state will be `null` unless `animation` is set. Need
    // to track active child in case keys swap and the active child changes
    // but the active key does not.
    this.state = {
      activeKey: null,
      activeChild: null,
    }
  }

  getContext = (tabContainer) => {
    const { bsClass, animation, mountOnEnter, unmountOnExit } = this.props

    const stateActiveKey = this.state.activeKey
    const containerActiveKey = this.getContainerActiveKey(tabContainer)

    const activeKey = stateActiveKey != null ? stateActiveKey : containerActiveKey
    const exiting = stateActiveKey != null && stateActiveKey !== containerActiveKey

    return {
      $bs_tabContent: {
        bsClass,
        animation,
        activeKey,
        mountOnEnter,
        unmountOnExit,
        onPaneEnter: this.handlePaneEnter(tabContainer),
        onPaneExited: this.handlePaneExited,
        exiting,
      },
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.animation && this.state.activeChild) {
      this.setState({ activeKey: null, activeChild: null })
    }
  }

  componentWillUnmount() {
    this.isUnmounted = true
  }

  getContainerActiveKey(tabContainer) {
    return tabContainer && tabContainer.activeKey
  }

  handlePaneEnter = (tabContainer) => (child, childKey) => {
    if (!this.props.animation) {
      return false
    }

    // It's possible that this child should be transitioning out.
    if (childKey !== this.getContainerActiveKey(tabContainer)) {
      return false
    }

    this.setState({
      activeKey: childKey,
      activeChild: child,
    })

    return true
  }

  handlePaneExited(child) {
    // This might happen as everything is unmounting.
    if (this.isUnmounted) {
      return
    }

    this.setState(({ activeChild }) => {
      if (activeChild !== child) {
        return null
      }

      return {
        activeKey: null,
        activeChild: null,
      }
    })
  }

  render() {
    return (
      <TabContainerContext.Consumer>
        {({ $bs_tabContainer }) => {
          const { componentClass: Component, className, ...props } = this.props
          const [bsProps, elementProps] = splitBsPropsAndOmit(props, [
            'animation',
            'mountOnEnter',
            'unmountOnExit',
          ])

          return (
            <TabContentContext.Provider value={this.getContext($bs_tabContainer)}>
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
}

TabContent.propTypes = propTypes
TabContent.defaultProps = defaultProps
TabContent.contextTypes = contextTypes

export default setBsClass('tab', TabContent)
