import React from 'react'

import UnconnectedBeamer from '../components/Beamer'

const Beamer = UnconnectedBeamer(global.connector)

export default {
  title: 'Plottr/Beamer',
  component: Beamer,
  argTypes: {
    inNavigation: { control: 'boolean' },
    isWindows: { control: 'boolean' },
    paymentId: { control: 'string' },
    customerEmail: { control: 'string' },
    isDevelopment: { control: 'boolean' },
  },
}

const Template = (args) => <Beamer openExternal={() => {}} {...args} />

export const Example = Template.bind({})
Example.args = {
  inNavigation: false,
  isWindows: false,
  paymentId: '1234',
  customerEmail: 'john@example.doe',
  isDevelopment: false,
}
