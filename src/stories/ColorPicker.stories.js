import React from 'react'

import UnconnectedColorPicker from '../components/ColorPicker'

const ColorPicker = UnconnectedColorPicker(global.connector)

export default {
  title: 'Plottr/ColorPicker',
  component: ColorPicker,
  argTypes: {
    color: { control: 'color' },
  },
}

const Template = (args) => <ColorPicker {...args} />

export const Example = Template.bind({})
Example.args = {
  color: '#00D4DF',
  closeDialog: () => {},
}
