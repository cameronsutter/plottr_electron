import React from 'react'
import { PropTypes } from 'react-proptypes'

import UnconnectedCharacterCategoriesModal from '../../components/characters/CharacterCategoriesModal'

const CharacterCategoriesModal = UnconnectedCharacterCategoriesModal(global.connector)

export default {
  title: 'Plottr/characters/CharacterCategoriesModal',
  component: CharacterCategoriesModal,
  argTypes: {},
}

const Template = ({ darkMode, ...args }) => (
  <CharacterCategoriesModal
    closeDialog={() => {}}
    ui={{ darkMode }}
    addCharacterCategory={() => {}}
    deleteCharacterCategory={() => {}}
    updateCharacterCategory={() => {}}
    reorderCharacterCategory={() => {}}
    startSaveAsTemplate={() => {}}
    {...args}
  />
)

Template.propTypes = {
  darkMode: PropTypes.isRequired,
}

export const Example = Template.bind({})
Example.args = {}
