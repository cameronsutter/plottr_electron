import React from 'react'
import { PropTypes } from 'react-proptypes'

import { Overlay } from 'react-bootstrap'

import MiniColorPicker from '../components/MiniColorPicker'
import ColorPickerColor from '../components/ColorPickerColor'

export default {
  title: 'Plottr/MiniColorPicker',
  component: MiniColorPicker,
  argTypes: {
    show: { control: 'boolean' },
  },
}

const Template = ({ show }) => {
  const elRef = React.createRef()

  return (
    <div>
      <ColorPickerColor ref={elRef} />
      <Overlay show={show} placement="bottom" container={() => elRef.current}>
        <MiniColorPicker el={elRef} close={() => {}} chooseColor={() => {}} />
      </Overlay>
    </div>
  )
}

Template.propTypes = {
  show: PropTypes.bool.isRequired,
}

export const Example = Template.bind({})
Example.args = {
  show: false,
}
