import React from 'react'

import UnconnectedPlaceListView from '../../components/places/PlaceListView'

const PlaceListView = UnconnectedPlaceListView(global.connector)

export default {
  title: 'Plottr/places/PlaceListView',
  component: PlaceListView,
  argTypes: {},
}

const Template = (args) => <PlaceListView {...args} />

PlaceListView.propTypes = {}

export const Example = Template.bind({})
Example.args = {}
