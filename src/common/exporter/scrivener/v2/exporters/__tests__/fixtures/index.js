import testState from './test_state.json'

export function headingTwo(text) {
  return {
    type: 'heading-two',
    children: [
      {
        text,
      },
    ],
  }
}

export function paragraph(text) {
  return {
    type: 'paragraph',
    children: [
      {
        text,
      },
    ],
  }
}

export const state = testState
