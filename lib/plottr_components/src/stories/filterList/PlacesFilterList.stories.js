import React from 'react'

import UnconnectedPlacesFilterList from '../../components/filterLists/PlacesFilterList'

const PlacesFilterList = UnconnectedPlacesFilterList(global.connector)

export default {
  title: 'Plottr/filterLists/PlacesFilterList',
  component: PlacesFilterList,
  argTypes: {},
}

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

const Template = (args) => (
  <PlacesFilterList updateItems={() => {}} filteredItems={[]} places={PLACES} {...args} />
)

export const Example = Template.bind({})
Example.args = {}
