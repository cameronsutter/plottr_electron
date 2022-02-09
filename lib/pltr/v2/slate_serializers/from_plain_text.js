export function convertTxtString(textContent) {
  return {
    type: 'paragraph',
    children: [{ text: textContent }],
  }
}
