import React from 'react'
import i18n from 'format-message'
import PropTypes from 'react-proptypes'
import { CheckOption } from '../ExportOptions'

export default function GeneralOptions({ type, options, updateOptions }) {
  return (
    <div className="list-wrapper">
      <div className="list-title">{i18n('General')}</div>
      <ul>
        {type == 'word' ? (
          <li>
            <CheckOption
              checked={options.titlePage}
              onChange={updateOptions}
              category="general"
              attr="titlePage"
            >
              <span>{i18n('Title Page')}</span>
            </CheckOption>
          </li>
        ) : null}
      </ul>
    </div>
  )
}

GeneralOptions.propTypes = {
  options: PropTypes.object,
  type: PropTypes.string,
  updateOptions: PropTypes.func,
}
