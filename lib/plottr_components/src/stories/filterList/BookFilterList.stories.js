import React from 'react'

import UnconnectedBookFilterList from '../../components/filterLists/BookFilterList'

const BookFilterList = UnconnectedBookFilterList(global.connector)

export default {
  title: 'Plottr/filterLists/BookFilterList',
  component: BookFilterList,
  argTypes: {},
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

const Template = (args) => (
  <BookFilterList
    updateItems={() => {}}
    filteredItems={[]}
    books={{ ...BOOKS, allIds: [1, 2] }}
    {...args}
  />
)

export const Example = Template.bind({})
Example.args = {}
