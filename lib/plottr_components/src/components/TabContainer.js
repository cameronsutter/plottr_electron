import React from 'react'
import PropTypes from 'prop-types'
import { uncontrollable } from 'uncontrollable'
import { TabContainerContext } from './context'

const TAB = 'tab'
const PANE = 'pane'

const idPropType = PropTypes.oneOfType([PropTypes.string, PropTypes.number])

const propTypes = {
  /**
   * HTML id attribute, required if no `generateChildId` prop
   * is specified.
   */
  id(props, ...args) {
    let error = null

    if (!props.generateChildId) {
      error = idPropType(props, ...args)

      if (!error && !props.id) {
        error = new Error(
          'In order to properly initialize Tabs in a way that is accessible ' +
            'to assistive technologies (such as screen readers) an `id` or a ' +
            '`generateChildId` prop to TabContainer is required'
        )
      }
    }

    return error
  },

  /**
   * A function that takes an `eventKey` and `type` and returns a unique id for
   * child tab `<NavItem>`s and `<TabPane>`s. The function _must_ be a pure
   * function, meaning it should always return the _same_ id for the same set
   * of inputs. The default value requires that an `id` to be set for the
   * `<TabContainer>`.
   *
   * The `type` argument will either be `"tab"` or `"pane"`.
   *
   * @defaultValue (eventKey, type) => `${this.props.id}-${type}-${key}`
   */
  generateChildId: PropTypes.func,

  /**
   * A callback fired when a tab is selected.
   *
   * @controllable activeKey
   */
  onSelect: PropTypes.func,

  /**
   * The `eventKey` of the currently active tab.
   *
   * @controllable onSelect
   */
  activeKey: PropTypes.any,
}

class TabContainer extends React.Component {
  getContext() {
    const { activeKey, onSelect, generateChildId, id } = this.props

    const getId = generateChildId || ((key, type) => (id ? `${id}-${type}-${key}` : null))

    return {
      $bs_tabContainer: {
        activeKey,
        onSelect,
        getTabId: (key) => getId(key, TAB),
        getPaneId: (key) => getId(key, PANE),
      },
    }
  }

  render() {
    const { children, ...props } = this.props

    const context = this.getContext()

    return (
      <TabContainerContext.Provider value={context}>
        {React.cloneElement(React.Children.only(children), props)}
      </TabContainerContext.Provider>
    )
  }
}

TabContainer.propTypes = propTypes

export default uncontrollable(TabContainer, { activeKey: 'onSelect' })
