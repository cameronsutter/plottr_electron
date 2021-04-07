import React from 'react'

import UnconnectedSortList from '../components/SortList'

const SortList = UnconnectedSortList(global.connector)

export default {
  title: 'Plottr/SortList',
  component: SortList,
  argTypes: {},
}

const Template = (args) => (
  <SortList items={['size', 'height']} sortAttr={'blerg'} update={() => {}} {...args} />
)

export const Example = Template.bind({})
Example.args = {}
