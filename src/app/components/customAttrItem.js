import React, { Component, PropTypes } from 'react'
import { Glyphicon, Nav, Navbar, NavItem, Button, Input, Label, Popover, OverlayTrigger, Alert } from 'react-bootstrap'
import i18n from 'format-message'

export default class CustomAttrItem extends Component {

  handleEnter = (event) => {
    if (event.which === 13) {
      this.update()
    }
  }

  update = () => {
    let attr = this.refs.attrInput.value
    const paragraph = this.refs.paragraphCheck.checked
    if (paragraph) {
      attr = `${attr}:#:paragraph`
    }
    this.props.update(this.props.index, attr)
  }

  render () {
    let attr = this.props.attr.split(':#:')
    let val = attr[0]
    let checked = attr[1]
    return <li className='list-group-item'>
      <input className='custom-attr-item__input'
        ref='attrInput' onBlur={this.update}
        onKeyDown={this.handleEnter} defaultValue={val} />
      <label className='custom-attr-item__checkbox-label'>
        <input ref='paragraphCheck' type="checkbox" checked={checked} onChange={this.update}/> {i18n('paragraph')}</label>
      <Button onClick={() => this.props.delete(this.props.attr)}><Glyphicon glyph='remove'/></Button>
    </li>
  }
}
