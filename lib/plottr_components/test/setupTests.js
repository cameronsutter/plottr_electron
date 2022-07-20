// setup file
import { configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import { t as i18n } from 'plottr_locales'
import ReactWrapper from 'enzyme/ReactWrapper'
import ShallowWrapper from 'enzyme/ShallowWrapper'

i18n.setup({
  missingTranslation: 'ignore',
})

ReactWrapper.prototype.findByTestId = ShallowWrapper.prototype.findByTestId = function (testId) {
  return this.find(`[data-testid="${testId}"]`)
}

ReactWrapper.prototype.findChildWithTestId = ShallowWrapper.prototype.findChildWithTestId =
  function (child, testId) {
    return this.find(`${child}[data-testid="${testId}"]:first-child`)
  }

configure({ adapter: new Adapter() })

jest.mock('electron-util', () => ({
  is: jest.fn(),
}))

jest.mock('electron', () => ({
  ipcRenderer: {
    sendTo: jest.fn(),
  },
  remote: {
    getCurrentWindow: () => ({
      webContents: {
        id: '1',
      },
    }),
  },
  shell: {
    openExternal: jest.fn(),
  },
}))
