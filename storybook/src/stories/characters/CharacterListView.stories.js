import React from 'react'

import { initialState } from 'pltr/v2'
import UnconnectedCharacterListView from '../../../../dist/components/characters/CharacterListView'

const CharacterListView = UnconnectedCharacterListView(global.connector)

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

const TAG_ONE = {
  id: 1,
  title: 'A Tag',
  color: null,
}

const TAG_TWO = {
  id: 2,
  title: 'Another Tag',
  color: null,
}

const TAGS = [TAG_ONE, TAG_TWO]

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

export default {
  title: 'Plottr/characters/CharacterListView',
  component: CharacterListView,
  argTypes: {
    filterIsEmpty: { control: 'boolean' },
  },
}

const PLACE_ONE = {
  id: 1,
  name: 'Johannesburg',
  description: '',
  notes: [{ type: 'paragraph', children: [{ text: '' }] }],
  color: null,
  cards: [],
  noteIds: [],
  templates: [],
  tags: [],
  imageId: null,
  bookIds: [],
}

const PLACE_TWO = {
  id: 2,
  name: 'Capetown',
  description: '',
  notes: [{ type: 'paragraph', children: [{ text: '' }] }],
  color: null,
  cards: [],
  noteIds: [],
  templates: [],
  tags: [],
  imageId: null,
  bookIds: [],
}

const PLACES = [PLACE_ONE, PLACE_TWO]

const Template = (args) => (
  <CharacterListView
    visibleCharactersByCategory={{}}
    characters={CHARACTERS}
    tags={TAGS}
    books={BOOKS}
    places={PLACES}
    items={[]}
    characterCategories={[
      { id: 1, name: 'main' },
      { id: 2, name: 'supporting' },
    ]}
    categories={[
      { id: 1, name: 'main' },
      { id: 2, name: 'supporting' },
    ]}
    customAttributes={[{ name: 'emotion', type: 'text' }]}
    customAttributesThatCanChange={['emotion']}
    ui={{ characterSort: { includes: () => {} } }}
    actions={{}}
    customAttributeActions={{}}
    uiActions={{}}
    openExternal={() => {}}
    appVersion={'2021.3.2'}
    nextId={() => 3}
    images={{}}
    startSaveAsTemplate={() => {}}
    characterActions={{}}
    createErrorReport={() => {}}
    deleteTemplate={() => {}}
    editTemplateDetails={() => {}}
    {...args}
  />
)

export const Example = Template.bind({})
Example.args = {
  filterIsEmpty: true,
}
