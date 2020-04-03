import _ from 'lodash'
import { useState } from 'react'
import { RCE_INITIAL_VALUE } from '../../../../shared/initialState'

export function useTextConverter (text) {
  let rceText = text
  if (!text || !text.length) {
    rceText = _.cloneDeep(RCE_INITIAL_VALUE)
  }
  // [{ children: [{ text: '' }] }]
  if (typeof text === 'string') {
    rceText = _.cloneDeep(RCE_INITIAL_VALUE)
    rceText[0].children[0].text = text
  }
  const [value, setValue] = useState(rceText)

  return value
}