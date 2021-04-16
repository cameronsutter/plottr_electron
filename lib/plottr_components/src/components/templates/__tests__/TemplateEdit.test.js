import React from 'react'
import { shallow } from 'enzyme'
import TemplateEdit, { testIds } from '../TemplateEdit'

describe('TemplateEdit', () => {
  const props = {
    cancel: jest.fn(),
    saveEdit: jest.fn(),
    darkMode: false,
    template: {
      id: '1',
      name: 'Template',
      description: 'A template',
      link: '',
    },
  }

  const event = (value) => ({
    currentTarget: {
      value,
    },
  })

  beforeEach(() => jest.clearAllMocks())

  it('edits a template', () => {
    const tree = shallow(<TemplateEdit {...props} />)

    tree.findByTestId(testIds.name).simulate('change', event('Name'))
    tree.findByTestId(testIds.description).simulate('change', event('Description'))
    tree.findByTestId(testIds.link).simulate('change', event('Link'))
    tree.findByTestId(testIds.save).simulate('click')

    expect(props.saveEdit).toHaveBeenCalledWith({
      id: '1',
      name: 'Name',
      description: 'Description',
      link: 'Link',
    })
  })

  it('cancels an edit', () => {
    const tree = shallow(<TemplateEdit {...props} />)
    tree.findByTestId(testIds.cancel).simulate('click')
    expect(props.cancel).toHaveBeenCalled()
  })
})
