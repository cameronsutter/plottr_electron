import { sortBy } from 'lodash'

import * as tree from './tree'
import { addCard } from '../actions/cards'
import { addBeat } from '../actions.beats'
import root from '../reducers/root'
import { addLinesFromTemplate } from '../actions/lines'
import { nextId } from './nextBeatId'

// Produce a collection of actions that, when executed, adds all
// required beats and cards to the state.
//
// Everything suffixed 1 refers to the target, and everything suffixd
// 2 refers to the template (source).
const mergeTrees = (firstAvailableBeatId, bookId, tree1, tree2, cardsToAdd, lineMapping) => {
  const mergeSubTree = (newTree, newBeatId, parent1, beat1, beat2) => {
    const childrenToAdd = tree.children(tree2, beat2)
    if (childrenToAdd.length === 0) {
      // There are no beats to add at this level.
      return [newTree, newBeatId, [], []]
    } else {
      // Find the cards from the template to add to the timeline.
      const cardsForThisBeat = cardsToAdd.filter(({ id }) => {
        return id === beat2
      })

      // If there isn't a beat in the destination, make it.
      const addNewBeatForThisBeatsCards = () => {
        const position = tree.nextPosition(newTree, parent1)
        const nextTree = tree.add('id')(newTree, parent1, {
          ...tree.findNode(newTree, beat2),
          position,
          id: newBeatId,
        })
        return [nextTree, [addBeat(bookId, parent1)], newBeatId, newBeatId + 1]
      }
      const [nextTree, addThisBeat, thisBeatId, nextAvailableBeatId] =
        beat1 === null && beat2 !== null
          ? addNewBeatForThisBeatsCards()
          : [newTree, [], beat1, newBeatId]

      // Create actions to add all the cards for this beat to the target.
      const addThisBeatsCards = cardsForThisBeat.map((card) => {
        return addCard({
          ...card,
          beatId: thisBeatId,
          lineId: lineMapping[thisBeatId],
        })
      })

      // Create an array of the children of beat 1 in the target.
      const orderedChildrenToMergeInto = sortBy(tree.children(tree1, thisBeatId), 'position')

      // Merge the children of beat2 into the target children.
      return tree.children(tree2, beat2).reduce(
        (acc, nextTemplateBeat, index) => {
          const destinationBeat = orderedChildrenToMergeInto[index]?.id || null
          const [nextTree, nextBeatId, nextAddCardsActions, nextAddBeats] = mergeSubTree(
            acc[0],
            acc[1],
            thisBeatId,
            destinationBeat,
            nextTemplateBeat.id
          )
          return [
            nextTree,
            nextBeatId,
            acc[2].concat(nextAddCardsActions),
            acc[3].concat(nextAddBeats),
          ]
        },
        [nextTree, nextAvailableBeatId, addThisBeatsCards, addThisBeat]
      )
    }
  }

  // Null is the root of a tree :)
  const [finalTree, _, addCardActions] = mergeSubTree(firstAvailableBeatId, null, null, null)
  return [finalTree, addCardActions]
}

export const applyTemplate = (fileState, bookId, template) => {
  // Create a reducer to do some heavy lifting.
  const rootReducer = root({})

  // Create the lines from the template using the existing action.
  const addLinesAction = addLinesFromTemplate(template.templateData)
  const withNewLines = rootReducer(fileState, addLinesAction)

  // Compute a mapping function to place new cards onto lines by their
  // new ids.
  //
  // ASSUME:
  //  - that lines are added to new state in the same order as they
  //    appear in the template, and
  const templateDataLines = template.templateData.lines
  const maxLineId = fileState.lines.length.reduce((acc, nextLine) => {
    return Math.max(nextLine.id, acc)
  }, fileState.lines[0].id)
  const lineMapping = templateDataLines.reducer(
    // Added lines
    (acc, nextLine, index) => {
      return {
        ...acc,
        [nextLine.id]: maxLineId + index,
      }
    },
    {}
  )
  const nextAvailableBeatId = nextId(fileState.beats)
  // Recursively process the source and destination trees, expanding
  // the destination tree when required to accomodate as many beats at
  // the same path that the source has.
  const [_mergedTree, _nextBeatId, addCardActions, addBeatActions] = mergeTrees(
    nextAvailableBeatId,
    bookId,
    fileState.beats[bookId],
    template.templateData.beats,
    template.templateData.cards,
    lineMapping
  )

  // Apply the actions to add beats and cards.
  const withNewBeatsAndCards = addBeatActions.concat(addCardActions).reduce((acc, nextAction) => {
    rootReducer(acc, nextAction)
  }, withNewLines)

  return withNewBeatsAndCards
}
