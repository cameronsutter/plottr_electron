import { t as i18n } from 'plottr_locales'
import { clone, sortBy } from 'lodash'
import { beat } from '../store/initialState'
import { isSeries as isSeriesString } from './books'
import * as tree from '../reducers/tree'

export function beatOneIsPrologue(sortedBookBeats) {
  if (!sortedBookBeats.length) return false
  return sortedBookBeats[0].title == i18n('Prologue')
}

export function beatName(beats, beat, sortedHierarchyLevels, hierarchyEnabled, isSeries) {
  if (!hierarchyEnabled) {
    if (isSeries) {
      return 'Beat'
    } else {
      return 'Chapter'
    }
  }

  const depth = tree.depth(beats, beat.id)
  const hierarchyLevel = sortedHierarchyLevels[depth]
  return (hierarchyLevel && hierarchyLevel.name) || `Level-${depth}`
}

export function beatTitle(
  beatIndex,
  beats,
  beat,
  sortedHierarchyLevels,
  offset,
  hierarchyEnabled,
  isSeries
) {
  const level = beatName(beats, beat, sortedHierarchyLevels, hierarchyEnabled, isSeries)
  const depth = tree.depth(beats, beat.id)

  return beat.title == 'auto'
    ? i18n(`${level} {number}`, {
        number: depth === 0 ? beatIndex + offset : beatIndex,
      })
    : beat.title
}

export function editingBeatLabel(
  beatIndex,
  beats,
  beat,
  sortedHierarchyLevels,
  offset,
  hierarchyEnabled,
  isSeries
) {
  return i18n(
    `${beatName(beats, beat, sortedHierarchyLevels, hierarchyEnabled, isSeries)} {number} title`,
    { number: beatIndex }
  )
}

export function beatPositionTitle(
  beatIndex,
  beats,
  beat,
  sortedHierarchyLevels,
  offset,
  hierarchyEnabled,
  isSeries
) {
  return i18n(
    `${beatName(beats, beat, sortedHierarchyLevels, hierarchyEnabled, isSeries)} {number}`,
    { number: beatIndex }
  )
}

export function insertBeat(position, beats, newId, bookId) {
  var newBeat = Object.assign({}, beat, { id: newId, bookId: bookId })

  beats.splice(position, 0, newBeat)
  return beats
}

export function isSeries({ bookId }) {
  return isSeriesString(bookId)
}

export const nextId = (beats) =>
  Object.values(beats)
    .flatMap((book) => tree.nextId('id')(book))
    .reduce((maxId, id) => Math.max(id - 1, maxId), 0) + 1

export function nextPositionInBook(items, bookId, parent) {
  if (!items[bookId]) return 0

  return (
    tree
      .children(items[bookId], parent || null)
      .reduce((maxPosition, item) => Math.max(item.position, maxPosition), -1) + 1
  )
}

export function positionReset(items) {
  let newTree = clone(items)

  function resetIter(id, position) {
    sortBy(tree.children(items, id), 'position').forEach(({ id }) => {
      newTree = tree.editNode(newTree, id, { position })
      ++position
      resetIter(id, 0)
    })
  }

  resetIter(null, 0)

  return newTree
}

export function moveNextToSibling(items, toMove, droppedOntoId) {
  const depthToMove = tree.depth(items, toMove)
  const siblingDepth = tree.depth(items, droppedOntoId)

  const parentId = tree.nodeParent(items, droppedOntoId)
  const sameParent = tree.nodeParent(items, toMove) === parentId
  const siblings = sortBy(tree.children(items, parentId), 'position')
  const positionDroppedOnto = siblings.findIndex(({ id }) => id === droppedOntoId)
  const positionPickedUpFrom = siblings.findIndex(({ id }) => id === toMove)

  let positionModifier = 0
  if (!sameParent || (sameParent && positionDroppedOnto < positionPickedUpFrom)) {
    positionModifier = -0.5
  } else if (positionDroppedOnto !== siblings.length) {
    positionModifier = 0.5
  }
  const modifiedPosition = positionDroppedOnto + positionModifier

  let withNodeMoved = tree.moveNode(items, toMove, parentId)

  if (depthToMove !== siblingDepth) {
    if (depthToMove - siblingDepth === 1) {
      withNodeMoved = tree.moveNode(items, toMove, droppedOntoId)
      return positionReset(tree.editNode(withNodeMoved, toMove, { position: -0.5 }))
    } else {
      return items
    }
  }

  return positionReset(tree.editNode(withNodeMoved, toMove, { position: modifiedPosition }))
}

