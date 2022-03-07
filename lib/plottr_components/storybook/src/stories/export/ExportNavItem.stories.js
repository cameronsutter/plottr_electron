import React from 'react'

import UnconnectedExportNavItem from '../../../../dist/components/export/ExportNavItem'

const ExportNavItem = UnconnectedExportNavItem(global.connector)

export default {
  title: 'Plottr/export/ExportNavItem',
  component: ExportNavItem,
  argTypes: {},
}

const Template = (args) => <ExportNavItem {...args} />

ExportNavItem.propTypes = {}

export const Example = Template.bind({})
Example.args = {}
