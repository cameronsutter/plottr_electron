import React from 'react'
import i18n from 'format-message'
import PropTypes from 'react-proptypes'
import { CheckOption } from '../ExportOptions'

export default function OutlineOptions({ type, options, updateOptions }) {
  // TODO: export horizonally (Row by Row instead of Column by Column)
  // <li>
  //   <RadioOption
  //     checked={options.columnOrRow == 'column'}
  //     onChange={updateOptions}
  //     category="outline"
  //     attr="columnOrRow"
  //     value="column"
  //     disabled={!options.export}
  //   >
  //     <span>{i18n('Column By Column')}</span>
  //   </RadioOption>
  //   <RadioOption
  //     checked={options.columnOrRow == 'row'}
  //     onChange={updateOptions}
  //     category="outline"
  //     attr="columnOrRow"
  //     value="row"
  //     disabled={!options.export}
  //   >
  //     <span>{i18n('Row By Row')}</span>
  //   </RadioOption>
  // </li>

  return (
    <div className="list-wrapper">
      <div className="list-title">
        <CheckOption
          checked={options.export}
          onChange={updateOptions}
          category="outline"
          attr="export"
        >
          <span>{i18n('Outline')}</span>
        </CheckOption>
      </div>
      <ul>
        {type == 'word' ? (
          <li>
            <CheckOption
              checked={options.heading}
              onChange={updateOptions}
              category="outline"
              attr="heading"
              disabled={!options.export}
            >
              <span>{i18n('Heading ("Outline")')}</span>
            </CheckOption>
          </li>
        ) : null}
        <li>
          <CheckOption
            checked={options.sceneCards}
            onChange={updateOptions}
            category="outline"
            attr="sceneCards"
            disabled={!options.export}
          >
            <span>{i18n('Scene Cards')}</span>
          </CheckOption>
        </li>
        <li>
          <CheckOption
            checked={options.plotlineInTitle}
            onChange={updateOptions}
            category="outline"
            attr="plotlineInTitle"
            disabled={!options.export}
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
            checked={options.attachments}
            onChange={updateOptions}
            category="outline"
            attr="attachments"
            disabled={!options.export}
          >
            <span>{i18n('Tags / Characters / Places')}</span>
          </CheckOption>
        </li>
        <li>
          <CheckOption
            checked={options.description}
            onChange={updateOptions}
            category="outline"
            attr="description"
            disabled={!options.export}
          >
            <span>{i18n('Description')}</span>
          </CheckOption>
        </li>
        <li>
          <CheckOption
            checked={options.customAttributes}
            onChange={updateOptions}
            category="outline"
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
            category="outline"
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

OutlineOptions.propTypes = {
  options: PropTypes.object,
  type: PropTypes.string,
  updateOptions: PropTypes.func,
}
