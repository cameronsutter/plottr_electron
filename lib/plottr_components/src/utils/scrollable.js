class Scrollable {
  getElementRef = () => null

  constructor(getElementRef) {
    this.getElementRef = getElementRef
  }

  scrollTo(x, y, behaviour = 'smooth') {}

  scrollBy(x, y, behaviour = 'smooth') {}
}

export default Scrollable
