import React, { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import Floater from 'react-floater'
import { isEqual } from 'lodash'

const PlottrFloaterConnector = (connector) => {
  const PlottrFloater = ({
    lastClick,
    containerPadding,
    open,
    placement,
    component,
    onClose,
    rootClose,
    children,
    hideArrow,
  }) => {
    const firstClick = useRef(lastClick)
    const ref = useRef()

    useEffect(() => {
      if (open) {
        firstClick.current = lastClick
      }
    }, [open])

    useEffect(() => {
      if (!rootClose || !ref.current || !onClose || !open) return

      if (!isEqual(firstClick.current, lastClick)) {
        const { x, y } = lastClick
        const { left, right, top, bottom } = ref.current.getBoundingClientRect()
        if (!(x >= left && x <= right && y >= top && y <= bottom)) {
          onClose()
        }
      }
    }, [lastClick, open, rootClose, onClose])

    const SuppliedComponent = component

    const Component = (props) => {
      return (
        <div ref={ref}>
          <SuppliedComponent {...props} />
        </div>
      )
    }

    return (
      <Floater
        styles={{
          options: {
            zIndex: 1000,
          },
        }}
        containerPadding={containerPadding}
        component={Component}
        open={open}
        placement={placement}
        hideArrow={hideArrow}
      >
        {children}
      </Floater>
    )
  }

  PlottrFloater.propTypes = {
    lastClick: PropTypes.object,
    containerPadding: PropTypes.number,
    open: PropTypes.bool,
    placement: PropTypes.string.isRequired,
    component: PropTypes.func.isRequired,
    onClose: PropTypes.func,
    rootClose: PropTypes.func,
    children: PropTypes.oneOfType([PropTypes.node, PropTypes.array]),
    hideArrow: PropTypes.bool,
  }

  const {
    pltr: { selectors },
    redux,
  } = connector

  if (redux) {
    const { connect } = redux

    return connect((state) => {
      return {
        lastClick: selectors.lastClickSelector(state.present),
      }
    })(PlottrFloater)
  }

  throw new Error('Could not connect PlottrFloater')
}

export default PlottrFloaterConnector
