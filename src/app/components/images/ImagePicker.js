import React, { Component } from 'react'
import { findDOMNode } from 'react-dom'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as ImageActions from 'actions/images'
import Modal from 'react-modal'
import cx from 'classnames'
import { FormControl, ControlLabel, Button, Row, Col, Glyphicon, ButtonToolbar, FormGroup, ButtonGroup } from 'react-bootstrap'
import Image from './Image'
import i18n from 'format-message'
import { readImage } from '../../helpers/images'

const customStyles = {content: {top: '70px'}}

class ImagePicker extends Component {
  constructor (props) {
    super(props)
    this.state = {
      imageId: props.selectedId,
      open: false,
      editing: null,
    }
  }

  renameFile = () => {
    let newName = findDOMNode(this.refs.fileName).value
    this.props.actions.renameImage(this.state.editing, newName)
    this.setState({editing: null})
  }

  deleteImage = (id) => {
    let text = i18n('Do you want to remove this image? It will NOT be deleted from your computer')
    if (window.confirm(text)) {
      this.props.actions.deleteImage(id)
    }
  }

  close = () => {
    this.setState({open: false})
  }

  chooseImage = () => {
    this.props.chooseImage(this.state.imageId)
    this.close()
  }

  chooseNoImage = () => {
    this.props.chooseImage(-1)
    if (this.state.open) this.close()
    this.setState({imageId: null})
  }

  uploadNewFile = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0]
      readImage(file, data => {
        this.props.actions.addImage({data, name: file.name, path: file.path})
      })
    }
  }

  render () {
    const { darkMode, selectedId, iconOnly, deleteButton } = this.props
    if (this.state.open) {
      if (darkMode) {
        customStyles.content.backgroundColor = '#666'
      }
      return <Modal isOpen={true} onRequestClose={this.close} style={customStyles}>
        <div className={cx('image-picker__wrapper', {darkmode: darkMode})}>
          <h2 className='image-picker__title'>{i18n('Image Gallery')}</h2>
          <div className='image-picker__inputs-wrapper form-horizontal'>
            <Row>
              <Col xs={4}>
                <h5 className='secondary-text'>{i18n('Choose an image below or upload a new one')}</h5>
              </Col>
              <Col xs={2}>
                <ControlLabel htmlFor='fileUpload'>
                  <div className='btn image-picker__upload-button'><Glyphicon glyph='upload'/>{' '}{i18n('Upload a new image')}</div>
                </ControlLabel>
              </Col>
              <Col xs={2}>
                <FormControl id='fileUpload' type='file' onChange={this.uploadNewFile} />
              </Col>
              <Col xs={4}>
                <div className='image-picker__button-wrapper'>
                  <Button bsStyle='success' onClick={this.chooseImage}>{i18n('Choose')}</Button>
                  <Button onClick={this.close}>{i18n('Cancel')}</Button>
                </div>
              </Col>
            </Row>
          </div>
          <div className='image-picker__images-container'>
            {this.renderImages()}
          </div>
        </div>
      </Modal>
    } else {
      let text = iconOnly ? null : ` ${i18n('Choose an image')}`
      let button = <Button title={i18n('Choose an image')} onClick={() => this.setState({open: true})}><Glyphicon glyph='picture'/>{text}</Button>
      if (selectedId && selectedId != -1 && deleteButton) {
        let deleteText = iconOnly ? null : ` ${i18n('Remove')}`
        return <ButtonGroup>
          { button }
          <Button bsStyle='warning' title={i18n('Remove image')} onClick={this.chooseNoImage}><Glyphicon glyph='ban-circle'/>{deleteText}</Button>
        </ButtonGroup>
      } else {
        return button
      }
    }
  }

  renderName (id, value) {
    if (this.state.editing == id) {
      return <FormGroup>
        <FormControl type='text' defaultValue={value} ref='fileName' />
        <Button onClick={this.renameFile}>{i18n('Rename')}</Button>
      </FormGroup>
    } else {
      return <p>{value}</p>
    }
  }

  renderToolbar (id) {
    if (this.state.editing == id) {
      return null
    } else {
      return <ButtonToolbar className='card-dialog__button-bar'>
        <Button onClick={() => this.setState({editing: id})}>
          {i18n('Rename')}
        </Button>
        <Button bsStyle='danger' onClick={() => this.deleteImage(id)} >
          {i18n('Delete')}
        </Button>
      </ButtonToolbar>
    }
  }

  renderImages () {
    const { images } = this.props
    return Object.keys(images).map(id => {
      const isSelected = this.state.imageId == id
      const klasses = cx('image-picker__image-wrapper', {selected: isSelected})
      return <div key={images[id].name} className={klasses} onClick={() => this.setState({imageId: id})}>
        {isSelected ? <span className='label label-success'>{i18n('selected')}</span> : null}
        <Image responsive imageId={id} />
        { this.renderName(id, images[id].name) }
        { this.renderToolbar(id) }
      </div>
    })
  }
}

ImagePicker.propTypes = {
  chooseImage: PropTypes.func.isRequired,
  selectedId: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  darkMode: PropTypes.bool,
  iconOnly: PropTypes.bool,
  deleteButton: PropTypes.bool,
}

function mapStateToProps (state) {
  return {
    images: state.images,
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(ImageActions, dispatch),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ImagePicker)
