import { ipcRenderer, remote } from 'electron'
import React, { Component } from 'react'
import { findDOMNode } from 'react-dom'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Button, FormControl, FormGroup, ControlLabel } from 'react-bootstrap'
import Modal from 'react-modal'
import * as CustomAttributeActions from 'actions/customAttributes'
import CustomAttrItem from 'components/customAttrItem'
import i18n from 'format-message'
import cx from 'classnames'
import { characterCustomAttributesThatCanChangeSelector } from '../../selectors/customAttributes'
import { FaSave } from 'react-icons/fa'

const modalStyles = {content: {top: '70px', width: '50%', marginLeft: '25%'}}
const win = remote.getCurrentWindow()

class CustomAttributeModal extends Component {
  state = { addAttrText: '' }

  startSaveAsTemplate = () => {
    ipcRenderer.sendTo(win.webContents.id, 'save-as-template-start', 'characters') // sends this message to this same process
  }

  handleType = () => {
    const attr = findDOMNode(this.refs.attrInput).value
    this.setState({addAttrText: attr})
  }

  handleAddCustomAttr = (event) => {
    if (event.which === 13) {
      this.saveAttr()
      if (this.refs.attrInput) {
        findDOMNode(this.refs.attrInput).focus()
      }
    }
  }

  saveAttr = () => {
    const name = findDOMNode(this.refs.attrInput).value
    this.props.actions.addCharacterAttr({name, type: 'text'})

    this.setState({addAttrText: ''})
  }

  removeAttr = (attr) => {
    this.props.actions.removeCharacterAttr(attr)
    this.setState({addAttrText: this.state.addAttrText}) // no op
  }

  updateAttr = (index, currentAttr, newAttr) => {
    this.props.actions.editCharacterAttr(index, currentAttr, newAttr)
  }

  render () {
    const { customAttributes, ui, customAttributesThatCanChange } = this.props
    const attrs = customAttributes.map((attr, idx) => <CustomAttrItem key={idx} attr={attr} index={idx} update={this.updateAttr} delete={this.removeAttr} canChangeType={customAttributesThatCanChange.includes(attr.name)}/> )
    if (ui.darkMode) {
      modalStyles.content.backgroundColor = '#666'
    } else {
      modalStyles.content.backgorundColor='#f1f5f8'
    }
    return <Modal isOpen={true} onRequestClose={this.props.closeDialog} style={modalStyles}>
      <div className={cx('custom-attributes__wrapper', {darkmode: ui.darkMode})}>
        <Button className='pull-right' onClick={this.props.closeDialog}>
          {i18n('Close')}
        </Button>
        {customAttributes.length ?
          <Button className='pull-right character-list__custom-attributes__save-as-template' onClick={this.startSaveAsTemplate}>
            <FaSave className='svg-save-template'/> {i18n('Save as Template')}
          </Button>
        : null }
        <h3>{i18n('Custom Attributes for Characters')}</h3>
        <p className='sub-header'>{i18n('Choose what you want to track about your characters')}</p>
        <div className='character-list__custom-attributes-add-button'>
          <FormGroup>
            <ControlLabel>{i18n('Add attributes')}</ControlLabel>
            <FormControl type='text' ref='attrInput'
              value={this.state.addAttrText}
              onChange={this.handleType} onKeyDown={this.handleAddCustomAttr} />
          </FormGroup>
          <Button bsStyle='success' onClick={this.saveAttr}>
            {i18n('Add')}
          </Button>
        </div>
        <div className='character-list__custom-attributes-list-wrapper'>
          {attrs}
        </div>
      </div>
    </Modal>
  }

  static propTypes = {
    closeDialog: PropTypes.func.isRequired,
    customAttributes: PropTypes.array.isRequired,
    customAttributesThatCanChange: PropTypes.array,
    ui: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
  }
}

function mapStateToProps (state) {
  return {
    customAttributes: state.present.customAttributes.characters,
    customAttributesThatCanChange: characterCustomAttributesThatCanChangeSelector(state.present),
    ui: state.present.ui,
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(CustomAttributeActions, dispatch),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CustomAttributeModal)
