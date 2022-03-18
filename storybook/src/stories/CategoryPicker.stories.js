import React from 'react'

import UnconnectedCategoryPicker from '../../../dist/components/CategoryPicker'

const CategoryPicker = UnconnectedCategoryPicker(global.connector)

export default {
  title: 'Plottr/CategoryPicker',
  component: CategoryPicker,
  argTypes: {
    selectedId: {
      control: {
        type: 'select',
        options: ['characters', 'places', 'notes', 'tags'],
      },
    },
  },
}

const Template = (args) => <CategoryPicker onChange={() => {}} {...args} />

export const Example = Template.bind({})
Example.args = {
  categories: [
    {
      id: 'characters',
      name: 'characters',
    },
    {
      id: 'places',
      name: 'places',
    },
    {
      id: 'notes',
      name: 'notes',
    },
    {
      id: 'tags',
      name: 'tags',
    },
  ],
  type: 'characters',
  selectedId: 'characters',
}
