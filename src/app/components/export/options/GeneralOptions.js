import React from 'react'
import { t } from 'plottr_locales'
import PropTypes from 'react-proptypes'
import { CheckOption } from '../ExportOptions'
import { Button } from 'react-bootstrap'

export default function GeneralOptions({ type, options, updateOptions }) {
  return (
    <div className="list-wrapper">
      <div className="list-title">{t('General')}</div>
      <div>
        <Button bsSize="xs" bsStyle="link">
          All
        </Button>{' '}
        /{' '}
        <Button bsSize="xs" bsStyle="link">
          None
        </Button>
      </div>
      <ul>
        {type == 'word' ? (
          <li>
            <CheckOption
              checked={options.titlePage}
              onChange={updateOptions}
              category="general"
              attr="titlePage"
            >
              <span>{t('Title Page')}</span>
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
