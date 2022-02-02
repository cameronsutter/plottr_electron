import React, { useEffect, useState } from 'react'
import PropTypes from 'react-proptypes'

import OutlineOptionsConnector from './options/OutlineOptions'
import GeneralOptions from './options/GeneralOptions'
import CharacterOptions from './options/CharacterOptions'
import PlaceOptions from './options/PlaceOptions'
import NoteOptions from './options/NoteOptions'

const ExportBodyConnector = (connector) => {
  const OutlineOptions = OutlineOptionsConnector(connector)

  function ExportBody({ type, onChange, exportConfig }) {
    const [options, setOptions] = useState(exportConfig[type])

    useEffect(() => {
      setOptions(exportConfig[type])
    }, [type])

    const updateOptions = (newVal, category, attr) => {
      const newOptions = {
        ...options,
        [category]: {
          ...options[category],
          [attr]: newVal,
        },
      }
      setOptions(newOptions)
      onChange(newOptions)
    }

    if (!type) return null
    if (!options) return null

    return (
      <div className="export-dialog__option-lists">
        {type != 'scrivener' ? (
          <GeneralOptions type={type} options={options.general} updateOptions={updateOptions} />
        ) : null}
        <OutlineOptions options={options.outline} type={type} updateOptions={updateOptions} />
        <NoteOptions type={type} options={options.notes} updateOptions={updateOptions} />
        <CharacterOptions type={type} options={options.characters} updateOptions={updateOptions} />
        <PlaceOptions type={type} options={options.places} updateOptions={updateOptions} />
      </div>
    )
  }

  ExportBody.propTypes = {
    type: PropTypes.string,
    onChange: PropTypes.func,
    exportConfig: PropTypes.object.isRequired,
  }

  const {
    redux,
    pltr: { selectors },
  } = connector

  if (redux) {
    const { connect } = redux

    return connect((state) => ({
      exportConfig: selectors.exportSettingsSelector(state.present),
    }))(ExportBody)
  }

  throw new Error('Could not connect ExportBody')
}

export default ExportBodyConnector
