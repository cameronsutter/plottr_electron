import _ from 'lodash'
import { ADD_PLACE, EDIT_PLACE, FILE_LOADED, NEW_FILE, RESET,
  ATTACH_PLACE_TO_CARD, REMOVE_PLACE_FROM_CARD,
  ATTACH_PLACE_TO_NOTE, REMOVE_PLACE_FROM_NOTE,
  DELETE_NOTE, DELETE_CARD, DELETE_PLACE, DELETE_IMAGE, EDIT_PLACES_ATTRIBUTE } from '../constants/ActionTypes'
import { place } from '../../../shared/initialState'
import { newFilePlaces } from '../../../shared/newFileState'
import { nextId } from 'store/newIds'

const initialState = [place]

export default function places (state = initialState, action) {
  switch (action.type) {
    case ADD_PLACE:
      return [...state, {
        ...place,
        id: nextId(state),
        name: action.name,
        description: action.description,
        notes: action.notes
      }]

    case EDIT_PLACE:
      return state.map(place =>
        place.id === action.id ? Object.assign({}, place, action.attributes) : place
      )

    case EDIT_PLACES_ATTRIBUTE:
      if (action.attribute.type != 'text') return state

      // see ../selectors/customAttributes.js for when this is allowed
      // reset value to blank string
      return state.map(pl => {
        let desc = pl[action.attribute.name]
        if (desc && desc.length && typeof desc !== 'string') {
          desc = ''
        }
        pl[action.attribute.name] = desc
        return pl
      })

    case ATTACH_PLACE_TO_CARD:
      return state.map(place => {
        let cards = _.cloneDeep(place.cards)
        cards.push(action.id)
        return place.id === action.placeId ? Object.assign({}, place, {cards: cards}) : place
      })

    case REMOVE_PLACE_FROM_CARD:
      return state.map(place => {
        let cards = _.cloneDeep(place.cards)
        cards.splice(cards.indexOf(action.id), 1)
        return place.id === action.placeId ? Object.assign({}, place, {cards: cards}) : place
      })

    case ATTACH_PLACE_TO_NOTE:
      return state.map(place => {
        let notes = _.cloneDeep(place.noteIds)
        notes.push(action.id)
        return place.id === action.placeId ? Object.assign({}, place, {noteIds: notes}) : place
      })

    case REMOVE_PLACE_FROM_NOTE:
      return state.map(place => {
        let notes = _.cloneDeep(place.noteIds)
        notes.splice(notes.indexOf(action.id), 1)
        return place.id === action.placeId ? Object.assign({}, place, {noteIds: notes}) : place
      })

    case DELETE_NOTE:
      return state.map(place => {
        let notes = _.cloneDeep(place.noteIds)
        notes.splice(notes.indexOf(action.id), 1)
        return Object.assign({}, place, {noteIds: notes})
      })

    case DELETE_CARD:
      return state.map(place => {
        let cards = _.cloneDeep(place.cards)
        cards.splice(cards.indexOf(action.id), 1)
        return Object.assign({}, place, {cards: cards})
      })

    case DELETE_PLACE:
      return state.filter(place =>
        place.id !== action.id
      )

    case DELETE_IMAGE:
      return state.map(pl => {
        if (action.id == pl.imageId) {
          return {
            ...pl,
            imageId: null,
          }
        } else {
          return pl
        }
      })


    case RESET:
    case FILE_LOADED:
      return action.data.places

    case NEW_FILE:
      return newFilePlaces

    default:
      return state
  }
}
