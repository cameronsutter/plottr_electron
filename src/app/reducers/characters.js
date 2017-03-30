import { ADD_CHARACTER, EDIT_CHARACTER, FILE_LOADED, NEW_FILE, RESET,
  ADD_CHARACTER_TO_CARD, REMOVE_CHARACTER_FROM_CARD } from '../constants/ActionTypes'
import { character } from 'store/initialState'
import { newFileCharacters } from 'store/newFileState'
import { characterId } from 'store/newIds'

const initialState = [character]

export default function characters (state = initialState, action) {
  switch (action.type) {
    case ADD_CHARACTER:
      return [...state, {
        id: characterId(state),
        name: action.name,
        description: action.description,
        notes: action.notes,
        color: character.color,
        cards: []
      }]

    case EDIT_CHARACTER:
      return state.map(character =>
        character.id === action.id ? Object.assign({}, character, action.attributes) : character
      )

    case ADD_CHARACTER_TO_CARD:
      return state.map(character => {
        let cards = _.cloneDeep(character.cards)
        cards.push(action.id)
        return character.id === action.characterId ? Object.assign({}, character, {cards: cards}) : character
      })

    case REMOVE_CHARACTER_FROM_CARD:
      return state.map(character => {
        let cards = _.cloneDeep(character.cards)
        cards.splice(cards.indexOf(action.id), 1)
        return character.id === action.characterId ? Object.assign({}, character, {cards: cards}) : character
      })

    case RESET:
    case FILE_LOADED:
      return action.data.characters

    case NEW_FILE:
      return newFileCharacters

    default:
      return state
  }
}
