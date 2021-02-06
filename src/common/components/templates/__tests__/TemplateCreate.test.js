import React from 'react'
import { shallow } from 'enzyme'
import { ipcRenderer } from 'electron'
import { TemplateCreate, testIds } from '../TemplateCreate'

describe('TemplateCreate', () => {
  const props = {
    close: jest.fn(),
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

  it('creates a template', () => {
    const tree = shallow(<TemplateCreate {...props} />)

    tree.findByTestId(testIds.name).simulate('change', event('Name'))
    tree.findByTestId(testIds.description).simulate('change', event('Description'))
    tree.findByTestId(testIds.link).simulate('change', event('Link'))
    tree.findByTestId(testIds.save).simulate('click')

    expect(ipcRenderer.sendTo).toHaveBeenCalledWith('1', 'save-custom-template', {
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
    const tree = shallow(<TemplateCreate {...props} />)
    tree.findByTestId(testIds.cancel).simulate('click')
    expect(ipcRenderer.sendTo).not.toHaveBeenCalled()
    expect(props.close).toHaveBeenCalled()
  })

  it('renders the correct title', () => {
    const tree = shallow(<TemplateCreate {...props} />)
    expect(tree.findByTestId(testIds.title).props().children).toContain('Timeline')

    tree.setProps({ type: 'characters' })
    expect(tree.findByTestId(testIds.title).props().children).toContain('Character')

    tree.setProps({ type: 'scenes' })
    expect(tree.findByTestId(testIds.title).props().children).toContain('Scene')

    tree.setProps({ type: 'other' })
    expect(tree.findByTestId(testIds.title).props().children).toContain('Character')
  })
})
