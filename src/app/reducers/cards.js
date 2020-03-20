import _ from 'lodash'
import { ADD_CARD, ADD_LINES_FROM_TEMPLATE, EDIT_CARD_DETAILS,
  DELETE_LINE, DELETE_SCENE,
  EDIT_CARD_COORDINATES, CHANGE_LINE, CHANGE_SCENE,
  DELETE_CARD, ATTACH_CHARACTER_TO_CARD,
  REMOVE_CHARACTER_FROM_CARD, ATTACH_PLACE_TO_CARD, REMOVE_PLACE_FROM_CARD,
  ATTACH_TAG_TO_CARD, REMOVE_TAG_FROM_CARD, DELETE_TAG, DELETE_CHARACTER,
  DELETE_PLACE, FILE_LOADED, NEW_FILE, RESET } from '../constants/ActionTypes'
import { newFileCards } from '../../../shared/newFileState'
import { card as defaultCard } from '../../../shared/initialState'
import { nextId } from 'store/newIds'

export default function cards (state, action) {
  let diffObj
  switch (action.type) {
    case ADD_CARD:
      return [Object.assign(defaultCard, {
        ...action.card,
        id: nextId(state),
      }), ...state]

    case ADD_LINES_FROM_TEMPLATE:
      return [...action.cards, ...state]

    case EDIT_CARD_DETAILS:
      var newCardDetails = {
        title: action.title,
        description: action.description
      }
      return state.map(card =>
        card.id === action.id ? Object.assign({}, card, newCardDetails) : card
      )

    case EDIT_CARD_COORDINATES:
      diffObj = {}
      if (action.bookId == 'series') {
        diffObj.seriesLineId = action.lineId
        diffObj.beatId = action.chapterId
      } else {
        diffObj.lineId = action.lineId
        diffObj.chapterId = action.chapterId
      }
      return state.map(card =>
        card.id === action.id ? Object.assign({}, card, diffObj) : card
      )

    case CHANGE_LINE:
      diffObj = {}
      if (action.bookId == 'series') {
        diffObj.seriesLineId = action.lineId
      } else {
        diffObj.lineId = action.lineId
      }
      return state.map(card =>
        card.id === action.id ? Object.assign({}, card, diffObj) : card
      )

    case CHANGE_SCENE:
      diffObj = {}
      if (action.bookId == 'series') {
        diffObj.beatId = action.chapterId
      } else {
        diffObj.chapterId = action.chapterId
      }
      return state.map(card =>
        card.id === action.id ? Object.assign({}, card, diffObj) : card
      )

    case DELETE_CARD:
      return state.filter(card =>
        card.id !== action.id
      )

    case DELETE_SCENE:
      return state.filter(card =>
        card.chapterId !== action.id
      )

    case DELETE_LINE:
      return state.filter(card =>
        card.lineId !== action.id
      )

    case ATTACH_CHARACTER_TO_CARD:
      return state.map(card => {
        let characters = _.cloneDeep(card.characters)
        characters.push(action.characterId)
        return card.id === action.id ? Object.assign({}, card, {characters: characters}) : card
      })

    case REMOVE_CHARACTER_FROM_CARD:
      return state.map(card => {
        let characters = _.cloneDeep(card.characters)
        characters.splice(characters.indexOf(action.characterId), 1)
        return card.id === action.id ? Object.assign({}, card, {characters: characters}) : card
      })

    case ATTACH_PLACE_TO_CARD:
      return state.map(card => {
        let places = _.cloneDeep(card.places)
        places.push(action.placeId)
        return card.id === action.id ? Object.assign({}, card, {places: places}) : card
      })

    case REMOVE_PLACE_FROM_CARD:
      return state.map(card => {
        let places = _.cloneDeep(card.places)
        places.splice(places.indexOf(action.placeId), 1)
        return card.id === action.id ? Object.assign({}, card, {places: places}) : card
      })

    case ATTACH_TAG_TO_CARD:
      return state.map(card => {
        let tags = _.cloneDeep(card.tags)
        tags.push(action.tagId)
        return card.id === action.id ? Object.assign({}, card, {tags: tags}) : card
      })

    case REMOVE_TAG_FROM_CARD:
      return state.map(card => {
        let tags = _.cloneDeep(card.tags)
        tags.splice(tags.indexOf(action.tagId), 1)
        return card.id === action.id ? Object.assign({}, card, {tags: tags}) : card
      })

    case DELETE_TAG:
      return state.map(card => {
        if (card.tags.includes(action.id)) {
          let tags = _.cloneDeep(card.tags)
          tags.splice(tags.indexOf(action.id), 1)
          return Object.assign({}, card, {tags: tags})
        } else {
          return card
        }
      })

    case DELETE_CHARACTER:
      return state.map(card => {
        if (card.characters.includes(action.id)) {
          let characters = _.cloneDeep(card.characters)
          characters.splice(characters.indexOf(action.id), 1)
          return Object.assign({}, card, {characters: characters})
        } else {
          return card
        }
      })

    case DELETE_PLACE:
      return state.map(card => {
        if (card.places.includes(action.id)) {
          let places = _.cloneDeep(card.places)
          places.splice(places.indexOf(action.id), 1)
          return Object.assign({}, card, {places: places})
        } else {
          return card
        }
      })

    case RESET:
    case FILE_LOADED:
      return action.data.cards

    case NEW_FILE:
      return newFileCards

    default:
      return state || []
  }
}
