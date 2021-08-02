import {
  ADD_LINES_FROM_TEMPLATE,
  ADD_BEAT,
  AUTO_SORT_BEAT,
  CLEAR_TEMPLATE_FROM_TIMELINE,
  DELETE_BEAT,
  EDIT_BEAT_TITLE,
  FILE_LOADED,
  NEW_FILE,
  REORDER_BEATS,
  REORDER_CARDS_IN_BEAT,
  RESET,
  RESET_TIMELINE,
  DELETE_BOOK,
  INSERT_BEAT,
  COLLAPSE_BEAT,
  EXPAND_BEAT,
  SET_HIERARCHY_LEVELS,
  LOAD_BEATS,
  ADD_BOOK_FROM_TEMPLATE,
} from '../constants/ActionTypes'
import { beat as defaultBeat } from '../store/initialState'
import { newFileBeats } from '../store/newFileState'
import { positionReset, nextPositionInBook, moveNextToSibling } from '../helpers/beats'
import { associateWithBroadestScope } from '../helpers/lines'
import * as tree from './tree'
import { nextId, adjustHierarchyLevels } from '../helpers/beats'
import { clone } from 'lodash'

// bookId is:
// Union of:
//  - bookId: Number,
//  - "series": String literal,

const add = tree.addNode('id')

const defaultBeats = add(tree.newTree('id'), null, defaultBeat)

const INITIAL_STATE = {
  1: defaultBeats,
  series: defaultBeats,
}

const addNodeToState = (state, bookId, position, title, parentId) => {
  const node = {
    autoOutlineSort: true,
    bookId: bookId,
    fromTemplateId: null,
    id: nextId(state),
    position,
    time: 0,
    title: title,
    expanded: true,
  }
  const tree = state[bookId] || tree.newTree('id')
  return {
    ...state,
    [bookId]: add(tree, parentId, node),
  }
}

const beats =
  (dataReparires) =>
  (state = INITIAL_STATE, action) => {
    const actionBookId = associateWithBroadestScope(action.bookId)

    switch (action.type) {
      case ADD_BEAT: {
        // If we don't get a parent id then make this a root node
        const parentId = action.parentId || null
        const position = nextPositionInBook(state, actionBookId, parentId)
        return addNodeToState(state, actionBookId, position, action.title, parentId)
      }

      case ADD_LINES_FROM_TEMPLATE: {
        if (action.createdNewBeats) {
          return {
            ...state,
            [actionBookId]: action.currentTree,
          }
        } else {
          return state
        }
      }

      case ADD_BOOK_FROM_TEMPLATE: {
        const beats = action.templateData.beats['1']
        const idMap = {}
        // this recreates the template's tree but with new ids
        const newBeats = tree.reduce('id')(
          beats,
          (newBeatTree, nextBeat, parentId) => {
            const newId = action.nextBeatId + nextBeat.id // give it a new id
            idMap[nextBeat.id] = newId
            const newParentId = idMap[parentId] || null
            const newBeat = {
              ...clone(nextBeat),
              id: newId,
              bookId: action.newBookId, // add it to the new book
              fromTemplateId: action.templateData.id,
            }
            return tree.addNode('id')(newBeatTree, newParentId, newBeat)
          },
          tree.newTree('id')
        )
        return {
          ...state,
          [action.newBookId]: newBeats,
        }
      }

      case SET_HIERARCHY_LEVELS: {
        const { hierarchyLevels } = action
        const targetHierarchyDepth = hierarchyLevels.length - 1
        const adjustHierarchy = adjustHierarchyLevels(targetHierarchyDepth)

        return Object.keys(state).reduce((newState, bookId) => {
          return {
            ...newState,
            [bookId]: adjustHierarchy(newState[bookId], nextId(state), bookId),
          }
        }, state)
      }

      case EDIT_BEAT_TITLE:
        return {
          ...state,
          [actionBookId]: tree.editNode(state[actionBookId], action.id, { title: action.title }),
        }

      case DELETE_BOOK: {
        const newState = clone(state)
        delete newState[actionBookId]
        return newState
      }

      case DELETE_BEAT: {
        return {
          ...state,
          [actionBookId]: positionReset(tree.deleteNode(state[actionBookId], action.id)),
        }
      }

      case REORDER_BEATS:
        return {
          ...state,
          [actionBookId]: moveNextToSibling(
            state[actionBookId],
            action.beatId,
            action.beatDroppedOnto
          ),
        }

      case INSERT_BEAT: {
        if (!action.peerBeatId) {
          const newState = addNodeToState(state, actionBookId, -0.5, 'auto', null)

          return {
            ...newState,
            [actionBookId]: positionReset(newState[actionBookId]),
          }
        }
        // If we don't get a parent id then make this a root node
        const parentId = tree.nodeParent(state[actionBookId], action.peerBeatId) || null
        const position = tree.findNode(state[actionBookId], action.peerBeatId).position + 0.5 // new same-level cards now appear BEFORE so user can see they have been added
        const node = {
          autoOutlineSort: true,
          bookId: actionBookId,
          fromTemplateId: null,
          id: nextId(state),
          // Will be reset by `moveNextToSibling'
          position,
          time: 0,
          title: 'auto',
        }
        const newState = add(state[actionBookId], parentId, node)
        return {
          ...state,
          [actionBookId]: positionReset(newState),
        }
      }

      case REORDER_CARDS_IN_BEAT:
        return {
          ...state,
          [actionBookId]: tree.editNode(state[actionBookId], action.beatId, {
            autoOutlineSort: false,
          }),
        }

      case AUTO_SORT_BEAT:
        return {
          ...state,
          [actionBookId]: tree.editNode(state[actionBookId], action.id, { autoOutlineSort: true }),
        }

      case CLEAR_TEMPLATE_FROM_TIMELINE: {
        return {
          ...state,
          [actionBookId]: positionReset(
            tree.filter(
              state[actionBookId],
              ({ fromTemplateId }) => fromTemplateId !== action.templateId
            )
          ),
        }
      }

      case RESET_TIMELINE: {
        const withBeatsRemoved = {
          ...state,
          [actionBookId]: tree.newTree('id'),
        }
        const newNode = {
          id: nextId(withBeatsRemoved),
          bookId: actionBookId,
          position: 0,
          title: 'auto',
          time: 0,
          autoOutlineSort: true,
          fromTemplateId: null,
        }
        return {
          ...withBeatsRemoved,
          [actionBookId]: add(withBeatsRemoved[actionBookId], null, newNode),
        }
      }

      case COLLAPSE_BEAT:
        return {
          ...state,
          [actionBookId]: tree.editNode(state[actionBookId], action.id, { expanded: false }),
        }

      case EXPAND_BEAT:
        return {
          ...state,
          [actionBookId]: tree.editNode(state[actionBookId], action.id, { expanded: true }),
        }

      case RESET:
      case FILE_LOADED: {
        const {
          data: { beats },
        } = action
        let fixedBeats = beats
        if (!beats.series) {
          fixedBeats = {
            ...fixedBeats,
            series: tree.newTree('id'),
          }
        }
        action.data.books.allIds.forEach((id) => {
          if (!beats[id]) {
            fixedBeats = {
              ...fixedBeats,
              [id]: tree.newTree('id'),
            }
          }
        })
        return fixedBeats
      }

      case NEW_FILE:
        return newFileBeats

      case LOAD_BEATS:
        return action.beats

      default:
        return state
    }
  }

export default beats
