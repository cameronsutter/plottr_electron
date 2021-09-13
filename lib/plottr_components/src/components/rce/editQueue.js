export const newEditQueue = () => ({})

export const enqueue = (editQueue, editorId, edit, editNumber) => {
  if (!editQueue[editorId]) {
    // We always want to be able to dequeue the first element that we
    // add straight away.
    editQueue[editorId] = { queue: [{ edit, editNumber }], anchor: editNumber }
    return
  }

  const { queue, anchor } = editQueue[editorId]

  if (editNumber < anchor) return

  const indexToSet = editNumber - anchor
  if (indexToSet > queue.length) {
    editQueue[editorId].queue = [...queue, new Array(indexToSet - queue.length)]
  }
  queue[indexToSet] = { editNumber, edit }
}

export const drainQueue = (editorQueue) => {
  const toConsume = Object.entries(editorQueue).reduce(
    (toConsume, [editorId, { queue, anchor }]) => {
      let index = 0
      const first = queue[index]
      if (!first) return toConsume

      let { editNumber, edit } = first
      while (editNumber === editorQueue[editorId].anchor) {
        toConsume.push(edit)
        editorQueue[editorId].anchor = editNumber + 1
        const next = queue[++index]
        if (!next) break
        editNumber = next.editNumber
        edit = next.edit
      }

      editorQueue[editorId].queue = editorQueue[editorId].queue.slice(index)

      return toConsume
    },
    []
  )

  return toConsume
}
