// setup file
import { configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import i18n from 'format-message'
import ReactWrapper from 'enzyme/ReactWrapper'
import ShallowWrapper from 'enzyme/ShallowWrapper'

i18n.setup({
  missingTranslation: 'ignore',
})

ReactWrapper.prototype.findByTestId = ShallowWrapper.prototype.findByTestId = function (testId) {
  return this.find(`[data-testid="${testId}"]`)
}

configure({ adapter: new Adapter() })

jest.mock('electron-util', () => ({
  is: jest.fn(),
}))
