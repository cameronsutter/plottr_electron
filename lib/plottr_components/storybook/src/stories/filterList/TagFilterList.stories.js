import React from 'react'

import UnconnectedTagFilterList from '../../../../dist/components/filterLists/TagFilterList'

const TagFilterList = UnconnectedTagFilterList(global.connector)

export default {
  title: 'Plottr/filterLists/TagFilterList',
  component: TagFilterList,
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
  <TagFilterList updateItems={() => {}} filteredItems={[]} tags={TAGS} {...args} />
)

export const Example = Template.bind({})
Example.args = {}
