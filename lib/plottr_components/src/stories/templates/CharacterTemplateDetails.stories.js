import React from 'react'

import CharacterTemplateDetails from '../../components/templates/CharacterTemplateDetails'

export default {
  title: 'Plottr/templates/CharacterTemplateDetails',
  component: CharacterTemplateDetails,
  argTypes: {},
}

const Template = (args) => <CharacterTemplateDetails {...args} />

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
