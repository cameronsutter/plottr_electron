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
    const colorStyle = {color: leaf.color}
    attributes.style = attributes.style ? {...attributes.style, ...colorStyle} : colorStyle
  }

  if (leaf.font) {
    const fontStyle = {fontFamily: `${leaf.font}, Forum, sans-serif`}
    attributes.style = attributes.style ? {...attributes.style, ...fontStyle} : fontStyle
  }

  return <span {...attributes}>{children}</span>
}
export default React.memo(Leaf)