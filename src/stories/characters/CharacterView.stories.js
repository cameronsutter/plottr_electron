import React from 'react'

import UnconnectedCharacterView from '../../components/characters/CharacterView'

const CharacterView = UnconnectedCharacterView(global.connector)

export default {
  title: 'Plottr/characters/CharacterView',
  component: CharacterView,
  argTypes: {
    editing: { control: 'boolean' },
  },
}

const CHARACTER = {
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

const TAG = {
  id: 1,
  title: 'A Tag',
  color: null,
}

const BOOK_ONE = {
  id: 1,
  title: 'A Book',
  premise: 'Stuff',
  genre: 'Things',
  theme: 'Writing',
  templates: [],
  timelineTemplates: [],
  imageId: null,
}

const BOOK_TWO = {
  id: 2,
  title: 'A Book',
  premise: 'Stuff',
  genre: 'Things',
  theme: 'Writing',
  templates: [],
  timelineTemplates: [],
  imageId: null,
}

const BOOKS = {
  allIds: [1, 2],
  1: BOOK_ONE,
  2: BOOK_TWO,
}

const CATEGORIES = ['Main', 'Supporting']

const Template = (args) => (
  <CharacterView
    customAttributes={[]}
    openExternal={() => {}}
    images={{}}
    characterId={1}
    startEditing={() => {}}
    stopEditing={() => {}}
    categories={CATEGORIES}
    character={CHARACTER}
    books={BOOKS}
    actions={{
      addBook: () => {},
      removeBook: () => {},
      addTag: () => {},
      removeTag: () => {},
    }}
    tags={[TAG]}
    createErrorReport={() => {}}
    log={{}}
    {...args}
  />
)

export const Example = Template.bind({})
Example.args = {
  editing: false,
}
