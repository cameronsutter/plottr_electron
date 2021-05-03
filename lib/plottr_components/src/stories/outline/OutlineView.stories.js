import React from 'react'

import UnconnectedOutlineView from '../../components/outline/OutlineView'

const OutlineView = UnconnectedOutlineView(global.connector)

export default {
  title: 'Plottr/outline/OutlineView',
  component: OutlineView,
  argTypes: {},
}

const Template = (args) => <OutlineView {...args} />

OutlineView.propTypes = {}

export const Example = Template.bind({})
Example.args = {}
