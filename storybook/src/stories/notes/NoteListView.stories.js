import React from 'react'

import UnconnectedNoteListView from '../../../../dist/components/notes/NoteListView'

const NoteListView = UnconnectedNoteListView(global.connector)

export default {
  title: 'Plottr/notes/NoteListView',
  component: NoteListView,
  argTypes: {},
}

const Template = (args) => <NoteListView {...args} />

NoteListView.propTypes = {}

export const Example = Template.bind({})
Example.args = {}
