import React from 'react'

import UnconnectedTemplateCreate from '../../components/templates/TemplateCreate'

const TemplateCreate = UnconnectedTemplateCreate(global.connector)

export default {
  title: 'Plottr/templates/TemplateCreate',
  component: TemplateCreate,
  argTypes: {
    type: null,
  },
}

const Template = (args) => (
  <TemplateCreate close={() => {}} ui={{}} saveTemplate={() => {}} {...args} />
)

export const Example = Template.bind({})
Example.args = {
  type: 'scene',
}
