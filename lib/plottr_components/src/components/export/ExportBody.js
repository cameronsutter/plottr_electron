import React, { useEffect, useState } from 'react'
import PropTypes from 'react-proptypes'
import OutlineOptions from './options/OutlineOptions'
import GeneralOptions from './options/GeneralOptions'
import CharacterOptions from './options/CharacterOptions'
import PlaceOptions from './options/PlaceOptions'
import NoteOptions from './options/NoteOptions'

const ExportBodyConnector = (connector) => {
  const {
    platform: {
      store: { useExportConfigInfo },
    },
  } = connector

  function ExportBody({ type, onChange, lines, ui }) {
    const [exportConfig] = useExportConfigInfo()
    const [options, setOptions] = useState(exportConfig[type])
    const [selectedLines, setSelectedLines] = useState(ui.outlineFilter || [])

    useEffect(() => {
      setOptions(exportConfig[type])
    }, [type])

    const updateOptions = (newVal, category, attr) => {
      const newOptions = { ...options }
      if (typeof attr === 'number') {
        let filterList = []

        // if filter is empty, all is checked, remove only the toggled line
        if (!selectedLines.length) {
          filterList = lines.map((line) => line.id).filter((line) => line !== attr)
        }

        // if checked, then uncheck / remove toggled
        else if (selectedLines.length && selectedLines.includes(attr)) {
          filterList = selectedLines.filter((line) => line !== attr)
        }

        // else push another lineId
        else {
          filterList = [...selectedLines, attr]
        }
        newOptions[category]['filter'] = filterList
        setSelectedLines(filterList)
      } else {
        newOptions[category][attr] = newVal
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
        <OutlineOptions
          lines={lines}
          selectedLines={selectedLines}
          options={options.outline}
          type={type}
          updateOptions={updateOptions}
        />
        <NoteOptions type={type} options={options.notes} updateOptions={updateOptions} />
        <CharacterOptions type={type} options={options.characters} updateOptions={updateOptions} />
        <PlaceOptions type={type} options={options.places} updateOptions={updateOptions} />
      </div>
    )
  }

  ExportBody.propTypes = {
    type: PropTypes.string,
    setType: PropTypes.func,
    onChange: PropTypes.func,
    lines: PropTypes.array,
    ui: PropTypes.object,
  }
  const {
    redux,
    pltr: { selectors },
  } = connector

  const { sortedLinesByBookSelector } = selectors

  if (redux) {
    const { connect } = redux

    return connect((state) => ({
      ui: state.present.ui,
      lines: sortedLinesByBookSelector(state.present),
    }))(ExportBody)
  }

  throw new Error('Could not connect ExportBody')
}

export default ExportBodyConnector
