const mathematicallySensibleOr = (x, y) => {
  if (x || x === 0) return x
  return y
}

class Scrollable {
  getElementRef = () => null
  targetLeft = null
  targetTop = null

  constructor(getElementRef) {
    this.getElementRef = getElementRef
  }

  scrollTo(left, top, behavior = 'smooth') {
    this.targetLeft = left
    this.targetTop = top
    this.getElementRef().scrollTo({
      top: this.targetTop,
      left: this.targetLeft,
      behavior,
    })
  }

  scrollBy(leftDelta, topDelta, behavior = 'smooth') {
    const ref = this.getElementRef()

    this.targetLeft = Math.max(
      0,
      mathematicallySensibleOr(this.targetLeft, ref.scrollLeft) + leftDelta
    )
    this.targetTop = Math.max(0, mathematicallySensibleOr(this.targetTop, ref.scrollTop) + topDelta)

    ref.scrollTo({
      left: this.targetLeft,
      top: this.targetTop,
      behavior,
    })
  }
}

export default Scrollable
