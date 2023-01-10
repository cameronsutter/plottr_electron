import React, { useCallback, useState } from 'react'
import PropTypes from 'prop-types'
import { Popover, ArrowContainer } from 'react-tiny-popover'
import cx from 'classnames'

const PORTAL_ID = 'plottr-floater-portal'

const PlottrFloaterConnector = (connector) => {
  const PlottrFloater = ({
    lastClick,
    containerPadding,
    open,
    placement,
    align,
    contentLocation,
    component,
    onClose,
    rootClose,
    children,
    hideArrow,
    zIndex,
    darkMode,
    positionLeftMost,
  }) => {
    const SuppliedComponent = component

    const Component = useCallback(
      ({ position, childRect, popoverRect, boundaryRect }) => {
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
            className={cx('popover-arrow-container', {
              resize:
                (boundaryRect.height == boundaryRect.bottom &&
                  boundaryRect.width == boundaryRect.right) ||
                (boundaryRect.height == boundaryRect.top &&
                  boundaryRect.width == boundaryRect.right) ||
                (boundaryRect.height == boundaryRect.bottom &&
                  boundaryRect.width == boundaryRect.left) ||
                (boundaryRect.height == boundaryRect.top &&
                  boundaryRect.width == boundaryRect.left),
            })}
            arrowClassName="popover-arrow"
          >
            <SuppliedComponent />
          </ArrowContainer>
        )
      },
      [component]
    )

    const getPositions = () => {
      if (positionLeftMost) {
        return ['bottom']
      } else if (placement) {
        return [placement, ...['left', 'right', 'bottom', 'top']]
      } else {
        return ['left', 'right', 'bottom', 'top']
      }
    }

    return (
      <Popover
        isOpen={open}
        positions={getPositions()}
        align={positionLeftMost ? 'start' : align || 'center'}
        contentLocation={contentLocation}
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
    align: PropTypes.string,
    contentLocation: PropTypes.func,
    component: PropTypes.func.isRequired,
    onClose: PropTypes.func,
    rootClose: PropTypes.bool,
    children: PropTypes.oneOfType([PropTypes.node, PropTypes.array]),
    hideArrow: PropTypes.bool,
    zIndex: PropTypes.number,
    darkMode: PropTypes.bool,
    positionLeftMost: PropTypes.bool,
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
