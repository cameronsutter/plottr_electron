import React from 'react'
import { PropTypes } from 'react-proptypes'

import { ListItem } from '../../../dist/components/dialogs/ItemsManagerModal'

export default {
  title: 'Plottr/ListItem',
  component: ListItem,
  argTypes: {
    name: { control: 'text' },
    type: { control: 'text' },
    showType: { control: 'boolean' },
    canChangeType: { control: 'boolean' },
  },
}

const Template = ({ name, type, showType, canChangeType }) => (
  <ListItem
    item={{ name, type }}
    index={0}
    showType={showType}
    canChangeType={canChangeType}
    reorderItem={() => {}}
    deleteItem={() => {}}
    updateItem={() => {}}
  />
)

Template.propTypes = {
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  showType: PropTypes.bool.isRequired,
  canChangeType: PropTypes.bool.isRequired,
}

export const Example = Template.bind({})
Example.args = {
  name: 'A List Item',
  type: 'paragraph',
  showType: true,
  canChangeType: true,
}
