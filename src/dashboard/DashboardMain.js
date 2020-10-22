import React, { Component } from 'react'
import { ipcRenderer, remote } from 'electron'
const win = remote.getCurrentWindow()
import TemplatePicker from '../common/components/templates/TemplatePicker'

export default class DashboardMain extends Component {
  handleChooseTemplate = (template) => {
    ipcRenderer.send('chose-template', template)
    win.close()
  }

  render () {
    return <TemplatePicker
      type={['project', 'plotlines']}
      modal={false}
      close={() => win.close()}
      onChooseTemplate={this.handleChooseTemplate}
    />
  }
}
