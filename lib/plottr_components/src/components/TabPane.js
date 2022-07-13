import classNames from 'classnames'
import React from 'react'
import PropTypes from 'prop-types'
import elementType from 'prop-types-extra/lib/elementType'
import warning from 'warning'

import { bsClass, getClassSet, prefix, splitBsPropsAndOmit } from './utils/bootstrapUtils'

import { TabContainerContext } from './context'

const propTypes = {
  /**
   * Uniquely identify the `<TabPane>` among its siblings.
   */
  eventKey: PropTypes.any,

  /** @private * */
  id: PropTypes.string,

  /** @private * */
  'aria-labelledby': PropTypes.string,

  /**
   * If not explicitly specified and rendered in the context of a
   * `<TabContent>`, the `bsClass` of the `<TabContent>` suffixed by `-pane`.
   * If otherwise not explicitly specified, `tab-pane`.
   */
  bsClass: PropTypes.string,

  tabContent: PropTypes.object,
  tabContainer: PropTypes.object,

  className: PropTypes.string,
}

class TabPane extends React.Component {
  constructor(props, context) {
    super(props, context)

    this.in = false
  }

  isActive() {
    const tabContent = this.props.tabContent
    const activeKey = tabContent && tabContent.activeKey

    return this.props.eventKey === activeKey
  }

  render() {
    const { eventKey, className, tabContent, tabContainer, ...props } = this.props

    const [bsProps, elementProps] = splitBsPropsAndOmit(props, ['animation'])

    const active = this.isActive()

    if (!active) {
      return null
    }

    if (tabContent) {
      bsProps.bsClass = prefix(tabContent, 'pane')
    }

    const classes = {
      ...getClassSet(bsProps),
      active,
    }

    if (tabContainer) {
      warning(
        !elementProps.id && !elementProps['aria-labelledby'],
        'In the context of a `<TabContainer>`, `<TabPanes>` are given ' +
          'generated `id` and `aria-labelledby` attributes for the sake of ' +
          'proper component accessibility. Any provided ones will be ignored. ' +
          'To control these attributes directly provide a `generateChildId` ' +
          'prop to the parent `<TabContainer>`.'
      )

      elementProps.id = tabContainer.getPaneId(eventKey)
      elementProps['aria-labelledby'] = tabContainer.getTabId(eventKey)
    }

    const pane = (
      <div
        {...elementProps}
        role="tabpanel"
        aria-hidden={!active}
        className={classNames(className, classes)}
      />
    )

    return (
      <TabContainerContext.Provider
        value={{
          $bs_tabContainer: null,
        }}
      >
        {pane}
      </TabContainerContext.Provider>
    )
  }
}

TabPane.propTypes = propTypes

export default bsClass('tab-pane', TabPane)
