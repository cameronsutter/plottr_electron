import { sortBy } from 'lodash'

import * as tree from './tree'
import { addCard } from '../actions/cards'
import { addBeat } from '../actions.beats'
import root from '../reducers/root'
import { addLinesFromTemplate } from '../actions/lines'
import { nextId } from './nextBeatId'

const mergeTrees = (firstAvailableBeatId, bookId, tree1, tree2, cardsToAdd, lineMapping) => {
  const mergeSubTree = (newTree, newBeatId, parent1, beat1, beat2) => {
    const childrenToAdd = tree.children(tree2, beat2)
    if (childrenToAdd.length === 0) {
      return [newTree, []]
    } else {
      const cardsForThisBeat = cardsToAdd.filter(({ id }) => {
        return id === beat2
      })
      const addNewBeatForThisBeatsCards = () => {
        return [addBeat(bookId, parent1), newBeatId, newBeatId + 1]
      }
      const [nextTree, thisBeatId, nextBeatId] =
        beat1 === null && beat2 !== null ? addNewBeatForThisBeatsCards() : [beat1, beat1, newBeatId]
      const addThisBeatsCards = cardsForThisBeat.map((card) => {
        return addCard({
          ...card,
          beatId: thisBeatId,
          lineId: lineMapping[thisBeatId],
        })
      })
      const orderedChildrenToMergeInto = sortBy(tree.children(tree1, thisBeatId), 'position')
      return tree.children(tree2, beat2).reduce(
        (acc, nextTemplateBeat, index) => {
          const destinationBeat = orderedChildrenToMergeInto[index] || null
          const [nextTree, nextBeatId, nextAddCardsActions, nextAddBeats] = mergeSubTree(
            acc[0],
            acc[1],
            thisBeatId,
            destinationBeat
          )
          return [
            nextTree,
            nextBeatId,
            acc[2].concat(nextAddCardsActions),
            acc[3].concat(nextAddBeats),
          ]
        },
        [nextTree, nextBeatId, addThisBeatsCards, addThisbeat]
      )
    }
  }

  // Null is the root of a tree :)
  const [finalTree, _, addCardActions] = mergeSubTree(firstAvailableBeatId, null, null, null)
  return [finalTree, addCardActions]
}

export const applyTemplate = (fileState, bookId, template) => {
  const rootReducer = root({})
  const addLinesAction = addLinesFromTemplate(template.templateData)
  const withNewLines = rootReducer(fileState, addLinesAction)
  const templateDataLines = template.templateData.lines
  // ASSUME:
  //  - that lines are added to new state in the same order as they
  //    appear in the template, and
  const lineMapping = templateDataLines.reducer(
    // Added lines
    (acc, nextLine, index) => {
      return {
        ...acc,
        [nextLine.id]: fileState.lines.length + index,
      }
    },
    // Original lines
    fileState.lines.reduce((acc, nextLine) => {
      return {
        ...acc,
        [nextLine.id]: nextLine.id,
      }
    })
  )
  const nextAvailableBeatId = nextId(fileState)
  const [mergedTree, addCardActions] = mergeTrees(
    nextAvailableBeatId,
    bookId,
    fileState.beats[bookId],
    template.templateData.beats,
    template.templateData.cards,
    lineMapping
  )
  // Set the beat tree, then add the cards.
  return withNewLines
}
