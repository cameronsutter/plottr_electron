import React from 'react'

import CardColorFilterList from '../../components/filterLists/CardColorFilterList'

export default {
  title: 'Plottr/filterLists/CardColorFilterList',
  component: CardColorFilterList,
  argTypes: {},
}

const Template = (args) => <CardColorFilterList {...args} />

CardColorFilterList.propTypes = {}

export const Example = Template.bind({})
Example.args = {
  colors: ['Red', 'Green'],
  filteredItems: ['Red'],
  updateItems: () => {},
}
