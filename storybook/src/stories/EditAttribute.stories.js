import React from 'react'
import { PropTypes } from 'react-proptypes'

import UnconnectedEditAttribute from '../../../dist/components/EditAttribute'

const EditAttribute = UnconnectedEditAttribute(global.connector)

export default {
  title: 'Plottr/EditAttribute',
  component: EditAttribute,
  argTypes: {
    templateAttribute: { control: 'boolean' },
    name: { control: 'text' },
    type: { control: { type: 'select', options: ['text', 'paragraph'] } },
    value: { control: 'text' },
    entityName: { control: 'text' },
  },
}

const Template = ({ entityName, ...props }) => (
  <EditAttribute
    inputId="0"
    index={0}
    onChange={() => {}}
    onSave={() => {}}
    addAttribute={() => {}}
    removeAttribute={() => {}}
    editAttribute={() => {}}
    reorderAttribute={() => {}}
    entity={{ name: entityName }}
    {...props}
  />
)

Template.propTypes = {
  entityName: PropTypes.string.isRequired,
}

export const Example = Template.bind({})
Example.args = {
  templateAttribute: false,
  name: 'emotion',
  type: 'text',
  value: 'anger',
  entityName: 'Emotion',
  darkMode: false,
}
