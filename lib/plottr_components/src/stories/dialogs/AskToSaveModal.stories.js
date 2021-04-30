import React from 'react'

import AskToSaveModal from '../../components/dialogs/AskToSaveModal'

export default {
  title: 'Plottr/dialogs/AskToSaveModal',
  component: AskToSaveModal,
  argTypes: {},
}

const Template = (args) => <AskToSaveModal {...args} />

AskToSaveModal.propTypes = {}

export const Example = Template.bind({})
Example.args = {}
