import React from 'react'
import PropTypes from 'react-proptypes'
import { useSelected, useFocused } from 'slate-react'
import cx from 'classnames'

import ImageFromLink from './ImageFromLink'

const Element = ({
  attributes,
  children,
  element,
  openExternal,
  isStorageURL,
  imagePublicURL,
  imageCache,
  cacheImage,
}) => {
  const selected = useSelected()
  const focused = useFocused()
  switch (element.type) {
    case 'block-quote':
      return <blockquote {...attributes}>{children}</blockquote>
    case 'bulleted-list':
      return <ul {...attributes}>{children}</ul>
    case 'heading-one':
      return <h1 {...attributes}>{children}</h1>
    case 'heading-two':
      return <h2 {...attributes}>{children}</h2>
    case 'heading-three':
      return <h3 {...attributes}>{children}</h3>
    case 'heading-four':
      return <h4 {...attributes}>{children}</h4>
    case 'heading-five':
      return <h5 {...attributes}>{children}</h5>
    case 'heading-six':
      return <h6 {...attributes}>{children}</h6>
    case 'list-item':
      return <li {...attributes}>{children}</li>
    case 'numbered-list':
      return <ol {...attributes}>{children}</ol>
    case 'link':
      // TODO: show a preview or a little icon to show a preview
      return (
        <a
          {...attributes}
          title={element.url}
          href={element.url}
          rel="noreferrer"
          target="_blank"
          onClick={(event) => {
            event.preventDefault()
            openExternal(element.url)
          }}
        >
          {children}
        </a>
      )
    case 'image-link':
      return (
        <ImageFromLink
          attributes={attributes}
          isStorageURL={isStorageURL}
          imagePublicURL={imagePublicURL}
          selected={selected}
          focused={focused}
          element={element}
          imageCache={imageCache}
          cacheImage={cacheImage}
        >
          {children}
        </ImageFromLink>
      )
    case 'image-data':
      return (
        <div {...attributes}>
          <div contentEditable={false}>
            <img
              src={element.data}
              className={cx('slate-editor__image-link', { selected: selected && focused })}
            />
          </div>
          {children}
        </div>
      )
    default:
      return <p {...attributes}>{children}</p>
  }
}

Element.propTypes = {
  attributes: PropTypes.object,
  children: PropTypes.node,
  element: PropTypes.shape({
    type: PropTypes.string,
    url: PropTypes.string,
    data: PropTypes.string,
    storageUrl: PropTypes.string,
  }),
  openExternal: PropTypes.func.isRequired,
  isStorageURL: PropTypes.func.isRequired,
  imagePublicURL: PropTypes.func.isRequired,
  imageCache: PropTypes.object.isRequired,
  cacheImage: PropTypes.func.isRequired,
}

export default React.memo(Element)
