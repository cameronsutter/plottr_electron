import React from 'react'
import { shallow } from 'enzyme'
import TemplatePicker, { testIds } from '../TemplatePicker'
// import { customTemplateStore } from '../../../../common/utils/templates'
import { customTemplate } from '../__fixtures__/template'
import { shell } from 'electron'

describe.skip('TemplatePicker', () => {
  const props = {
    modal: false,
    close: jest.fn(),
    onChooseTemplate: jest.fn(),
    isOpen: true,
    type: ['plotlines', 'projects', 'custom'],
    darkMode: false,
    canMakeCharacterTemplates: true,
    showCancelButton: true,
    confirmButtonText: 'Choose',
  }
  const template = customTemplate()
  // customTemplateStore.set(template.id, template)

  beforeEach(() => jest.clearAllMocks())

  it('saves edits to custom templates', async () => {
    const tree = shallow(<TemplatePicker {...props} />)
    tree.findByTestId(testIds[`template-${template.id}`]).simulate('click')
    tree.findByTestId(testIds.edit).first().simulate('click', { stopPropagation: jest.fn() })

    tree.find('TemplateEdit').prop('saveEdit')({
      id: template.id,
      name: 'Name',
      description: 'Description',
      link: 'https://google.com',
    })

    expect(tree.findByTestId(testIds[`name-${template.id}`]).text()).toContain('Name')
    expect(tree.findByTestId(testIds[`description-${template.id}`]).text()).toContain('Description')

    tree.findByTestId(testIds.link).simulate('click')
    expect(shell.openExternal).toHaveBeenCalledWith('https://google.com')
  })

  describe('save template button', () => {
    beforeAll(() => {
      // customTemplateStore.delete(template.id)
    })
    afterAll(() => {
      // customTemplateStore.set(template.id, template)
    })
    it('it shows the save button', () => {
      const tree = shallow(<TemplatePicker {...props} />)
      expect(tree.findByTestId(testIds.save).exists()).toEqual(true)
    })
    it('hides the save button', () => {
      const tree = shallow(<TemplatePicker {...props} />)
      expect(tree.findByTestId(testIds.save).exists()).toEqual(false)
    })
  })

  describe('cancel button', () => {
    it('shows the cancel button', () => {
      const tree = shallow(<TemplatePicker {...props} />)
      expect(tree.findByTestId(testIds.cancel).exists()).toEqual(true)
    })
    it('hides the cancel button', () => {
      const tree = shallow(<TemplatePicker {...props} showCancelButton={false} />)
      expect(tree.findByTestId(testIds.cancel).exists()).toEqual(false)
    })
  })

  describe('confirm button', () => {
    it('shows custom text in the button', () => {
      const tree = shallow(<TemplatePicker {...props} confirmButtonText="Custom" />)
      expect(tree.findByTestId(testIds.confirm).prop('children')).toContain('Custom')
    })
  })
})
