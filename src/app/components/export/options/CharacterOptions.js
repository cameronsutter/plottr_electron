import React from 'react'
import i18n from 'format-message'
import PropTypes from 'react-proptypes'
import { CheckOption } from '../ExportOptions'

export default function CharacterOptions({ type, options, updateOptions }) {
  return (
    <div className="list-wrapper">
      <div className="list-title">{i18n('Characters')}</div>
      <ul>
        <li>
          <CheckOption
            checked={options.export}
            onChange={updateOptions}
            category="characters"
            attr="export"
          >
            <span>{i18n('Export')}</span>
          </CheckOption>
        </li>
        {type == 'word' ? (
          <li>
            <CheckOption
              checked={options.heading}
              onChange={updateOptions}
              category="characters"
              attr="heading"
              disabled={!options.export}
            >
              <span>{i18n('Heading ("Characters")')}</span>
            </CheckOption>
          </li>
        ) : null}
        {type == 'word' ? (
          <li>
            <CheckOption
              checked={options.images}
              onChange={updateOptions}
              category="characters"
              attr="images"
              disabled={!options.export}
            >
              <span>{i18n('Images')}</span>
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
              <span>{i18n('Description Heading')}</span>
              <br />
              <small>{i18n('("Description")')}</small>
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
            <span>{i18n('Description')}</span>
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
              <span>{i18n('Notes Heading')}</span>
              <br />
              <small>{i18n('("Notes")')}</small>
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
            <span>{i18n('Notes')}</span>
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
            <span>{i18n('Custom Attributes')}</span>
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
            <span>{i18n('Templates')}</span>
          </CheckOption>
        </li>
      </ul>
    </div>
  )
}

CharacterOptions.propTypes = {
  options: PropTypes.object,
  type: PropTypes.string,
  updateOptions: PropTypes.func,
}
