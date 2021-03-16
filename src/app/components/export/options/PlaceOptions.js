import React from 'react'
import i18n from 'format-message'
import PropTypes from 'react-proptypes'
import { CheckOption } from '../ExportOptions'

export default function PlaceOptions({ type, options, updateOptions }) {
  return (
    <div className="list-wrapper">
      <div className="list-title">
        <CheckOption
          checked={options.export}
          onChange={updateOptions}
          category="places"
          attr="export"
        >
          <span>{i18n('Places')}</span>
        </CheckOption>
      </div>
      <ul>
        {type == 'word' ? (
          <li>
            <CheckOption
              checked={options.heading}
              onChange={updateOptions}
              category="places"
              attr="heading"
              disabled={!options.export}
            >
              <span>{i18n('Heading ("Places")')}</span>
            </CheckOption>
          </li>
        ) : null}
        {type == 'word' ? (
          <li>
            <CheckOption
              checked={options.images}
              onChange={updateOptions}
              category="places"
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
            category="places"
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
            category="places"
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
            category="places"
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
            category="places"
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
            category="places"
            attr="customAttributes"
            disabled={!options.export}
          >
            <span>{i18n('Custom Attributes')}</span>
          </CheckOption>
        </li>
      </ul>
    </div>
  )
}

PlaceOptions.propTypes = {
  options: PropTypes.object,
  type: PropTypes.string,
  updateOptions: PropTypes.func,
}
