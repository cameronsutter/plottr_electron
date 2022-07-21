import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import { Popover, ArrowContainer } from 'react-tiny-popover'

const PORTAL_ID = 'plottr-floater-portal'

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
    zIndex,
    darkMode,
  }) => {
    const SuppliedComponent = component

    const Component = useCallback(
      ({ position, childRect, popoverRect }) => {
        return hideArrow ? (
          <SuppliedComponent />
        ) : (
          <ArrowContainer
            position={position}
            childRect={childRect}
            popoverRect={popoverRect}
            arrowColor={darkMode ? '#555' : 'white'}
            arrowSize={10}
            arrowStyle={{}}
            className="popover-arrow-container"
            arrowClassName="popover-arrow"
          >
            <SuppliedComponent />
          </ArrowContainer>
        )
      },
      [component]
    )

    return (
      <Popover
        isOpen={open}
        positions={[placement, ...['left', 'right', 'bottom', 'top']]}
        padding={containerPadding}
        // FIXME: Root close on SelectLists is a bit finicky
        onClickOutside={rootClose ? onClose : () => {}}
        content={Component}
        containerStyle={{ zIndex: zIndex || 1200 }}
      >
        {children}
      </Popover>
    )
  }

  PlottrFloater.propTypes = {
    elementId: PropTypes.string,
    lastClick: PropTypes.object,
    containerPadding: PropTypes.number,
    open: PropTypes.bool,
    placement: PropTypes.string.isRequired,
    component: PropTypes.func.isRequired,
    onClose: PropTypes.func,
    rootClose: PropTypes.bool,
    children: PropTypes.oneOfType([PropTypes.node, PropTypes.array]),
    hideArrow: PropTypes.bool,
    zIndex: PropTypes.number,
    darkMode: PropTypes.bool,
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
        darkMode: selectors.isDarkModeSelector(state.present),
      }
    })(PlottrFloater)
  }

  throw new Error('Could not connect PlottrFloater')
}

export default PlottrFloaterConnector
