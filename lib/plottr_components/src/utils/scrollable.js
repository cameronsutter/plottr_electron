import animateScrollTo from 'animated-scroll-to'

const mathematicallySensibleOr = (x, y) => {
  if (x || x === 0) return x
  return y
}

class Scrollable {
  getElementRef = () => null
  currentAnimation = Promise.resolve()
  completedCallbacks = []
  targetLeft = null
  targetTop = null
  _scrollTo = () => Promise.resolve()

  constructor(getElementRef, scrollTo = animateScrollTo) {
    this.getElementRef = getElementRef
    this._scrollTo = scrollTo
  }

  go(instant = false) {
    return this.currentAnimation.then(() => {
      return this._scrollTo([this.targetLeft, this.targetTop], {
        elementToScroll: this.getElementRef(),
        ...(instant ? { maxDuration: 0 } : {}),
      })
    })
  }

  scrollTo(leftScroll, topScroll, instant = false) {
    const ref = this.getElementRef()
    this.targetLeft = mathematicallySensibleOr(leftScroll, ref.scrollLeft)
    this.targetTop = mathematicallySensibleOr(topScroll, ref.scrollTop)

    return this.go(instant)
  }

  scrollBy(leftDelta, topDelta, instant = false) {
    const ref = this.getElementRef()

    this.targetLeft = Math.max(
      0,
      mathematicallySensibleOr(this.targetLeft, ref.scrollLeft) +
        mathematicallySensibleOr(leftDelta, 0)
    )
    this.targetTop = Math.max(
      0,
      mathematicallySensibleOr(this.targetTop, ref.scrollTop) +
        mathematicallySensibleOr(topDelta, 0)
    )

    return this.go(instant)
  }
}

export default Scrollable
