import React from 'react'

import UnconnectedTagListView from '../../../../dist/components/tag/TagListView'

const TagListView = UnconnectedTagListView(global.connector)

export default {
  title: 'Plottr/tag/TagListView',
  component: TagListView,
  argTypes: {},
}

const Template = (args) => <TagListView {...args} />

TagListView.propTypes = {}

export const Example = Template.bind({})
Example.args = {}
