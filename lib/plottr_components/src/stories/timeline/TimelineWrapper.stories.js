import React from 'react'

import UnconnectedTimelineWrapper from '../../components/timeline/TimelineWrapper'

const TimelineWrapper = UnconnectedTimelineWrapper(global.connector)

export default {
  title: 'Plottr/timeline/TimelineWrapper',
  component: TimelineWrapper,
  argTypes: {
    hierarchyEnabled: { control: 'boolean' },
    viewSize: { control: { type: 'select', options: ['small', 'medium', 'large'] } },
    flipped: { control: 'boolean' },
  },
}

const Template = (args) => {
  const ui = global.state.present.ui
  ui.timeline.size = args.viewSize
  ui.orientation = args.flipped ? 'vertical' : 'horizontal'
  return <TimelineWrapper {...args} featureFlags={{ BEAT_HIERARCHY: args.hierarchyEnabled }} />
}

TimelineWrapper.propTypes = {}

export const Example = Template.bind({})
Example.args = {
  hierarchyEnabled: false,
  viewSize: 'large',
  flipped: false,
}
