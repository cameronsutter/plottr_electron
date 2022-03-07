import React from 'react'

import UnconnectedBookList from '../../../../dist/components/project/BookList'

const BookList = UnconnectedBookList(global.connector)

export default {
  title: 'Plottr/project/BookList',
  component: BookList,
  argTypes: {},
}

const Template = (args) => <BookList {...args} />

BookList.propTypes = {}

export const Example = Template.bind({})
Example.args = {}
