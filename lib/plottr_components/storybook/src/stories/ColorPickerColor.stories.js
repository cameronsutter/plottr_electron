import React from 'react'

import ColorPickerColor from '../../../dist/components/ColorPickerColor'

export default {
  title: 'Plottr/ColorPickerColor',
  component: ColorPickerColor,
  argTypes: {
    color: { control: 'color' },
  },
}

const Template = (args) => <ColorPickerColor {...args} />

export const Example = Template.bind({})
Example.args = {
  color: '#00D4DF',
}
