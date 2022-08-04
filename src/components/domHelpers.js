export const boundingRectContains = (boundingRect, coord) => {
  const { left, top, right, bottom } = boundingRect
  const { x, y } = coord

  return x >= left && x <= right && y >= top && y <= bottom
}

export const contains = (element, click) => {
  return boundingRectContains(element.getBoundingClientRect(), click)
}
