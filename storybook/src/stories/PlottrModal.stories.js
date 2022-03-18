import React from 'react'

import UnconnectedPlottrModal from '../../../dist/components/PlottrModal'

const PlottrModal = UnconnectedPlottrModal(global.connector)

export default {
  title: 'Plottr/PlottrModal',
  component: PlottrModal,
  argTypes: {
    isDarkMode: { control: 'boolean' },
    isOpen: { control: 'boolean' },
  },
}

const Template = (args) => (
  <PlottrModal {...args}>
    <h1>A Modal</h1>
    <p>This is the content of the modal.</p>
  </PlottrModal>
)

export const Example = Template.bind({})
Example.args = {
  isDarkMode: false,
  isOpen: true,
}
