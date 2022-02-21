import React from 'react'

import { initialState } from 'pltr/v2'

import UnconnectedCharacterEditDetails from '../../components/characters/CharacterEditDetails'

const CharacterEditDetails = UnconnectedCharacterEditDetails(global.connector)

export default {
  title: 'Plottr/characters/CharacterEditDetails',
  component: CharacterEditDetails,
  argTypes: {},
}

const Template = (args) => (
  <CharacterEditDetails
    characterId={1}
    finishEditing={() => {}}
    openExternal={() => {}}
    log={{}}
    actions={{
      editCharacter: () => {},
    }}
    customAttributes={[]}
    images={{}}
    addAttribute={() => {}}
    removeAttribute={() => {}}
    editAttribute={() => {}}
    reorderAttribute={() => {}}
    createErrorReport={() => {}}
    {...args}
  />
)

export const Example = Template.bind({})
Example.args = {
  character: initialState.character,
  categories: [
    { id: 1, name: 'main' },
    { id: 2, name: 'supporting' },
  ],
}
