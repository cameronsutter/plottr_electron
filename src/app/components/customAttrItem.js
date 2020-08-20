import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { Glyphicon, Button } from 'react-bootstrap'
import i18n from 'format-message'
import DeleteConfirmModal from './dialogs/DeleteConfirmModal'

export default class CustomAttrItem extends Component {
  state = {deleting: false}

  componentDidUpdate () {
    this.refs.nameInput.blur()
  }

  handleEnter = (event) => {
    if (event.which === 13) {
      this.updateName()
    }
  }

  updateName = () => {
    const { index, attr, restrictedValues } = this.props
    const name = this.refs.nameInput.value
    if (name == '' || restrictedValues.includes(name)) { // is nothing? is a restricted value? no op
      this.refs.nameInput.value = attr.name
      return
    }
    if (attr.name == name) return // no changes? no op
    this.props.update(index, attr, {name, type: attr.type})
  }

  updateType = () => {
    const { index, attr } = this.props
    let type = this.refs.paragraphCheck.checked ? 'paragraph' : 'text'
    if (attr.type == type) return // no changes? no op
    this.props.update(index, attr, {name: attr.name, type})
  }

  renderDelete () {
    if (!this.state.deleting) return null
    const { attr } = this.props
    return <DeleteConfirmModal name={attr.name} onDelete={() => this.props.delete(attr.name)} onCancel={() => this.setState({deleting: false})}/>
  }

  renderParagraphCheckBox () {
    const { attr } = this.props
    const checked = attr.type == 'paragraph'
    if (this.props.canChangeType) {
      return <label className='custom-attr-item__checkbox-label'>
        <input ref='paragraphCheck' type="checkbox" checked={checked} onChange={this.updateType}/> {i18n('paragraph')}
      </label>
    } else {
      return <label className='custom-attr-item__checkbox-label text-muted'>{i18n('paragraph')}</label>
    }
  }

  render () {
    const { attr } = this.props
    return <li className='list-group-item'>
      <input className='custom-attr-item__input'
        ref='nameInput' onBlur={this.updateName}
        onKeyDown={this.handleEnter} defaultValue={attr.name} />
      { this.renderParagraphCheckBox() }
      <Button onClick={() => this.setState({deleting: true})}><Glyphicon glyph='remove'/></Button>
      { this.renderDelete() }
    </li>
  }

  static propTypes = {
    index: PropTypes.number,
    attr: PropTypes.object,
    update: PropTypes.func,
    delete: PropTypes.func,
    canChangeType: PropTypes.bool,
    restrictedValues: PropTypes.array,
  }
}
