import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as ImageActions from 'actions/images'
import Modal from 'react-modal'
import cx from 'classnames'
import { FormControl, FormGroup, ControlLabel, Button, Row, Col, Image, Glyphicon } from 'react-bootstrap'
import i18n from 'format-message'
import { readImage } from '../helpers/images'

const customStyles = {content: {top: '70px'}}

class ImagePicker extends Component {
  constructor (props) {
    super(props)
    this.state = {
      imageId: props.current,
      open: false,
    }
  }

  close = () => {
    this.setState({open: false})
  }

  chooseImage = () => {
    this.props.chooseImage(this.state.imageId)
    this.close()
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
    if (this.state.open) {
      let klasses = 'image-picker__wrapper'
      if (this.props.darkMode == true) {
        klasses += ' darkmode'
        customStyles.content.backgroundColor = '#888'
      }
      return <Modal isOpen={true} onRequestClose={this.close} style={customStyles}>
        <div className={klasses}>
          <h2 className='image-picker__title'>{i18n('Your images')}</h2>
          <div className='image-picker__inputs-wrapper form-horizontal'>
            <Row>
              <Col xs={5} >
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
              <Col xs={2}>
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
      return <Button onClick={() => this.setState({open: true})}><Glyphicon glyph='picture'/>{' '}{i18n('Choose an image')}</Button>
    }
  }

  renderImages () {
    const { images } = this.props
    return Object.keys(images).map(id => {
      const klasses = cx('image-picker__image-wrapper', {selected: this.state.imageId == id})
      return <div key={images[id].name} className={klasses} onClick={() => this.setState({imageId: id})}>
        <Image src={images[id].data} responsive rounded />
        <p>{images[id].name}</p>
      </div>
    })
  }
}

ImagePicker.propTypes = {
  chooseImage: PropTypes.func.isRequired,
  current: PropTypes.string,
  darkMode: PropTypes.bool,
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
