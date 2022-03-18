import React from 'react'

import InputModal from '../../../../dist/components/dialogs/InputModal'

export default {
  title: 'Plottr/dialogs/InputModal',
  component: InputModal,
  argTypes: {
    isOpen: { control: 'boolean' },
    type: { control: { type: 'select', options: ['input'] } },
    title: { control: 'text' },
    defaultValue: { control: 'text' },
  },
}

// To put on the template:
//  - cancel
//  - getValue

const Template = (props) => <InputModal {...props} />

export const Example = Template.bind({})
Example.args = {
  isOpen: true,
  type: 'input',
  title: 'An input modal',
  defaultValue: 'A value',
}
