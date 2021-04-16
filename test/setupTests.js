// setup file
import { configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import { t } from 'plottr_locales'
import ReactWrapper from 'enzyme/ReactWrapper'
import ShallowWrapper from 'enzyme/ShallowWrapper'

t.setup({
  missingTranslation: 'ignore',
})

ReactWrapper.prototype.findByTestId = ShallowWrapper.prototype.findByTestId = function (testId) {
  return this.find(`[data-testid="${testId}"]`)
}

ReactWrapper.prototype.findTypeWithTestId = ShallowWrapper.prototype.findTypeWithTestId = function (
  type,
  testId
) {
  return this.find(`${type}[data-testid="${testId}"]`)
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
    app: {
      getVersion: jest.fn(),
    },
    getCurrentWindow: () => ({
      webContents: {
        id: '1',
      },
    }),
  },
  shell: {
    openExternal: jest.fn(),
  },
  app: {
    getPath: () => '/tmp',
    getName: jest.fn(),
    getVersion: jest.fn(),
  },
}))

class MockStore {
  constructor({ name }) {
    this.name = name
    this.store = {}
  }
  get(id) {
    if (id != null) return this.store[id]
    return this.store
  }
  set(id, value) {
    this.store[id] = value
  }
  delete(id) {
    delete this.store[id]
  }
}

jest.mock('electron-store', () => MockStore)
