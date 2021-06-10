import React from 'react'
import { t } from 'plottr_locales'
import PropTypes from 'react-proptypes'
import { CheckOption, RadioOption, FilterCheckOption } from '../ExportOptions'

const UnconnectedOutlineOptions = (connector) => {
  const OutlineOptions = ({ type, options, updateOptions, lines, outlineFilter, actions }) => {
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
    //     <span>{t('Column By Column')}</span>
    //   </RadioOption>
    //   <RadioOption
    //     checked={options.columnOrRow == 'row'}
    //     onChange={updateOptions}
    //     category="outline"
    //     attr="columnOrRow"
    //     value="row"
    //     disabled={!options.export}
    //   >
    //     <span>{t('Row By Row')}</span>
    //   </RadioOption>
    // </li>

    const onFilterChange = (isCheck, category, attr, filterId) => {
      let filteredLines = []
      if (!isCheck && !outlineFilter) {
        filteredLines = lines.map((line) => line.id).filter((line) => line !== filterId)
      } else if (outlineFilter.includes(filterId)) {
        filteredLines = outlineFilter.filter((line) => line !== filterId)
      } else {
        filteredLines = outlineFilter.length ? [...outlineFilter, filterId] : [filterId]
      }
      actions.overrideOutlineFilter(filteredLines)
      updateOptions(filteredLines, category, attr)
    }

    const renderLines = () => {
      return lines.map((line) => {
        const isCheck =
          (Array.isArray(outlineFilter) && outlineFilter.includes(line.id)) || !outlineFilter

        return (
          <li key={line.id}>
            <FilterCheckOption
              checked={isCheck}
              onChange={onFilterChange}
              category="outline"
              attr="filter"
              filterId={line.id}
              disabled={!options.export || !options.sceneCards || !options.plotlineInTitle}
            >
              <span>{line.title}</span>
            </FilterCheckOption>
          </li>
        )
      })
    }

    return (
      <div className="list-wrapper">
        <div className="list-title">
          <CheckOption
            checked={options.export}
            onChange={updateOptions}
            category="outline"
            attr="export"
          >
            <span>{t('Outline')}</span>
          </CheckOption>
        </div>
        <ul>
          <li>
            <CheckOption
              checked={options.sceneCards}
              onChange={updateOptions}
              category="outline"
              attr="sceneCards"
              disabled={!options.export}
            >
              <span>{t('Scene Cards')}</span>
            </CheckOption>
            <ul>
              <li>
                <CheckOption
                  checked={options.plotlineInTitle}
                  onChange={updateOptions}
                  category="outline"
                  attr="plotlineInTitle"
                  disabled={!options.export || !options.sceneCards}
                >
                  <span>{t('Plotline Title')}</span>
                </CheckOption>
                <ul>{renderLines()}</ul>
              </li>
              {type == 'word' ? (
                <li>
                  <CheckOption
                    checked={options.attachments}
                    onChange={updateOptions}
                    category="outline"
                    attr="attachments"
                    disabled={!options.export || !options.sceneCards}
                  >
                    <span>{t('Tags / Characters / Places')}</span>
                  </CheckOption>
                </li>
              ) : null}
              <li>
                <CheckOption
                  checked={options.description}
                  onChange={updateOptions}
                  category="outline"
                  attr="description"
                  disabled={!options.export || !options.sceneCards}
                >
                  <span>{t('Description')}</span>
                </CheckOption>
              </li>
              {type == 'scrivener' ? (
                <li>
                  <ul>
                    <li>
                      <div>{t('Put Description in:')}</div>
                    </li>
                    <li>
                      <RadioOption
                        checked={options.where == 'synopsis'}
                        onChange={updateOptions}
                        category="outline"
                        attr="where"
                        value="synopsis"
                        disabled={!options.export || !options.sceneCards || !options.description}
                      >
                        <span>{t('Synopsis')}</span>
                      </RadioOption>
                    </li>
                    <li>
                      <RadioOption
                        checked={options.where == 'body'}
                        onChange={updateOptions}
                        category="outline"
                        attr="where"
                        value="body"
                        disabled={!options.export || !options.sceneCards || !options.description}
                      >
                        <span>{t('Body')}</span>
                      </RadioOption>
                    </li>
                    <li>
                      <RadioOption
                        checked={options.where == 'notes'}
                        onChange={updateOptions}
                        category="outline"
                        attr="where"
                        value="notes"
                        disabled={!options.export || !options.sceneCards || !options.description}
                      >
                        <span>{t('Notes')}</span>
                      </RadioOption>
                    </li>
                  </ul>
                </li>
              ) : null}
              <li>
                <CheckOption
                  checked={options.customAttributes}
                  onChange={updateOptions}
                  category="outline"
                  attr="customAttributes"
                  disabled={!options.export || !options.sceneCards}
                >
                  <span>{t('Custom Attributes')}</span>
                </CheckOption>
              </li>
              <li>
                <CheckOption
                  checked={options.templates}
                  onChange={updateOptions}
                  category="outline"
                  attr="templates"
                  disabled={!options.export || !options.sceneCards}
                >
                  <span>{t('Templates')}</span>
                </CheckOption>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    )
  }

  OutlineOptions.propTypes = {
    options: PropTypes.object,
    type: PropTypes.string,
    updateOptions: PropTypes.func,
    lines: PropTypes.array,
    outlineFilter: PropTypes.array,
    actions: PropTypes.object.isRequired,
  }

  const {
    redux,
    pltr: { actions },
  } = connector

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(
      (state) => ({
        outlineFilter: state.present.ui.outlineFilter,
      }),
      (dispatch) => {
        return {
          actions: bindActionCreators(actions.ui, dispatch),
        }
      }
    )(OutlineOptions)
  }

  throw new Error('Could not connect OutlineOptions')
}

export default UnconnectedOutlineOptions
