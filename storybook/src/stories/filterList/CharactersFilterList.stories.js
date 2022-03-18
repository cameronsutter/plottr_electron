import React from 'react'

import UnconnectedCharactersFilterList from '../../../../dist/components/filterLists/CharactersFilterList'

const CharactersFilterList = UnconnectedCharactersFilterList(global.connector)

export default {
  title: 'Plottr/filterLists/CharactersFilterList',
  component: CharactersFilterList,
  argTypes: {},
}

const CHARACTER_ONE = {
  id: 1,
  name: 'Bob',
  description: 'A builder',
  notes: [{ type: 'paragraph', children: [{ text: '' }] }],
  color: null,
  cards: [],
  noteIds: [],
  templates: [],
  tags: [],
  categoryId: null,
  imageId: null,
  bookIds: [],
}

const CHARACTER_TWO = {
  id: 2,
  name: 'Alice',
  description: 'She often appears in the description of cryptography algorithms',
  notes: [{ type: 'paragraph', children: [{ text: '' }] }],
  color: null,
  cards: [],
  noteIds: [],
  templates: [],
  tags: [],
  categoryId: null,
  imageId: null,
  bookIds: [],
}

const CHARACTERS = [CHARACTER_ONE, CHARACTER_TWO]

const Template = (args) => (
  <CharactersFilterList
    updateItems={() => {}}
    filteredItems={[]}
    characters={CHARACTERS}
    {...args}
  />
)

export const Example = Template.bind({})
Example.args = {}
