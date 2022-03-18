import React from 'react'

import CardTemplateDetails from '../../../../dist/components/templates/CardTemplateDetails'

export default {
  title: 'Plottr/templates/CardTemplateDetails',
  component: CardTemplateDetails,
  argTypes: {},
}

const Template = (args) => <CardTemplateDetails {...args} />

const TEMPLATE = {
  attributes: [
    {
      name: 'Emotion',
      type: 'text',
    },
    {
      name: 'Motivation',
      type: 'paragraph',
    },
  ],
}

export const Example = Template.bind({})
Example.args = {
  template: TEMPLATE,
}
