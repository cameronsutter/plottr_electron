import React from 'react'

import Switch from '../components/Switch'

export default {
  title: 'Plottr/Switch',
  component: Switch,
  argTypes: {
    isOn: { control: 'boolean' },
    labelText: { control: 'text' },
    disabled: { control: 'boolean' },
  },
}

const Template = (args) => <Switch {...args} handleToggle={() => {}} />

export const Example = Template.bind({})
Example.args = {
  isOn: true,
  labelText: 'A Switch',
  disabled: false,
}
