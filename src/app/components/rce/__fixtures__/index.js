export function headingOne(text = '') {
  return {
    type: 'heading-one',
    children: [
      {
        text,
      },
    ],
  }
}

export function headingTwo(text = '') {
  return {
    type: 'heading-two',
    children: [
      {
        text,
      },
    ],
  }
}

export function paragraph(text = '') {
  return {
    type: 'paragraph',
    children: [
      {
        text,
      },
    ],
  }
}

export function list(type, listItems) {
  return {
    type,
    children: listItems,
  }
}

export function bulletedList(listItems = [listItem()]) {
  return list('bulleted-list', listItems)
}

export function numberedList(listItems = [listItem()]) {
  return list('numbered-list', listItems)
}

export function listItem(text = '') {
  return {
    type: 'list-item',
    children: [{ text }],
  }
}

export function blockQuote(children = [{ text: '' }]) {
  return {
    type: 'block-quote',
    children,
  }
}
