import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import Floater from 'react-floater'
import { isEqual } from 'lodash'

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
  }) => {
    const [portalAdded, setPortalAdded] = useState(false)

    const firstClick = useRef(lastClick)
    const ref = useRef()

    useEffect(() => {
      if (open) {
        firstClick.current = lastClick
      }
      window.requestIdleCallback(() => {
        // We're managing the portal.
        const portal = document.querySelector(`#${PORTAL_ID}`)
        if (portal) {
          setPortalAdded(true)
        }
        if (!portalAdded && !portal) {
          const portalDiv = document.createElement('div')
          portalDiv.id = PORTAL_ID
          portalDiv.style.zIndex = 1000
          document.body.appendChild(portalDiv)
          setPortalAdded(true)
          return
        }
        if (portal) {
          for (const child of portal.children) {
            child.style.zIndex = 1000
          }
        }
      })
    }, [open, portalAdded])

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

    // We don't yet have a DOM node to render to.
    if (!portalAdded) {
      return children
    }

    return (
      <Floater
        styles={{
          options: {
            zIndex: 1000,
          },
          wrapper: {
            cursor: 'pointer',
            zIndex: null,
          },
          arrow: {
            length: 8,
            spread: 16,
          },
        }}
        containerPadding={containerPadding}
        component={Component}
        open={open}
        placement={placement}
        hideArrow={hideArrow}
        portalElement={`#${PORTAL_ID}`}
      >
        {children}
      </Floater>
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
