import React from 'react'

import UnconnectedActsConfigModal from '../../../../dist/components/dialogs/ActsConfigModal'

const ActsConfigModal = UnconnectedActsConfigModal(global.connector)

export default {
  title: 'Plottr/dialogs/ActsConfigModal',
  component: ActsConfigModal,
  argTypes: {},
}

const Template = (args) => <ActsConfigModal {...args} closeDialog={() => {}} />

ActsConfigModal.propTypes = {}

export const Example = Template.bind({})
Example.args = {}
