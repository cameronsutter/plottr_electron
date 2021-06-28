import React, { useState, cloneElement, useEffect } from 'react'
import { PropTypes } from 'prop-types'
import { Overlay } from 'react-bootstrap'

const OverlayTrigger = ({
  placement,
  rootClose,
  children,
  overlay,
  trigger,
  containerPadding,
  open,
  onHide,
}) => {
  const [show, setShow] = useState(false)
  const [targetRef, setTargetRef] = useState(null)

  const childProps = {
    ...children.props,
    ref: (ref) => {
      setTargetRef(ref)
    },
    onClick: (event) => {
      if (trigger !== 'click') return
      setShow(true)
      const childOnClick = children.props.onClick
      if (childOnClick && typeof childOnClick === 'function') {
        children.props.onClick(event)
      }
    },
    onMouseOver: (event) => {
      if (trigger !== 'hover') return
      setShow(true)
      const childOnMouseOver = children.props.onMouseOver
      if (childOnMouseOver && typeof childOnMouseOver === 'function') {
        children.props.onMouseOver(event)
      }
    },
    onMouseOut: (event) => {
      if (trigger !== 'hover') return
      setShow(false)
      const childOnMouseOut = children.props.onMouseOut
      if (childOnMouseOut && typeof childOnMouseOut === 'function') {
        children.props.onMouseOut(event)
      }
    },
  }

  useEffect(() => {
    if (typeof overlay !== 'function') {
      console.error(
        `Attempted to use overlay of type: ${typeof overlay} in ${children}.  This is deprecated because it doesn't play nicely with Redux.`
      )
    }
  }, [overlay])

  const shouldShow = open || (open === undefined && show)

  return (
    <>
      {cloneElement(children, childProps)}
      <Overlay
        placement={placement}
        show={shouldShow}
        onHide={() => {
          setShow(false)
          if (onHide) onHide()
        }}
        target={() => targetRef}
        rootClose={rootClose}
        containerPadding={containerPadding}
      >
        {typeof overlay === 'function' ? overlay() : overlay}
      </Overlay>
    </>
  )
}

OverlayTrigger.propTypes = {
  placement: PropTypes.oneOf(['top', 'bottom', 'right', 'left']).isRequired,
  trigger: PropTypes.oneOf(['click', 'hover']).isRequired,
  children: PropTypes.node.isRequired,
  rootClose: PropTypes.bool,
  overlay: PropTypes.func.isRequired,
  containerPadding: PropTypes.number,
  open: PropTypes.bool,
  onHide: PropTypes.func,
}

export default OverlayTrigger
