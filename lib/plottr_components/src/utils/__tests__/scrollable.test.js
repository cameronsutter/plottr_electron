import { Scrollable } from '../scrollable'

describe('Scrollable', () => {
  describe('given a dummy DOM element ref getter', () => {
    describe('and an amount to scroll by', () => {
      it('should use the elements current coordinate to compute the destination', () => {
        let callsToScrollTo = []
        const dummyGetRef = () => {
          return {
            scrollTo: (options) => {
              callsToScrollTo.push(options)
            },
            scrollLeft: 10,
            scrollRight: 30,
          }
        }
        const scrollable = new Scrollable(dummyGetRef)
        scrollable.scrollBy(10, 20)
        expect(callsToScrollTo).toEqual([
          {
            top: 20,
            left: 50,
            behavior: 'smooth',
          },
        ])
      })
    })
    describe('and a negative amount to scroll by that would go negative', () => {
      it('should clip the destination to scroll to to zero', () => {
        let callsToScrollTo = []
        const dummyGetRef = () => {
          return {
            scrollTo: (options) => {
              callsToScrollTo.push(options)
            },
            scrollLeft: 10,
            scrollRight: 30,
          }
        }
        const scrollable = new Scrollable(dummyGetRef)
        scrollable.scrollBy(-30, 20)
        scrollable.scrollBy(0, -60)
        expect(callsToScrollTo).toEqual([
          {
            top: 0,
            left: 50,
            behavior: 'smooth',
          },
          {
            top: 0,
            left: 0,
            behavior: 'smooth',
          },
        ])
      })
    })
    describe('and a target coordinate', () => {
      it('should call scrollTo on the dummy element with that position', (done) => {
        let callsToScrollTo = []
        const dummyGetRef = () => {
          return {
            scrollTo: (options) => {
              callsToScrollTo.push(options)
            },
          }
        }
        const scrollable = new Scrollable(dummyGetRef)
        scrollable.scrollTo(10, 20)
        expect(callsToScrollTo).toEqual([
          {
            top: 10,
            left: 20,
            behavior: 'smooth',
          },
        ])
      })
      describe('followed by another call to scroll to another position', () => {
        it('should call scrollTo, then call a second scrollTo', () => {
          let callsToScrollTo = []
          const dummyGetRef = () => {
            return {
              scrollTo: (options) => {
                callsToScrollTo.push(options)
              },
            }
          }
          const scrollable = new Scrollable(dummyGetRef)
          scrollable.scrollTo(10, 20)
          scrollable.scrollTo(30, 20)
          expect(callsToScrollTo).toEqual([
            {
              top: 10,
              left: 20,
              behavior: 'smooth',
            },
            {
              top: 30,
              left: 20,
              behavior: 'smooth',
            },
          ])
        })
      })
      describe('followed by an amount to scroll by', () => {
        it('should call scrollTo with the final destination after the first scrollTo', () => {
          let callsToScrollTo = []
          const dummyGetRef = () => {
            return {
              scrollTo: (options) => {
                callsToScrollTo.push(options)
              },
            }
          }
          const scrollable = new Scrollable(dummyGetRef)
          scrollable.scrollTo(10, 20)
          scrollable.scrollBy(50, 20)
          expect(callsToScrollTo).toEqual([
            {
              top: 10,
              left: 20,
              behavior: 'smooth',
            },
            {
              top: 60,
              left: 40,
              behavior: 'smooth',
            },
          ])
        })
        describe('and then a second amount to scroll by', () => {
          it('should call scrollTo with the final destination after calling the first two scrollTos', () => {
            let callsToScrollTo = []
            const dummyGetRef = () => {
              return {
                scrollTo: (options) => {
                  callsToScrollTo.push(options)
                },
              }
            }
            const scrollable = new Scrollable(dummyGetRef)
            scrollable.scrollTo(10, 20)
            scrollable.scrollBy(50, 20)
            scrollable.scrollBy(-10, 10)
            expect(callsToScrollTo).toEqual([
              {
                top: 10,
                left: 20,
                behavior: 'smooth',
              },
              {
                top: 60,
                left: 40,
                behavior: 'smooth',
              },
              {
                top: 50,
                left: 50,
                behavior: 'smooth',
              },
            ])
          })
        })
      })
    })
  })
})
