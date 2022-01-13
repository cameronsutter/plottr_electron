export const createNotesFromScriv = (defaultNote, state) => {
  const notes = state.sections.find((i) => {
    return i.title === 'Notes'
  })
  return notes.children.map((item, key) => {
    return (defaultNote = {
      ...defaultNote,
      id: key + 1,
      title: item.title,
      content: item.children?.content && item.children?.content.length ? [...item.content] : [],
      lastEdited: new Date().getDate(),
    })
  })
}
