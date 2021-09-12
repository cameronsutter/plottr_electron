import PriorityQueue from 'fastpriorityqueue'

const newQueue = () =>
  new PriorityQueue((thisEdit, thatEdit) => {
    return thisEdit.editNumber < thatEdit.editNumber
  })

export const newEditQueue = () => ({})

export const enqueue = (editQueue, editorId, edit, editNumber) => {
  if (!editQueue[editorId]) {
    // We always want to be able to dequeue the first element that we
    // add straight away.
    editQueue[editorId] = { queue: newQueue(), lastDequeued: editNumber - 1 }
    editQueue[editorId].queue.add({ editNumber, edit })
    return
  }

  if (editNumber <= editQueue[editorId].editNumber) return

  editQueue[editorId].queue.add({ editNumber, edit })
}

export const drainQueue = (editorQueue) => {
  const toConsume = Object.entries(editorQueue).reduce(
    (toConsume, [editorId, { queue, lastDequeued }]) => {
      const first = queue.peek()
      if (!first) return toConsume

      let { editNumber, edit } = first
      while (editNumber <= lastDequeued) {
        queue.poll()
        const next = queue.peek()
        if (!next) return toConsume
        editNumber = next.editNumber
        edit = next.edit
      }

      while (editNumber - lastDequeued >= 1) {
        toConsume.push(edit)
        queue.poll()
        editorQueue[editorId].lastDequeued = editNumber
        lastDequeued = editNumber
        const next = queue.peek()
        if (!next) break
        editNumber = next.editNumber
        edit = next.edit
      }

      return toConsume
    },
    []
  )

  return toConsume
}

export const isNonEmpty = (editorQueue) => {
  return Object.values(editorQueue).some((queue) => {
    return queue.size > 0
  })
}
