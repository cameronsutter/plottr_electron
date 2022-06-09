export const contains = (element, click) => {
  const { left, top, right, bottom } = element.getBoundingClientRect()
  const { x, y } = click

  return x >= left && x <= right && y >= top && y <= bottom
}
