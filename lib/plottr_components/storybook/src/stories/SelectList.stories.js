import React from 'react'

import UnconnectedSelectList from '../../../dist/components/SelectList'

const SelectList = UnconnectedSelectList(global.connector)

export default {
  title: 'Plottr/SelectList',
  component: SelectList,
  argTypes: {
    type: { control: 'text' },
  },
}

const Template = (args) => (
  <SelectList
    parentId={'1'}
    add={() => {}}
    remove={() => {}}
    selectedItems={[1, 2]}
    allItems={[
      { id: 1, color: '#000', name: 'An Item' },
      { id: 2, color: '#511', name: 'Another Item' },
      { id: 3, color: '#151', name: 'Yet Another Item' },
    ]}
    {...args}
  />
)

export const Example = Template.bind({})
Example.args = {}
