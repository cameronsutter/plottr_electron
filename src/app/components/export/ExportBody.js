import React, { useEffect, useState } from 'react'
import i18n from 'format-message'
import PropTypes from 'react-proptypes'
import { Button, Nav, NavItem } from 'react-bootstrap'
import { useSettingsInfo } from '../../../common/utils/store_hooks'
import OutlineOptions from './options/OutlineOptions'
import GeneralOptions from './options/GeneralOptions'
import CharacterOptions from './options/CharacterOptions'
import PlaceOptions from './options/PlaceOptions'
import NoteOptions from './options/NoteOptions'

export default function ExportBody({ type, onChange }) {
  const [settings] = useSettingsInfo()
  const [options, setOptions] = useState(settings.export[type])

  useEffect(() => {
    setOptions(settings.export[type])
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
      <GeneralOptions type={type} options={options.general} updateOptions={updateOptions} />
      <OutlineOptions type={type} options={options.outline} updateOptions={updateOptions} />
      <CharacterOptions type={type} options={options.characters} updateOptions={updateOptions} />
      <PlaceOptions type={type} options={options.places} updateOptions={updateOptions} />
      <NoteOptions type={type} options={options.notes} updateOptions={updateOptions} />
    </div>
  )
}

ExportBody.propTypes = {
  type: PropTypes.string,
  setType: PropTypes.func,
  onChange: PropTypes.func,
}
