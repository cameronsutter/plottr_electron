import React from 'react'
import { PropTypes } from 'react-proptypes'

import UnconnectedErrorBoundary from '../../components/containers/ErrorBoundary'

const ErrorBoundary = UnconnectedErrorBoundary(global.connector)

export default {
  title: 'Plottr/containers/ErrorBoundary',
  component: ErrorBoundary,
  argTypes: {
    error: { control: 'boolean' },
  },
}

const ErrorComponent = () => {
  throw new Error('error')
}

const Template = ({ error }) => {
  return (
    <ErrorBoundary log={{ error: () => {} }}>
      {error ? <ErrorComponent /> : <div>Non error content...</div>}
    </ErrorBoundary>
  )
}

Template.propTypes = {
  error: PropTypes.bool.isRequired,
}

export const Example = Template.bind({})
Example.args = {
  error: false,
}
