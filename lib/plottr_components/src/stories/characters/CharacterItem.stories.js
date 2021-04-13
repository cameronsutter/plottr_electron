import React from 'react'

import { initialState } from 'pltr/v2'
import UnconnectedCharacterItem from '../../components/characters/CharacterItem'

const CharacterItem = UnconnectedCharacterItem(global.connector)

const CHARACTER_ONE = {
  ...initialState.character,
  name: 'Alice',
  description: 'Main character',
}

const CHARACTER_TWO = {
  ...initialState.character,
  name: 'Bob',
  description: 'Supporting Character',
}

const CHARACTERS = [CHARACTER_ONE, CHARACTER_TWO]

export default {
  title: 'Plottr/characters/CharacterItem',
  component: CharacterItem,
  argTypes: {
    character: { control: { type: 'select', options: CHARACTERS } },
    selected: { control: 'boolean' },
  },
}

const Template = (args) => (
  <CharacterItem
    select={() => {}}
    startEdit={() => {}}
    stopEdit={() => {}}
    actions={{
      editCharacter: () => {},
    }}
    images={[]}
    {...args}
  />
)

export const Example = Template.bind({})
Example.args = {
  character: CHARACTER_ONE,
  selected: false,
}
