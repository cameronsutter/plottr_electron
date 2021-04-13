import React from 'react'
import { PropTypes } from 'react-proptypes'

import UnconnectedSubNav from '../../components/containers/SubNav'

const SubNav = UnconnectedSubNav(global.connector)

export default {
  title: 'Plottr/containers/SubNav',
  component: SubNav,
  argTypes: {
    darkMode: { control: 'boolean' },
  },
}

const Template = (args) => <SubNav {...args} />

SubNav.propTypes = {
  darkMode: PropTypes.bool.isRequired,
}

export const Example = Template.bind({})
Example.args = {
  darkMode: false,
}
