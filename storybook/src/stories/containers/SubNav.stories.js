import React from 'react'

import UnconnectedSubNav from '../../../../dist/components/containers/SubNav'

const SubNav = UnconnectedSubNav(global.connector)

export default {
  title: 'Plottr/containers/SubNav',
  component: SubNav,
  argTypes: {},
}

const Template = (args) => <SubNav {...args} />

SubNav.propTypes = {}

export const Example = Template.bind({})
Example.args = {}
