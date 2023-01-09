import { sortBy } from 'lodash'

import * as tree from '../reducers/tree'
import { addCard } from '../actions/cards'
import { addBeat } from '../actions/beats'
import root from '../reducers/root'
import { addLinesFromTemplate } from '../actions/lines'
import { nextId } from './nextBeatId'

const children = (beatTree, id) => {
  return tree.children(beatTree, id)
}

const maxDepthIncludingRoot = (beatTree, nodeId) => {
  return 1 + tree.maxDepth('id')(beatTree, nodeId)
}

const depth = (beatTree, nodeId) => {
  if (nodeId === null) {
    return 0
  }

  return 1 + tree.depth(beatTree, nodeId)
}

// Compute a two-element array that indicates at what depth to start
// merging into the:
//  - destination, and
//  - from the source.
//
// e.g. if the array is [0, 0], we should start merging into level 0
// of the destination tree, from level 0 of the source tree onwards.
//
// e.g. if the array is [1, 2], we should start merging into level 1
// of the destination tree from level 2 of the source tree onwards.
//
// Note: only the parent of a tree has a depth of 0.
const computeMergeStart = (tree1, tree2, bias2) => {
  const depth1 = maxDepthIncludingRoot(tree1, null)
  const depth2 = maxDepthIncludingRoot(tree2, null)

  switch (depth1) {
    case 1:
      switch (depth2) {
        case 1:
          switch (bias2) {
            case 'top':
            case 'middle':
            case 'bottom':
              return [0, 0]
            default:
              throw new Error(`Invalid merge biase: ${bias2}`)
          }
        case 2:
          switch (bias2) {
            case 'top':
            case 'middle':
              return [0, 0]
            case 'bottom':
              return [0, 1]
            default:
              throw new Error(`Invalid merge biase: ${bias2}`)
          }
        case 3:
          switch (bias2) {
            case 'top':
              return [0, 0]
            case 'middle':
              return [0, 1]
            case 'bottom':
              return [0, 2]
            default:
              throw new Error(`Invalid merge biase: ${bias2}`)
          }
        default:
          throw new Error(`Invalid tree depth for source: ${depth2}`)
      }
    case 2:
      switch (depth2) {
        case 1:
          switch (bias2) {
            case 'top':
              return [0, 0]
            case 'middle':
              return [1, 0]
            case 'bottom':
              return [2, 0]
            default:
              throw new Error(`Invalid merge biase: ${bias2}`)
          }
        case 2:
          switch (bias2) {
            case 'top':
            case 'middle':
            case 'bottom':
              return [0, 0]
            default:
              throw new Error(`Invalid merge biase: ${bias2}`)
          }
        case 3:
          switch (bias2) {
            case 'top':
            case 'middle':
              return [0, 0]
            case 'bottom':
              return [0, 1]
            default:
              throw new Error(`Invalid merge biase: ${bias2}`)
          }
        default:
          throw new Error(`Invalid tree depth for source: ${depth2}`)
      }
    case 3:
      switch (depth2) {
        case 1:
          switch (bias2) {
            case 'top':
              return [0, 0]
            case 'middle':
              return [1, 0]
            case 'bottom':
              return [2, 0]
            default:
              throw new Error(`Invalid merge biase: ${bias2}`)
          }
        case 2:
          switch (bias2) {
            case 'top':
              return [0, 0]
            case 'middle':
            case 'bottom':
              return [0, 1]
            default:
              throw new Error(`Invalid merge biase: ${bias2}`)
          }
        case 3:
          switch (bias2) {
            case 'top':
            case 'middle':
            case 'bottom':
              return [0, 0]
            default:
              throw new Error(`Invalid merge biase: ${bias2}`)
          }
        default:
          throw new Error(`Invalid tree depth for source: ${depth2}`)
      }
    default:
      throw new Error(`Invalid tree depth for destination: ${depth1}`)
  }
}

