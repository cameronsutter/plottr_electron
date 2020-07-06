import { cloneDeep } from 'lodash'
import { RCE_INITIAL_VALUE } from '../../../../shared/initialState'

export function useTextConverter (text) {
  let rceText = text
  if (!text || !text.length || typeof text === 'string') {
    // [{ children: [{ text: '' }] }]
    rceText = cloneDeep(RCE_INITIAL_VALUE)
  }
  if (typeof text === 'string') {
    rceText[0].children[0].text = text
  }

  return rceText
}