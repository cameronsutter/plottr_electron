import Scrollable from '../scrollable'

describe('Scrollable', () => {
  describe('given a dummy DOM element ref getter', () => {
    describe('and an amount to scroll by', () => {
      describe('and an expressed intention to move instantly', () => {
        it('should call `scrollTo` with `maxDuration` set to zero', async () => {
          let callsToScrollTo = []
          const dummyRef = {}
          const dummyGetRef = () => {
            return dummyRef
          }
          const scrollable = new Scrollable(dummyGetRef, (...options) => {
            callsToScrollTo.push(options)
          })
          await scrollable.scrollTo(10, 20, true)
          expect(callsToScrollTo).toEqual([
            [[10, 20], { elementToScroll: dummyRef, maxDuration: 0 }],
          ])
        })
      })
      it('should use the elements current coordinate to compute the destination', async () => {
        let callsToScrollTo = []
        const dummyRef = {
          scrollLeft: 10,
          scrollTop: 30,
        }
        const dummyGetRef = () => {
          return dummyRef
        }
        const scrollable = new Scrollable(dummyGetRef, (...options) => {
          callsToScrollTo.push(options)
        })
        await scrollable.scrollBy(10, 20)
        expect(callsToScrollTo).toEqual([[[20, 50], { elementToScroll: dummyRef }]])
      })
    })
    describe('and a negative amount to scroll by that would go negative', () => {
      it('should clip the destination to scroll to to zero', async () => {
        let callsToScrollTo = []
        const dummyRef = {
          scrollLeft: 10,
          scrollTop: 30,
        }
        const dummyGetRef = () => {
          return dummyRef
        }
        const scrollable = new Scrollable(dummyGetRef, (...options) => {
          callsToScrollTo.push(options)
        })
        await scrollable.scrollBy(-30, 20)
        await scrollable.scrollBy(0, -60)
        expect(callsToScrollTo).toEqual([
          [[0, 50], { elementToScroll: dummyRef }],
          [[0, 0], { elementToScroll: dummyRef }],
        ])
      })
    })
    describe('and a target coordinate', () => {
      it('should call scrollTo on the dummy element with that position', async () => {
        let callsToScrollTo = []
        const dummyRef = {}
        const dummyGetRef = () => {
          return dummyRef
        }
        const scrollable = new Scrollable(dummyGetRef, (...options) => {
          callsToScrollTo.push(options)
        })
        await scrollable.scrollTo(10, 20)
        expect(callsToScrollTo).toEqual([[[10, 20], { elementToScroll: dummyRef }]])
      })
      describe('followed by another call to scroll to another position', () => {
        it('should call scrollTo, then call a second scrollTo', async () => {
          let callsToScrollTo = []
          const dummyRef = {}
          const dummyGetRef = () => {
            return dummyRef
          }
          const scrollable = new Scrollable(dummyGetRef, (...options) => {
            callsToScrollTo.push(options)
          })
          await scrollable.scrollTo(10, 20)
          await scrollable.scrollTo(30, 20)
          expect(callsToScrollTo).toEqual([
            [[10, 20], { elementToScroll: dummyRef }],
            [[30, 20], { elementToScroll: dummyRef }],
          ])
        })
      })
      describe('followed by an amount to scroll by', () => {
        it('should call scrollTo with the final destination after the first scrollTo', async () => {
          let callsToScrollTo = []
          const dummyRef = {}
          const dummyGetRef = () => {
            return dummyRef
          }
          const scrollable = new Scrollable(dummyGetRef, (...options) => {
            callsToScrollTo.push(options)
          })
          await scrollable.scrollTo(10, 20)
          await scrollable.scrollBy(50, 20)
          expect(callsToScrollTo).toEqual([
            [[10, 20], { elementToScroll: dummyRef }],
            [[60, 40], { elementToScroll: dummyRef }],
          ])
        })
        describe('and then a second amount to scroll by', () => {
          it('should call scrollTo with the final destination after calling the first two scrollTos', async () => {
            let callsToScrollTo = []
            const dummyRef = {}
            const dummyGetRef = () => {
              return dummyRef
            }
            const scrollable = new Scrollable(dummyGetRef, (...options) => {
              callsToScrollTo.push(options)
            })
            await scrollable.scrollTo(10, 20)
            await scrollable.scrollBy(50, 20)
            await scrollable.scrollBy(-10, 10)
            expect(callsToScrollTo).toEqual([
              [[10, 20], { elementToScroll: dummyRef }],
              [[60, 40], { elementToScroll: dummyRef }],
              [[50, 50], { elementToScroll: dummyRef }],
            ])
          })
        })
      })
    })
  })
})
