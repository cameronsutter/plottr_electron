import { cloneDeep } from 'lodash'
import {
  ADD_CARD,
  ADD_CARD_IN_CHAPTER,
  ADD_LINES_FROM_TEMPLATE,
  ATTACH_CHARACTER_TO_CARD,
  ATTACH_PLACE_TO_CARD,
  ATTACH_TAG_TO_CARD,
  AUTO_SORT_CHAPTER,
  CHANGE_BOOK,
  CHANGE_LINE,
  CHANGE_SCENE,
  CLEAR_TEMPLATE_FROM_TIMELINE,
  DELETE_BEAT,
  DELETE_CARD,
  DELETE_CHARACTER,
  DELETE_LINE,
  DELETE_PLACE,
  DELETE_SCENE,
  DELETE_SERIES_LINE,
  DELETE_TAG,
  EDIT_CARD_COORDINATES,
  EDIT_CARD_DETAILS,
  EDIT_SCENES_ATTRIBUTE,
  FILE_LOADED,
  NEW_FILE,
  REMOVE_CHARACTER_FROM_CARD,
  REMOVE_PLACE_FROM_CARD,
  REMOVE_TAG_FROM_CARD,
  REORDER_CARDS_IN_CHAPTER,
  REORDER_CARDS_WITHIN_LINE,
  RESET,
  RESET_TIMELINE,
} from '../constants/ActionTypes'
import { newFileCards } from '../store/newFileState'
import { card as defaultCard } from '../store/initialState'
import { nextId } from '../store/newIds'

const INITIAL_STATE = []

