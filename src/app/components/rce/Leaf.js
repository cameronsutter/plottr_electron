import React from 'react'

const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>
  }

  if (leaf.italic) {
    children = <em>{children}</em>
  }

  if (leaf.underline) {
    children = <u>{children}</u>
  }

  if (leaf.strike) {
    children = <del>{children}</del>
  }

  if (leaf.color) {
    attributes = {
      ...attributes,
      style: {color: leaf.color}
    }
  }

  return <span {...attributes}>{children}</span>
}
export default React.memo(Leaf)