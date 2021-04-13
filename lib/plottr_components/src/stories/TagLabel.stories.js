import React from 'react'
import { PropTypes } from 'react-proptypes'

import TagLabel from '../components/TagLabel'

export default {
  title: 'Plottr/TagLabel',
  component: TagLabel,
  argTypes: {
    title: { control: 'text' },
    color: { control: 'color' },
  },
}

const Template = ({ title, color }) => <TagLabel tag={{ title, color }} />

Template.propTypes = {
  title: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
}

export const Example = Template.bind({})
Example.args = {
  title: 'A Tag',
  color: '#000',
}
