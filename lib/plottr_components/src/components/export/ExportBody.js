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

  function ExportBody({ type, onChange, lines, ui, actions }) {
    const [exportConfig] = useExportConfigInfo()
    const [options, setOptions] = useState(exportConfig[type])

    useEffect(() => {
      setOptions(exportConfig[type])
    }, [type])

    const updateOptions = (newVal, category, attr) => {
      const newOptions = { ...options }
      newOptions[category][attr] = newVal
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
          outlineFilter={ui.outlineFilter}
          options={options.outline}
          type={type}
          updateOptions={updateOptions}
          setOutlineFilter={actions.setOutlineFilter}
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
    actions: PropTypes.object.isRequired,
  }
  const {
    redux,
    pltr: { actions, selectors },
  } = connector

  const { sortedLinesByBookSelector } = selectors

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(
      (state) => {
        return {
          ui: state.present.ui,
          lines: sortedLinesByBookSelector(state.present),
        }
      },
      (dispatch) => {
        return {
          actions: bindActionCreators(actions.ui, dispatch),
        }
      }
    )(ExportBody)
  }

  throw new Error('Could not connect ExportBody')
}

export default ExportBodyConnector
