import React from 'react'

import UnconnectedBookSelectList from '../../../../dist/components/project/BookSelectList'

const BookSelectList = UnconnectedBookSelectList(global.connector)

export default {
  title: 'Plottr/project/BookSelectList',
  component: BookSelectList,
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
  <BookSelectList
    parentId={0}
    add={() => {}}
    remove={() => {}}
    selectedBooks={[]}
    books={BOOKS}
    ui={{}}
    images={{}}
    {...args}
  />
)

export const Example = Template.bind({})
Example.args = {}
