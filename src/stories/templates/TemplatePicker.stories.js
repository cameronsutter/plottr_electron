import React from 'react'

import UnconnectedTemplatePicker from '../../components/templates/TemplatePicker'

const TemplatePicker = UnconnectedTemplatePicker(global.connector)

export default {
  title: 'Plottr/templates/TemplatePicker',
  component: TemplatePicker,
  argTypes: {
    newProject: { control: 'boolean' },
    modal: { control: 'boolean' },
    isOpen: { control: 'boolean' },
    canMakeCharacterTemplates: { control: 'boolean' },
    showCancelButton: { control: 'boolean' },
    confirmButtonText: { control: 'text' },
  },
}

const Template = (args) => (
  <TemplatePicker
    close={() => {}}
    onChooseTemplate={() => {}}
    types={['project', 'scene']}
    {...args}
  />
)

export const Example = Template.bind({})
Example.args = {
  newProject: true,
  modal: true,
  isOpen: true,
  canMakeCharacterTemplates: true,
  showCancelButton: true,
  confirmButtonText: 'Save Template',
  deleteTemplate: () => {},
  editTemplateDetails: () => {},
  openRemote: () => {},
  startSaveAsTemplate: () => {},
  appVersion: '3040.2.12',
}