export function reduce(beats, f, initialValue) {
  return Object.values(beats).reduce((acc, nextTree) => {
    return tree.reduce('id')(nextTree, f, acc)
  }, initialValue)
}

export function hasChildren(beats, beatId) {
  return tree.children(beats, beatId).length !== 0
}

export function maxDepth(beats) {
  return tree.reduce('id')(beats, (max, { id }) => Math.max(max, tree.depth(beats, id)), 0)
}

export const addLevelToHierarchy = (currentTree, newParentId, bookId) => {
  if (tree.findNode(currentTree, newParentId))
    throw new Error(
      `Attempted to add node with id ${newParentId} to beat tree as new parent, but it's already there`
    )
  const node = {
    ...beat,
    id: newParentId,
    bookId: bookId,
  }
  const withNewParent = tree.addNode('id')(currentTree, null, node)
  const newTopLevelNodes = tree.children(withNewParent, null)
  const newParent = newTopLevelNodes.reduce((highestIdTopLevelNode, nextTopLevelNode) => {
    if (highestIdTopLevelNode.id > nextTopLevelNode.id) return highestIdTopLevelNode
    else return nextTopLevelNode
  }, newTopLevelNodes[0])
  const oldTopLevelNodes = tree.children(currentTree, null)
  const newTree = oldTopLevelNodes.reduce((accTree, { id }) => {
    return tree.moveNode(accTree, id, newParent.id)
  }, withNewParent)
  return newTree
}

export const removeLevelFromHierarchy = (currentTree) => {
  const topLevelNodesToRemove = tree.children(currentTree, null)
  const nodesToMoveToTopLevel = topLevelNodesToRemove.flatMap(({ id }) => {
    return tree.children(currentTree, id)
  })
  const withNodesMoved = nodesToMoveToTopLevel.reduce((newTree, { id }) => {
    return tree.moveNode(newTree, id, null)
  }, currentTree)
  const newTree = topLevelNodesToRemove.reduce((newTree, { id }) => {
    return tree.deleteNode(newTree, id)
  }, withNodesMoved)
  return newTree
}

export const adjustHierarchyLevels = (targetHierarchyDepth) => (
  currentTree,
  nextParentId,
  bookId
) => {
  const maximumDepth = maxDepth(currentTree)
  if (targetHierarchyDepth === maximumDepth) {
    return currentTree
  }

  let newTree = currentTree
  if (targetHierarchyDepth > maximumDepth) {
    // We cannot exceed a depth of 3
    if (maximumDepth === 2) return currentTree
    let currentParentId = nextParentId
    for (let i = 0; i < targetHierarchyDepth - maximumDepth; ++i) {
      newTree = addLevelToHierarchy(newTree, currentParentId, bookId)
      ++currentParentId
    }
  } else {
    for (let i = 0; i < maximumDepth - targetHierarchyDepth; ++i) {
      newTree = removeLevelFromHierarchy(newTree)
    }
  }
  return newTree
}

export const beatIds = (beatTree) => {
  return tree.reduce('id')(beatTree, (acc, { id }) => [...acc, id], [])
}

export const beatsByPosition = (predicate) => (beats) => {
  function iter(beats, id) {
    const currentBeat = id === null ? [] : [tree.findNode(beats, id)]
    if (currentBeat.length && !predicate(currentBeat[0])) return currentBeat
    const sortedChildren = sortBy(tree.children(beats, id), 'position')
    return [...currentBeat, ...sortedChildren.flatMap((child) => iter(beats, child.id))]
  }
  return iter(beats, null)
}

export const numberOfPriorChildrenAtSameDepth = (beatTree, beats, beatId) => {
  if (beats.length === 0) return null
  const beatDepth = tree.depth(beatTree, beatId)
  let priorChildren = 0
  let found = false
  for (let i = 0; i < beats.length; ++i) {
    const { id } = beats[i]
    const otherBeatDepth = tree.depth(beatTree, id)
    if (id === beatId) {
      found = true
      break
    }
    if (otherBeatDepth === beatDepth) ++priorChildren
  }
  if (!found) return null
  return 1 + priorChildren
}
