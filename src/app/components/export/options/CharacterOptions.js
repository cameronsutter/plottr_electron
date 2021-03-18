import React from 'react'
import { t } from 'plottr_locales'
import PropTypes from 'react-proptypes'
import { CheckOption } from '../ExportOptions'

export default function CharacterOptions({ type, options, updateOptions }) {
  return (
    <div className="list-wrapper">
      <div className="list-title">
        <CheckOption
          checked={options.export}
          onChange={updateOptions}
          category="characters"
          attr="export"
        >
          <span>{t('Characters')}</span>
        </CheckOption>
      </div>
      <ul>
        <li>
          <CheckOption
            checked={options.heading}
            onChange={updateOptions}
            category="characters"
            attr="heading"
            disabled={!options.export}
          >
            <span>{t(type == 'word' ? 'Heading ("Characters")' : 'Character Title')}</span>
          </CheckOption>
        </li>
        {type == 'word' ? (
          <li>
            <CheckOption
              checked={options.images}
              onChange={updateOptions}
              category="characters"
              attr="images"
              disabled={!options.export}
            >
              <span>{t('Images')}</span>
            </CheckOption>
          </li>
        ) : null}
        <li>
          <CheckOption
            checked={options.descriptionHeading}
            onChange={updateOptions}
            category="characters"
            attr="descriptionHeading"
            disabled={!options.export}
          >
            <div>
              <span>{t('Description Heading')}</span>
              <br />
              <small>{t('("Description")')}</small>
            </div>
          </CheckOption>
        </li>
        <li>
          <CheckOption
            checked={options.description}
            onChange={updateOptions}
            category="characters"
            attr="description"
            disabled={!options.export}
          >
            <span>{t('Description')}</span>
          </CheckOption>
        </li>
        <li>
          <CheckOption
            checked={options.notesHeading}
            onChange={updateOptions}
            category="characters"
            attr="notesHeading"
            disabled={!options.export}
          >
            <div>
              <span>{t('Notes Heading')}</span>
              <br />
              <small>{t('("Notes")')}</small>
            </div>
          </CheckOption>
        </li>
        <li>
          <CheckOption
            checked={options.notes}
            onChange={updateOptions}
            category="characters"
            attr="notes"
            disabled={!options.export}
          >
            <span>{t('Notes')}</span>
          </CheckOption>
        </li>
        <li>
          <CheckOption
            checked={options.customAttributes}
            onChange={updateOptions}
            category="characters"
            attr="customAttributes"
            disabled={!options.export}
          >
            <span>{t('Custom Attributes')}</span>
          </CheckOption>
        </li>
        <li>
          <CheckOption
            checked={options.templates}
            onChange={updateOptions}
            category="characters"
            attr="templates"
            disabled={!options.export}
          >
            <span>{t('Templates')}</span>
          </CheckOption>
        </li>
        {type == 'scrivener' ? (
          <li>
            <CheckOption
              checked={options.tags}
              onChange={updateOptions}
              category="characters"
              attr="tags"
              disabled={!options.export}
            >
              <span>{t('Tags')}</span>
            </CheckOption>
          </li>
        ) : null}
        {type == 'scrivener' ? (
          <li>
            <CheckOption
              checked={options.tags}
              onChange={updateOptions}
              category="characters"
              attr="category"
              disabled={!options.export}
            >
              <span>{t('Category')}</span>
            </CheckOption>
          </li>
        ) : null}
      </ul>
    </div>
  )
}

CharacterOptions.propTypes = {
  options: PropTypes.object,
  type: PropTypes.string,
  updateOptions: PropTypes.func,
}
