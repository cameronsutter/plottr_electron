import React from 'react'
import { PropTypes } from 'react-proptypes'

import UnconnectedItemsManagerModal from '../../components/dialogs/ItemsManagerModal'

const ItemsManagerModal = UnconnectedItemsManagerModal(global.connector)

export default {
  title: 'Plottr/dialogs/ItemsManagerModal',
  component: ItemsManagerModal,
  args: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    showSaveAsTemplate: { control: 'boolean' },
    itemType: { control: 'select' },
  },
}

const Template = (args) => <ItemsManagerModal {...args} />

const RenderItem = ({ name, type }) => (
  <div>
    {name} - {type}
  </div>
)

RenderItem.propTypes = {
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
}

export const Example = Template.bind({})
Example.args = {
  title: 'A Title',
  subtitle: 'This is a sub title',
  showSaveAsTemplate: true,
  itemType: 'paragraph',
  items: [
    { name: 'length', type: 'text' },
    { name: 'emotion', type: 'text' },
  ],
  renderItem: RenderItem,
}