export default function cards(state = INITIAL_STATE, action) {
  let diffObj
  switch (action.type) {
    case ADD_CARD:
      return [Object.assign({}, defaultCard, action.card, { id: nextId(state) }), ...state]

    case ADD_CARD_IN_CHAPTER:
      // add a new card
      // and reorder cards in the chapter
      return [
        Object.assign(
          {},
          defaultCard,
          {
            ...action.newCard,
            ...(action.reorderIds ? { positionWithinLine: action.reorderIds.indexOf(null) } : {}),
          },
          { id: nextId(state) }
        ),
        ...state.map((card) => {
          const idx = action.reorderIds.indexOf(card.id)
          if (idx != -1) {
            return Object.assign({}, card, { positionWithinLine: idx })
          } else {
            return card
          }
        }),
      ]

    case ADD_LINES_FROM_TEMPLATE:
      return [...action.cards]

    case EDIT_CARD_DETAILS:
      return state.map((card) =>
        card.id === action.id ? Object.assign({}, card, action.attributes) : card
      )

    case EDIT_CARD_COORDINATES:
      diffObj = {}
      if (action.bookId == 'series') {
        diffObj.beatId = action.chapterId
      } else {
        diffObj.chapterId = action.chapterId
      }
      diffObj.lineId = action.lineId
      return state.map((card) => (card.id === action.id ? Object.assign({}, card, diffObj) : card))

    case CHANGE_LINE:
      diffObj = {}
      diffObj.lineId = action.lineId
      return state.map((card) => (card.id === action.id ? Object.assign({}, card, diffObj) : card))

    case CHANGE_SCENE:
      diffObj = {}
      if (action.bookId == 'series') {
        diffObj.beatId = action.chapterId
      } else {
        diffObj.chapterId = action.chapterId
      }
      return state.map((card) => (card.id === action.id ? Object.assign({}, card, diffObj) : card))

    case CHANGE_BOOK:
      return state.map((card) =>
        card.id === action.id ? Object.assign({}, card, { bookId: action.bookId }) : card
      )

    case REORDER_CARDS_WITHIN_LINE:
      return state.map((card) => {
        const idx = action.ids.indexOf(card.id)
        if (idx != -1) {
          return Object.assign({}, card, {
            positionWithinLine: idx,
            chapterId: action.chapterId,
            beatId: action.chapterId,
            lineId: action.lineId,
          })
        } else {
          return card
        }
      })

    case REORDER_CARDS_IN_CHAPTER:
      return state.map((card) => {
        const idxInChapter = action.newOrderInChapter.indexOf(card.id)
        let idxWithinLine = -1
        if (action.newOrderWithinLine) idxWithinLine = action.newOrderWithinLine.indexOf(card.id)

        if (idxWithinLine == -1 && idxInChapter == -1) {
          return card
        }

        let newCard = { ...card }
        // set chapterId of the new-to-this-chapter card (if any)
        if (card.id == action.newIdInChapter) {
          if (action.isSeries) {
            newCard.beatId = action.chapterId
          } else {
            newCard.chapterId = action.chapterId
          }
        }
        // change positions
        if (idxWithinLine != -1) newCard.positionWithinLine = idxWithinLine
        if (idxInChapter != -1) newCard.positionInChapter = idxInChapter

        return newCard
      })

    case AUTO_SORT_CHAPTER:
      return state.map((card) => {
        let idToMatch = card.chapterId
        if (action.isSeries) idToMatch = card.beatId
        if (card.chapterId != idToMatch) return card

        return Object.assign({}, card, { positionInChapter: 0 })
      })

    case DELETE_CARD:
      return state.filter((card) => card.id !== action.id)

    case DELETE_SCENE:
      return state.filter((card) => card.chapterId !== action.id)

    case DELETE_LINE:
      return state.filter((card) => card.lineId !== action.id)

    case DELETE_SERIES_LINE:
      return state.filter((card) => card.seriesLineId !== action.id)

    case DELETE_BEAT:
      return state.filter((card) => card.beatId !== action.id)

    case EDIT_SCENES_ATTRIBUTE:
      if (
        action.oldAttribute.type !== 'text' &&
        action.oldAttribute.name === action.newAttribute.name
      )
        return state

      return state.map((card) => {
        const newCard = cloneDeep(card)

        if (action.oldAttribute.name !== action.newAttribute.name) {
          newCard[action.newAttribute.name] = newCard[action.oldAttribute.name]
          delete newCard[action.oldAttribute.name]
        }

        // reset value to blank string
        // (if changing to something other than text type)
        // see ../selectors/customAttributes.js for when this is allowed
        if (action.oldAttribute.type === 'text') {
          let description = newCard[action.newAttribute.name]
          if (description && description.length && typeof description !== 'string') {
            description = ''
          }
          newCard[action.newAttribute.name] = description
        }
        return newCard
      })

    case ATTACH_CHARACTER_TO_CARD:
      return state.map((card) => {
        let characters = cloneDeep(card.characters)
        characters.push(action.characterId)
        return card.id === action.id ? Object.assign({}, card, { characters: characters }) : card
      })

    case REMOVE_CHARACTER_FROM_CARD:
      return state.map((card) => {
        let characters = cloneDeep(card.characters)
        characters.splice(characters.indexOf(action.characterId), 1)
        return card.id === action.id ? Object.assign({}, card, { characters: characters }) : card
      })

    case ATTACH_PLACE_TO_CARD:
      return state.map((card) => {
        let places = cloneDeep(card.places)
        places.push(action.placeId)
        return card.id === action.id ? Object.assign({}, card, { places: places }) : card
      })

    case REMOVE_PLACE_FROM_CARD:
      return state.map((card) => {
        let places = cloneDeep(card.places)
        places.splice(places.indexOf(action.placeId), 1)
        return card.id === action.id ? Object.assign({}, card, { places: places }) : card
      })

    case ATTACH_TAG_TO_CARD:
      return state.map((card) => {
        let tags = cloneDeep(card.tags)
        tags.push(action.tagId)
        return card.id === action.id ? Object.assign({}, card, { tags: tags }) : card
      })

    case REMOVE_TAG_FROM_CARD:
      return state.map((card) => {
        let tags = cloneDeep(card.tags)
        tags.splice(tags.indexOf(action.tagId), 1)
        return card.id === action.id ? Object.assign({}, card, { tags: tags }) : card
      })

    case DELETE_TAG:
      return state.map((card) => {
        if (card.tags.includes(action.id)) {
          let tags = cloneDeep(card.tags)
          tags.splice(tags.indexOf(action.id), 1)
          return Object.assign({}, card, { tags: tags })
        } else {
          return card
        }
      })

    case DELETE_CHARACTER:
      return state.map((card) => {
        if (card.characters.includes(action.id)) {
          let characters = cloneDeep(card.characters)
          characters.splice(characters.indexOf(action.id), 1)
          return Object.assign({}, card, { characters: characters })
        } else {
          return card
        }
      })

    case DELETE_PLACE:
      return state.map((card) => {
        if (card.places.includes(action.id)) {
          let places = cloneDeep(card.places)
          places.splice(places.indexOf(action.id), 1)
          return Object.assign({}, card, { places: places })
        } else {
          return card
        }
      })

    case RESET_TIMELINE:
      // isSeries & chapterIds & lineIds come from root reducer
      if (action.isSeries) {
        return state.filter((card) => !card.seriesLineId && !card.beatId)
      } else {
        return state.filter(
          (card) => action.chapterIds[card.chapterId] || action.lineIds[card.lineId]
        )
      }

    case CLEAR_TEMPLATE_FROM_TIMELINE:
      // chapterIds & lineIds come from root reducer
      // they are ones that are NOT being removed
      return state.filter(
        (card) => action.chapterIds[card.chapterId] || action.lineIds[card.lineId]
      )

    case RESET:
    case FILE_LOADED:
      return action.data.cards

    case NEW_FILE:
      return newFileCards

    default:
      return state || INITIAL_STATE
  }
}
