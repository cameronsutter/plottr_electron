import React from 'react'
import i18n from 'format-message'
import PropTypes from 'react-proptypes'
import { CheckOption } from '../ExportOptions'

export default function NoteOptions({ type, options, updateOptions }) {
  return (
    <div className="list-wrapper">
      <div className="list-title">
        <CheckOption
          checked={options.export}
          onChange={updateOptions}
          category="notes"
          attr="export"
        >
          <span>{i18n('Notes')}</span>
        </CheckOption>
      </div>
      <ul>
        <li>
          <CheckOption
            checked={options.heading}
            onChange={updateOptions}
            category="notes"
            attr="heading"
            disabled={!options.export}
          >
            <span>{i18n(type == 'word' ? 'Heading ("Notes")' : 'Note Title')}</span>
          </CheckOption>
        </li>
        {type == 'word' ? (
          <li>
            <CheckOption
              checked={options.images}
              onChange={updateOptions}
              category="notes"
              attr="images"
              disabled={!options.export}
            >
              <span>{i18n('Images')}</span>
            </CheckOption>
          </li>
        ) : null}
        {type == 'word' ? (
          <li>
            <CheckOption
              checked={options.attachments}
              onChange={updateOptions}
              category="notes"
              attr="attachments"
              disabled={!options.export}
            >
              <span>{i18n('Tags / Characters / Places')}</span>
            </CheckOption>
          </li>
        ) : null}
        <li>
          <CheckOption
            checked={options.content}
            onChange={updateOptions}
            category="notes"
            attr="content"
            disabled={!options.export}
          >
            <span>{i18n('Content')}</span>
          </CheckOption>
        </li>
      </ul>
    </div>
  )
}

NoteOptions.propTypes = {
  options: PropTypes.object,
  type: PropTypes.string,
  updateOptions: PropTypes.func,
}
