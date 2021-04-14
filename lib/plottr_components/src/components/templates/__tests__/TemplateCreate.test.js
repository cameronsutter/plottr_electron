import React from 'react'
import { mount } from 'enzyme'
import TemplateCreateConnector, { testIds } from '../TemplateCreate'
import connector from '../../__fixtures__/pltr-connector'

const TemplateCreate = TemplateCreateConnector(connector)

describe('TemplateCreate', () => {
  const props = {
    close: jest.fn(),
    saveTemplate: jest.fn(),
    type: 'plotlines',
    ui: {
      darkMode: false,
    },
  }

  const event = (value) => ({
    currentTarget: {
      value,
    },
  })

  beforeEach(() => jest.clearAllMocks())

  it.skip('creates a template', () => {
    const tree = mount(<TemplateCreate {...props} />)

    tree.findTypeWithTestId('FormControl', testIds.name).simulate('change', event('Name'))
    tree
      .findTypeWithTestId('FormControl', testIds.description)
      .simulate('change', event('Description'))
    tree.findTypeWithTestId('FormControl', testIds.link).simulate('change', event('Link'))
    tree.findTypeWithTestId('Button', testIds.save).simulate('click')

    expect(props.saveTemplate).toHaveBeenCalledWith({
      type: 'plotlines',
      data: {
        name: 'Name',
        description: 'Description',
        link: 'Link',
      },
    })
    expect(props.close).toHaveBeenCalled()
  })

  it('closes on cancel', () => {
    const tree = mount(<TemplateCreate {...props} />)

    tree.findTypeWithTestId('Button', testIds.cancel).simulate('click')
    expect(props.close).toHaveBeenCalled()
  })

  it('renders the correct title', () => {
    const tree = mount(<TemplateCreate {...props} />)

    expect(tree.findTypeWithTestId('ModalTitle', testIds.title).props().children).toContain(
      'Timeline'
    )

    tree.setProps({ type: 'characters' })
    expect(tree.findTypeWithTestId('ModalTitle', testIds.title).props().children).toContain(
      'Character'
    )

    tree.setProps({ type: 'scenes' })
    expect(tree.findTypeWithTestId('ModalTitle', testIds.title).props().children).toContain('Scene')

    tree.setProps({ type: 'other' })
    expect(tree.findTypeWithTestId('ModalTitle', testIds.title).props().children).toContain(
      'Character'
    )
  })
})
