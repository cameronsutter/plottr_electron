import React from 'react'

import UnconnectedCustomAttributeModal from '../../components/dialogs/CustomAttributeModal'

const CustomAttributeModal = UnconnectedCustomAttributeModal(global.connector)

export default {
  title: 'Plottr/dialogs/CustomAttributeModal',
  component: CustomAttributeModal,
  argTypes: {},
}

const Template = (args) => (
  <CustomAttributeModal
    type={'scenes'}
    hideSaveAsTemplate={false}
    customAttributes={[]}
    customAttributesThatCanChange={[]}
    closeDialog={() => {}}
    addAttribute={() => {}}
    removeAttribute={() => {}}
    editAttribute={() => {}}
    reorderAttribute={() => {}}
    startSaveAsTemplate={() => {}}
    {...args}
  />
)

export const Example = Template.bind({})
Example.args = {}
