import React from 'react'

import UnconnectedCustomAttrFilterList from '../components/CustomAttrFilterList'

const CustomAttrFilterList = UnconnectedCustomAttrFilterList(global.connector)

export default {
  title: 'Plottr/CustomAttrFilterList',
  component: CustomAttrFilterList,
  argTypes: {},
}

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
  id: 1,
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

const CHARACTER_CATEGORIES = [
  {
    id: 1,
    name: 'Scene',
  },
  {
    id: 2,
    name: 'Character',
  },
]

const Template = (args) => (
  <CustomAttrFilterList
    type={'scene'}
    tags={TAGS}
    books={{ ...BOOKS, allIds: [1, 2] }}
    characters={CHARACTERS}
    places={PLACES}
    characterCategories={CHARACTER_CATEGORIES}
    customAttributes={[
      {
        id: 1,
        name: 'Emotion',
        type: 'text',
      },
      {
        id: 1,
        name: 'Progress',
        type: 'text',
      },
    ]}
    items={[...TAGS, ...CHARACTERS, ...PLACES, ...CHARACTER_CATEGORIES]}
    {...args}
  />
)

export const Example = Template.bind({})
Example.args = {}