// Produce a collection of actions that, when executed, adds all
// required beats and cards to the state.
//
// Everything suffixed 1 refers to the target, and everything suffixd
// 2 refers to the template (source).
const mergeTrees = (firstAvailableBeatId, bookId, tree1, tree2, cardsToAdd, lineMapping, bias2) => {
  const maxDepth1 = maxDepthIncludingRoot(tree1, null)
  const [startDepth1, startDepth2] = computeMergeStart(tree1, tree2, bias2)

  const mergeSubTree = (newTree, newBeatId, parent1, beat1, beat2) => {
    const depth1 = depth(tree1, beat1)
    const depth2 = depth(tree2, beat2)
    const addingABeat = parent1 && !beat1

    // We fell off the bottom of the destination tree.
    if (depth1 > maxDepth1) {
      return [newTree, newBeatId, [], []]
    }

    // We would add more levels from the template than there are in the source
    if (depth2 - startDepth2 > maxDepth1) {
      return [newTree, newBeatId, [], []]
    }

    // Destination tree node isn't at the right depth yet.
    if (depth1 < startDepth1 && !addingABeat) {
      const orderedChildrenToMergeInto = sortBy(children(tree1, beat1), 'position')
      const childToMergeInto = orderedChildrenToMergeInto[0]
      return mergeSubTree(newTree, newBeatId, beat1, childToMergeInto.id, beat2)
    }

    // Source tree node isn't at the right depth yet, but the
    // destination must be (see previous if-statement).
    if (depth2 < startDepth2) {
      const orderedChildrenToMerge = sortBy(children(tree2, beat2))
      const childToMerge = orderedChildrenToMerge[0]
      return mergeSubTree(newTree, newBeatId, parent1, beat1, childToMerge.id)
    }

    // Find the cards from the template to add to the timeline.
    const cardsForThisBeat = cardsToAdd.filter(({ beatId }) => {
      return beatId === beat2
    })

    // If there isn't a beat in the destination, make it.
    const addNewBeatForThisBeatsCards = () => {
      const position = tree.nextPosition(newTree, parent1)
      const nextTree = tree.addNode('id')(newTree, parent1, {
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
    const addThisBeatsCards =
      depth2 === startDepth2
        ? []
        : cardsForThisBeat.map((card) => {
            return addCard({
              ...card,
              beatId: thisBeatId,
              lineId: lineMapping[card.lineId],
            })
          })

    // Create an array of the children of beat 1 in the target.
    const orderedChildrenToMergeInto = sortBy(children(tree1, thisBeatId), 'position')

    // Merge the children of beat2 into the target children.
    const orderedChildren = sortBy(children(tree2, beat2), 'position')
    return orderedChildren.reduce(
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

  // Null is the root of a tree :)
  const [finalTree, finalNextBeatId, addCardActions, addBeatActions] = mergeSubTree(
    tree1,
    firstAvailableBeatId,
    null,
    null,
    null
  )
  return [finalTree, finalNextBeatId, addCardActions, addBeatActions]
}

// ASSUME: that there's one book in the template(!)
export const applyTemplate = (fileState, bookId, template) => {
  // Create a reducer to do some heavy lifting.
  const rootReducer = root({})

  // Create the lines from the template using the existing action.
  // NOTE: The old action adds the cards too.
  const addLinesAction = addLinesFromTemplate({ ...template.templateData, cards: [] }, template.id)
  const withNewLines = rootReducer(fileState, addLinesAction)

  // Compute a mapping function to place new cards onto lines by their
  // new ids.
  //
  // ASSUME:
  //  - that lines are added to new state in the same order as they
  //    appear in the template, and
  const templateDataLines = template.templateData.lines
  const maxLineId = fileState.lines.reduce((acc, nextLine) => {
    return Math.max(nextLine.id, acc)
  }, fileState.lines[0].id)
  const lineMapping = templateDataLines.reduce(
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
    Object.values(template.templateData.beats)[0],
    template.templateData.cards,
    lineMapping,
    template.mergeBias || 'top'
  )

  // Apply the actions to add beats and cards.
  const withNewBeatsAndCards = addBeatActions.concat(addCardActions).reduce((acc, nextAction) => {
    return rootReducer(acc, nextAction)
  }, withNewLines)

  return withNewBeatsAndCards
}
