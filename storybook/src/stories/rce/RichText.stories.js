import React from 'react'

import UnconnectedRichText from '../../../../dist/components/rce/RichText'

const RichText = UnconnectedRichText(global.connector)

export default {
  title: 'Plottr/rce/RichText',
  component: RichText,
  argTypes: {
    description: { control: 'text' },
    editable: { control: 'boolean' },
    autofocus: { control: 'boolean' },
    os: { control: { type: 'select', options: ['windows', 'linux', 'macos'] } },
  },
}

// To put on the template:
//  - onChange: () => {},
//  - className

const Template = (props) => <RichText className="" onChange={() => {}} {...props} />

export const Example = Template.bind({})
Example.args = {
  description: 'A description',
  editable: true,
  autofocus: false,
}
