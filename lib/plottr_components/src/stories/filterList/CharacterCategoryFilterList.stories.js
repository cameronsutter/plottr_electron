import React from 'react'

import UnconnectedCharacterCategoryFilterList from '../../components/filterLists/CharacterCategoryFilterList'

const CharacterCategoryFilterList = UnconnectedCharacterCategoryFilterList(global.connector)

export default {
  title: 'Plottr/filterLists/CharacterCategoryFilterList',
  component: CharacterCategoryFilterList,
  argTypes: {},
}

const Template = (args) => (
  <CharacterCategoryFilterList
    updateItems={() => {}}
    filteredItems={[]}
    categories={[
      {
        id: 1,
        name: 'Scene',
      },
      {
        id: 2,
        name: 'Character',
      },
    ]}
    {...args}
  />
)

export const Example = Template.bind({})
Example.args = {}
