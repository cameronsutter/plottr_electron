import React from 'react'

import { initialState } from 'pltr/v2'
import UnconnectedCharacterDetails from '../../components/characters/CharacterDetails'

const CharacterDetails = UnconnectedCharacterDetails(global.connector)

export default {
  title: 'Plottr/characters/CharacterDetails',
  component: CharacterDetails,
  argTypes: {},
}

const Template = (args) => (
  <CharacterDetails
    characterId={1}
    actions={{}}
    customAttributes={[{ name: 'Emotion', type: 'text' }]}
    ui={{ darkMode: false }}
    startEditing={() => {}}
    log={{}}
    openExternal={() => {}}
    images={{}}
    createErrorReport={() => {}}
    {...args}
  />
)

export const Example = Template.bind({})
Example.args = {
  character: initialState.character,
  categories: ['main', 'supporting'],
}
