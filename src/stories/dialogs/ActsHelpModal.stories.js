import React from 'react'

import UnconnectedActsHelpModal from '../../components/dialogs/ActsHelpModal'

const ActsHelpModal = UnconnectedActsHelpModal(global.connector)

export default {
  title: 'Plottr/dialogs/ActsHelpModal',
  component: ActsHelpModal,
  argTypes: {},
}

const Template = (args) => <ActsHelpModal {...args} />

ActsHelpModal.propTypes = {}

export const Example = Template.bind({})
Example.args = {}
