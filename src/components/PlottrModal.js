import React, { useMemo } from 'react'
import PropTypes from 'react-proptypes'
import Modal from 'react-modal'
import cx from 'classnames'
import { first } from 'lodash'

import { checkDependencies } from './checkDependencies'

// prevents the useMemo from getting a new object reference
// on each render if no styles is passed in
const defaultStyles = {}

const PlottrModalConnector = (connector) => {
  const PlottrModal = ({ isDarkMode, children, styles = defaultStyles, ...props }) => {
    const selector = first(
      connector.platform.rootElementSelectors.filter((selector) => {
        return document.querySelector(selector)
      })
    )
    if (selector) Modal.setAppElement(selector)
    const mergedStyles = useMemo(() => {
      return {
        overlay: {
          ...Modal.defaultStyles.overlay,
          ...styles.overlay,
        },
        content: {
          ...Modal.defaultStyles.content,
          ...styles.content,
        },
      }
    }, [styles])

    return (
      <Modal {...props} styles={mergedStyles} classNames={cx({ darkmode: isDarkMode })}>
        {children}
      </Modal>
    )
  }

  PlottrModal.propTypes = {
    isDarkMode: PropTypes.bool,
    children: PropTypes.node,
    styles: PropTypes.object,
    isOpen: PropTypes.bool,
    onRequestClose: PropTypes.func,
  }

  const { redux } = connector

  checkDependencies({ redux })

  if (redux) {
    const { connect } = redux

    return connect((state) => ({
      isDarkMode: state.present.ui.darkMode,
    }))(PlottrModal)
  }

  throw new Error('No connector found for PlottrModal')
}

export default PlottrModalConnector
