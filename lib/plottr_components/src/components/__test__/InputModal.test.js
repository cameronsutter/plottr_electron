import React from 'react'
import { mount, shallow } from 'enzyme'
import InputModal, { testIds } from '../InputModal'

describe('InputModal', () => {
  const defaultProps = {
    isOpen: true,
    cancel: jest.fn(),
    title: 'Input modal',
    type: 'text',
    getValue: jest.fn(),
  }

  it('renders the input dialog', () => {
    // using mount here instead of shallow because the Modal.Header component
    // doesnt seem to work with shallow
    const tree = mount(<InputModal {...defaultProps} />)
    const header = tree.find('.modal-header')
    expect(header.text()).toContain(defaultProps.title)
  })

  it('calls cancel when the x button is pressed', () => {
    // using mount so that the X button actually gets rendered
    const tree = mount(<InputModal {...defaultProps} />)
    const xButton = tree.find('.close')
    xButton.simulate('click')
    expect(defaultProps.cancel).toHaveBeenCalled()
  })

  it('calls cancel when the cancel button is pressed', () => {
    const tree = shallow(<InputModal {...defaultProps} />)
    const cancelButton = tree.findByTestId(testIds.cancel)
    cancelButton.simulate('click')
    expect(defaultProps.cancel).toHaveBeenCalled()
  })

  it('calls getValue when ok is pressed', () => {
    const tree = shallow(<InputModal {...defaultProps} />)
    const inputValue = 'test'
    tree.setState({ inputValue })
    const okButton = tree.findByTestId(testIds.ok)
    okButton.simulate('click')
    expect(defaultProps.getValue).toHaveBeenCalledWith(inputValue)
  })

  it('types text and calls getValue when pressing enter', () => {
    // using mount to get at the underlying input
    const tree = mount(<InputModal {...defaultProps} />)
    const inputValue = 'test'
    const input = tree.find('input')
    input.simulate('change', { target: { value: inputValue } })
    const form = tree.find('form')
    form.simulate('submit')
    expect(defaultProps.getValue).toHaveBeenCalledWith(inputValue)
  })
})
