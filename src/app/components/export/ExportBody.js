import React, { useEffect, useState } from 'react'
import i18n from 'format-message'
import PropTypes from 'react-proptypes'
import { Button } from 'react-bootstrap'
import { useSettingsInfo } from '../../../common/utils/store_hooks'
import { CheckOption, RadioOption } from './ExportOptions'

export default function ExportBody({ type, setType, onChange }) {
  const [settings] = useSettingsInfo()
  const [options, setOptions] = useState(settings.export[type])

  useEffect(() => {
    setOptions(settings.export[type])
  }, [type])

  const updateOptions = (newVal, category, attr) => {
    const newOptions = { ...options }
    newOptions[category][attr] = newVal
    setOptions(newOptions)
    onChange(newOptions)
  }

  if (type) {
    if (!options) return null
    return (
      <div className="export-dialog__option-lists">
        <div className="list-wrapper">
          <div className="list-title">{i18n('General')}</div>
          <ul>
            <li>
              <CheckOption
                checked={options.general.titlePage}
                onChange={updateOptions}
                category="general"
                attr="titlePage"
              >
                <span>{i18n('Title Page')}</span>
              </CheckOption>
            </li>
          </ul>
        </div>
        <div className="list-wrapper">
          <div className="list-title">{i18n('Outline')}</div>
          <ul>
            <li>
              <CheckOption
                checked={options.outline.export}
                onChange={updateOptions}
                category="outline"
                attr="export"
              >
                <span>{i18n('Export')}</span>
              </CheckOption>
            </li>
            <li>
              <RadioOption
                checked={options.outline.columnOrRow == 'column'}
                onChange={updateOptions}
                category="outline"
                attr="columnOrRow"
                value="column"
              >
                <span>{i18n('Column By Column')}</span>
              </RadioOption>
              <RadioOption
                checked={options.outline.columnOrRow == 'row'}
                onChange={updateOptions}
                category="outline"
                attr="columnOrRow"
                value="row"
              >
                <span>{i18n('Row By Row')}</span>
              </RadioOption>
            </li>
            <li>
              <CheckOption
                checked={options.outline.heading}
                onChange={updateOptions}
                category="outline"
                attr="heading"
              >
                <span>{i18n('Heading ("Outline")')}</span>
              </CheckOption>
            </li>
            <li>
              <CheckOption
                checked={options.outline.sceneCards}
                onChange={updateOptions}
                category="outline"
                attr="sceneCards"
              >
                <span>{i18n('Scene Cards')}</span>
              </CheckOption>
            </li>
            <li>
              <CheckOption
                checked={options.outline.plotlineInTitle}
                onChange={updateOptions}
                category="outline"
                attr="plotlineInTitle"
              >
                <div>
                  <span>{i18n('Plotline in Card Title')}</span>
                  <br />
                  <small>{i18n('e.g. "(Main Plot)"')}</small>
                </div>
              </CheckOption>
            </li>
            <li>
              <CheckOption
                checked={options.outline.attachments}
                onChange={updateOptions}
                category="outline"
                attr="attachments"
              >
                <span>{i18n('Tags / Characters / Places')}</span>
              </CheckOption>
            </li>
            <li>
              <CheckOption
                checked={options.outline.description}
                onChange={updateOptions}
                category="outline"
                attr="description"
              >
                <span>{i18n('Description')}</span>
              </CheckOption>
            </li>
            <li>
              <CheckOption
                checked={options.outline.customAttributes}
                onChange={updateOptions}
                category="outline"
                attr="customAttributes"
              >
                <span>{i18n('Custom Attributes')}</span>
              </CheckOption>
            </li>
            <li>
              <CheckOption
                checked={options.outline.templates}
                onChange={updateOptions}
                category="outline"
                attr="templates"
              >
                <span>{i18n('Templates')}</span>
              </CheckOption>
            </li>
          </ul>
        </div>
        <div className="list-wrapper">
          <div className="list-title">{i18n('Characters')}</div>
          <ul>
            <li>
              <CheckOption
                checked={options.characters.export}
                onChange={updateOptions}
                category="characters"
                attr="export"
              >
                <span>{i18n('Export')}</span>
              </CheckOption>
            </li>
            <li>
              <CheckOption
                checked={options.characters.heading}
                onChange={updateOptions}
                category="characters"
                attr="heading"
              >
                <span>{i18n('Heading ("Characters")')}</span>
              </CheckOption>
            </li>
            <li>
              <CheckOption
                checked={options.characters.images}
                onChange={updateOptions}
                category="characters"
                attr="images"
              >
                <span>{i18n('Images')}</span>
              </CheckOption>
            </li>
            <li>
              <CheckOption
                checked={options.characters.descriptionHeading}
                onChange={updateOptions}
                category="characters"
                attr="descriptionHeading"
              >
                <div>
                  <span>{i18n('Description Heading')}</span>
                  <br />
                  <small>{i18n('("Description")')}</small>
                </div>
              </CheckOption>
            </li>
            <li>
              <CheckOption
                checked={options.characters.description}
                onChange={updateOptions}
                category="characters"
                attr="description"
              >
                <span>{i18n('Description')}</span>
              </CheckOption>
            </li>
            <li>
              <CheckOption
                checked={options.characters.attachments}
                onChange={updateOptions}
                category="characters"
                attr="attachments"
              >
                <span>{i18n('Books / Tags')}</span>
              </CheckOption>
            </li>
            <li>
              <CheckOption
                checked={options.characters.notes}
                onChange={updateOptions}
                category="characters"
                attr="notes"
              >
                <span>{i18n('Notes')}</span>
              </CheckOption>
            </li>
            <li>
              <CheckOption
                checked={options.characters.customAttributes}
                onChange={updateOptions}
                category="characters"
                attr="customAttributes"
              >
                <span>{i18n('Custom Attributes')}</span>
              </CheckOption>
            </li>
            <li>
              <CheckOption
                checked={options.characters.templates}
                onChange={updateOptions}
                category="characters"
                attr="templates"
              >
                <span>{i18n('Templates')}</span>
              </CheckOption>
            </li>
          </ul>
        </div>
        <div className="list-wrapper">
          <div className="list-title">{i18n('Places')}</div>
          <ul>
            <li>
              <CheckOption
                checked={options.places.export}
                onChange={updateOptions}
                category="places"
                attr="export"
              >
                <span>{i18n('Export')}</span>
              </CheckOption>
            </li>
            <li>
              <CheckOption
                checked={options.places.heading}
                onChange={updateOptions}
                category="places"
                attr="heading"
              >
                <span>{i18n('Heading ("Places")')}</span>
              </CheckOption>
            </li>
            <li>
              <CheckOption
                checked={options.places.images}
                onChange={updateOptions}
                category="places"
                attr="images"
              >
                <span>{i18n('Images')}</span>
              </CheckOption>
            </li>
            <li>
              <CheckOption
                checked={options.places.descriptionHeading}
                onChange={updateOptions}
                category="places"
                attr="descriptionHeading"
              >
                <div>
                  <span>{i18n('Description Heading')}</span>
                  <br />
                  <small>{i18n('("Description")')}</small>
                </div>
              </CheckOption>
            </li>
            <li>
              <CheckOption
                checked={options.places.description}
                onChange={updateOptions}
                category="places"
                attr="description"
              >
                <span>{i18n('Description')}</span>
              </CheckOption>
            </li>
            <li>
              <CheckOption
                checked={options.places.attachments}
                onChange={updateOptions}
                category="places"
                attr="attachments"
              >
                <span>{i18n('Books / Tags')}</span>
              </CheckOption>
            </li>
            <li>
              <CheckOption
                checked={options.places.notes}
                onChange={updateOptions}
                category="places"
                attr="notes"
              >
                <span>{i18n('Notes')}</span>
              </CheckOption>
            </li>
            <li>
              <CheckOption
                checked={options.places.customAttributes}
                onChange={updateOptions}
                category="places"
                attr="customAttributes"
              >
                <span>{i18n('Custom Attributes')}</span>
              </CheckOption>
            </li>
          </ul>
        </div>
        <div className="list-wrapper">
          <div className="list-title">{i18n('Notes')}</div>
          <ul>
            <li>
              <CheckOption
                checked={options.notes.export}
                onChange={updateOptions}
                category="notes"
                attr="export"
              >
                <span>{i18n('Export')}</span>
              </CheckOption>
            </li>
            <li>
              <CheckOption
                checked={options.notes.heading}
                onChange={updateOptions}
                category="notes"
                attr="heading"
              >
                <span>{i18n('Heading ("Notes")')}</span>
              </CheckOption>
            </li>
            <li>
              <CheckOption
                checked={options.notes.images}
                onChange={updateOptions}
                category="notes"
                attr="images"
              >
                <span>{i18n('Images')}</span>
              </CheckOption>
            </li>
            <li>
              <CheckOption
                checked={options.notes.attachments}
                onChange={updateOptions}
                category="notes"
                attr="attachments"
              >
                <span>{i18n('Tags / Characters / Places')}</span>
              </CheckOption>
            </li>
            <li>
              <CheckOption
                checked={options.notes.content}
                onChange={updateOptions}
                category="notes"
                attr="content"
              >
                <span>{i18n('Content')}</span>
              </CheckOption>
            </li>
          </ul>
        </div>
      </div>
    )
  } else {
    return (
      <div className="export-dialog__type-chooser">
        <h2>{i18n('Export to what?')}</h2>
        <div>
          <Button bsSize="large" onClick={() => setType('word')}>
            {i18n('MS Word')}
          </Button>
          <Button bsSize="large" onClick={() => setType('scrivener')}>
            {i18n('Scrivener')}
          </Button>
        </div>
      </div>
    )
  }
}

ExportBody.propTypes = {
  type: PropTypes.string,
  setType: PropTypes.func,
  onChange: PropTypes.func,
}
