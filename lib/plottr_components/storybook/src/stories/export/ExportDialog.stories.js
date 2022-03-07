import React from 'react'

import UnconnectedExportDialog from '../../../../dist/components/export/ExportDialog'

const ExportDialog = UnconnectedExportDialog(global.connector)

export default {
  title: 'Plottr/export/ExportDialog',
  component: ExportDialog,
  argTypes: {},
}

const Template = (args) => <ExportDialog {...args} />

ExportDialog.propTypes = {}

export const Example = Template.bind({})
Example.args = {}
