import React from 'react'
import PropTypes from 'react-proptypes'
import { t as i18n } from 'plottr_locales'
import { sortBy } from 'lodash'

export default function ProjectTemplateDetails({ template }) {
  const { templateData } = template

  const headingMap = {
    lines: i18n('Plotlines'),
    cards: i18n('Scene Cards'),
    beats: i18n('Chapters'),
    notes: i18n('Notes'),
    tags: i18n('Tags'),
    characters: i18n('Characters'),
  }

  const renderData = (type, data) => {
    switch (type) {
      case 'beats':
        return sortBy(data, 'position').map((beat) => <li key={beat.id}>{beat.title}</li>)
      case 'cards':
        return sortBy(data, 'id').map((c) => <li key={c.id}>{c.title}</li>)
      case 'lines':
        return sortBy(data, 'position').map((l) => <li key={l.id}>{l.title}</li>)
      case 'tags':
        return sortBy(data, 'title').map((t) => <li key={t.id}>{t.title}</li>)
      case 'notes':
        return sortBy(data, 'lastEdited')
          .reverse()
          .map((n) => <li key={n.id}>{n.title}</li>)
      case 'charactersCA':
        return data.map((attr) => (
          <li key={attr.name}>
            {attr.name}: {attr.type}
          </li>
        ))
      default:
        return null
    }
  }

  const arrayObjects = ['beats', 'cards', 'lines', 'notes', 'tags']
    .filter((type) => templateData[type] && templateData[type].length)
    .filter((heading) => !templateData[heading].every((item) => item.title == 'auto'))
    .map((heading) => {
      let headingText = headingMap[heading] || heading

      return (
        <div key={heading}>
          <h5 className="text-center text-capitalize">{headingText}</h5>
          <ol>{renderData(heading, templateData[heading])}</ol>
        </div>
      )
    })

  let customAttributes = []
  if (templateData.customAttributes) {
    customAttributes = Object.keys(templateData.customAttributes)
      .filter((type) => templateData.customAttributes[type].length)
      .map((type) => {
        let headingText = headingMap[type] || type

        return (
          <div key={type}>
            <p>{headingText}</p>
            <ol>{renderData(`${type}CA`, templateData.customAttributes[type])}</ol>
          </div>
        )
      })
  }

  let images = []
  if (templateData.images) {
    images = Object.keys(templateData.images).map((id) => {
      const image = templateData.images[`${id}`]

      return (
        <div key={id} style={{ width: '50%' }}>
          <p>{image.name}</p>
          <img className="img-responsive" src={image.data} />
        </div>
      )
    })
  }

  return (
    <div className="panel-body">
      {arrayObjects}
      {customAttributes.length ? (
        <h5 className="text-center text-capitalize">{i18n('Custom Attributes')}</h5>
      ) : null}
      {customAttributes}
      {images.length ? <h5 className="text-center text-capitalize">{i18n('Images')}</h5> : null}
      {images}
    </div>
  )
}

ProjectTemplateDetails.propTypes = {
  template: PropTypes.object,
}
