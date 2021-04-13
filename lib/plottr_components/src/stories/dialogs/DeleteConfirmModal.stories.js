import React from 'react'

import DeleteConfirmModal from '../../components/dialogs/DeleteConfirmModal'

export default {
  title: 'Plottr/dialogs/DeleteConfirmModal',
  component: DeleteConfirmModal,
  argTypes: {
    name: { control: 'text' },
    customText: { control: 'text' },
  },
}

const Template = (args) => <DeleteConfirmModal {...args} />

export const Example = Template.bind({})
Example.args = {
  name: 'Universe',
  customText: 'Are you sure you want to delete the Universe?!',
}
