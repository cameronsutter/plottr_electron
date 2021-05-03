import React from 'react'

import UnconnectedTimelineWrapper from '../../components/timeline/TimelineWrapper'

const TimelineWrapper = UnconnectedTimelineWrapper(global.connector)

export default {
  title: 'Plottr/timeline/TimelineWrapper',
  component: TimelineWrapper,
  argTypes: {
    hierarchyEnabled: { control: 'boolean' },
  },
}

const Template = (args) => (
  <TimelineWrapper {...args} featureFlags={{ BEAT_HIERARCHY: args.hierarchyEnabled }} />
)

TimelineWrapper.propTypes = {}

export const Example = Template.bind({})
Example.args = {}
