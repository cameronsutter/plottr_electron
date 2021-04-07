import React from 'react'

import GenericFilterList from '../../components/filterLists/GenericFilterList'

export default {
  title: 'Plottr/filterLists/GenericFilterList',
  component: GenericFilterList,
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

const Template = (args) => (
  <GenericFilterList
    items={TAGS}
    title={'Tag Filter List (from Generic)'}
    displayAttribute={'title'}
    updateItems={() => {}}
    filteredItems={[]}
    {...args}
  />
)

export const Example = Template.bind({})
Example.args = {}
