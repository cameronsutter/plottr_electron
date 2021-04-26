import React from 'react'
import { t } from 'plottr_locales'
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
          <span>{t('Places')}</span>
        </CheckOption>
      </div>
      <ul>
        {type == 'scrivener' ? (
          <li>
            <CheckOption
              checked={options.heading}
              onChange={updateOptions}
              category="places"
              attr="heading"
              disabled={!options.export}
            >
              <span>{t('Place Name')}</span>
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
              <span>{t('Place Image')}</span>
            </CheckOption>
          </li>
        ) : null}
        <li>
          <CheckOption
            checked={options.description}
            onChange={updateOptions}
            category="places"
            attr="description"
            disabled={!options.export}
          >
            <span>{t('Description')}</span>
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
            <span>{t('Notes')}</span>
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
            <span>{t('Custom Attributes')}</span>
          </CheckOption>
        </li>
        {type == 'scrivener' ? (
          <li>
            <CheckOption
              checked={options.tags}
              onChange={updateOptions}
              category="places"
              attr="tags"
              disabled={!options.export}
            >
              <span>{t('Tags')}</span>
            </CheckOption>
          </li>
        ) : null}
      </ul>
    </div>
  )
}

PlaceOptions.propTypes = {
  options: PropTypes.object,
  type: PropTypes.string,
  updateOptions: PropTypes.func,
}
