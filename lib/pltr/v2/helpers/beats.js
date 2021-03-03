import { t as i18n } from 'plottr_locales'
import { clone, sortBy } from 'lodash'
import { beat } from '../store/initialState'
import { isSeries as isSeriesString } from './books'
import * as tree from '../reducers/tree'

export function beatOneIsPrologue(sortedBookBeats) {
  return sortedBookBeats[0].title == i18n('Prologue')
}

export function beatName(beats, beat, sortedHierarchyLevels) {
  const depth = tree.depth(beats, beat.id)
  const hierarchyLevel = sortedHierarchyLevels[depth]
  return (hierarchyLevel && hierarchyLevel.name) || `Level-${depth}`
}

export function beatTitle(beats, beat, sortedHierarchyLevels, offset) {
  return beat.title == 'auto'
    ? i18n(`${beatName(beats, beat, sortedHierarchyLevels)} {number}`, {
        number: beat.position + offset + 1,
      })
    : beat.title
}

export function editingBeatLabel(beats, beat, sortedHierarchyLevels, offset) {
  return i18n(`${beatName(beats, beat, sortedHierarchyLevels)} {number} title`, {
    number: beat.position + offset + 1,
  })
}

export function beatPositionTitle(beats, beat, sortedHierarchyLevels, offset) {
  return i18n(`${beatName(beats, beat, sortedHierarchyLevels)} {number}`, {
    number: beat.position + offset + 1,
  })
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

  if (depthToMove !== siblingDepth) {
    return items
  }

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

  const withNodeMoved = tree.moveNode(items, toMove, parentId)
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
  return tree.reduce('id')(
    beats,
    (max, { id }) => Math.max(max, tree.depth(beats, id)),
    Number.NEGATIVE_INFINITY
  )
}

export const addLevelToHierarchy = (currentTree, newParentId, bookId) => {
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
  } else if (targetHierarchyDepth > maximumDepth) {
    // We cannot exceed a depth of 3
    if (maximumDepth === 2) return currentTree
    return addLevelToHierarchy(currentTree, nextParentId, bookId)
  } else {
    return removeLevelFromHierarchy(currentTree)
  }
}
