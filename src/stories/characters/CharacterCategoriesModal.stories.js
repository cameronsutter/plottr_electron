import React from 'react'

import UnconnectedCharacterCategoriesModal from '../../components/characters/CharacterCategoriesModal'

const CharacterCategoriesModal = UnconnectedCharacterCategoriesModal(global.connector)

export default {
  title: 'Plottr/characters/CharacterCategoriesModal',
  component: CharacterCategoriesModal,
  argTypes: {},
}

const Template = ({ ...args }) => (
  <CharacterCategoriesModal
    closeDialog={() => {}}
    addCharacterCategory={() => {}}
    deleteCharacterCategory={() => {}}
    updateCharacterCategory={() => {}}
    reorderCharacterCategory={() => {}}
    startSaveAsTemplate={() => {}}
    {...args}
  />
)

Template.propTypes = {}

export const Example = Template.bind({})
Example.args = {}
