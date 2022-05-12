import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import cx from 'classnames'
import { Grid, Col, Glyphicon, ButtonToolbar, ButtonGroup, Nav, NavItem } from 'react-bootstrap'
import { v4 as uuidv4 } from 'uuid'

import { t as i18n } from 'plottr_locales'

import Row from '../Row'
import ControlLabel from '../ControlLabel'
import FormGroup from '../FormGroup'
import FormControl from '../FormControl'
import Button from '../Button'
import ImageConnector from './Image'
import { Spinner } from '../Spinner'
import DeleteConfirmModal from '../dialogs/DeleteConfirmModal'
import PlottrModalConnector from '../PlottrModal'
import { readImage, isImageUrl, readImageFromURL } from '../images'
import { checkDependencies } from '../checkDependencies'

const ImagePickerConnector = (connector) => {
  const PlottrModal = PlottrModalConnector(connector)
  const Image = ImageConnector(connector)

  const {
    platform: {
      storage: { saveImageToStorageFromURL, resizeImage },
    },
  } = connector
  checkDependencies({ saveImageToStorageFromURL })

  class ImagePicker extends Component {
    state = {}

    constructor(props) {
      super(props)
      this.fileNameRef = null
    }

    static getDerivedStateFromProps(props, state) {
      const ids = Object.keys(props.images)
        .map(Number)
        .sort((a, b) => a - b)
        .reverse()
      let selected = null
      if (state.justAddedImage) selected = ids[0]
      return {
        tabId: state.tabId || '1',
        selectedId: selected || state.selectedId || props.selectedId,
        open: props.modalOnly || state.open || false,
        editing: state.editing || false,
        inDropZone: state.inDropZone || false,
        sortedIds: ids,
        justAddedImage: false,
        loading: state.loading || false,
        deleting: state.deleting || null,
      }
    }

    handleDragOver = (e) => {
      e.preventDefault()
      this.setState({ inDropZone: true })
    }

    handleDrop = (e) => {
      e.stopPropagation()
      e.preventDefault()
      this.setState({ inDropZone: false })

      const { files } = e.dataTransfer

      if (files && files.length > 0) {
        for (const file of files) {
          if (saveImageToStorageFromURL && this.props.isCloudFile) {
            resizeImage(file, (imageData) => {
              saveImageToStorageFromURL(imageData, file.name).then((internalUrl) => {
                this.props.actions.addImage({ name: file.name, path: internalUrl })
                this.setState({ tabId: '1', justAddedImage: true })
              })
            })
          } else {
            readImage(file, (data) => {
              this.props.actions.addImage({ data, name: file.name, path: file.path })
              this.setState({ tabId: '1', justAddedImage: true })
            })
          }
        }
      }
    }

    getFromURL = (e) => {
      const url = e.target.value
      if (isImageUrl(url)) {
        this.setState({ loading: true })
        if (saveImageToStorageFromURL && this.props.isCloudFile) {
          fetch(url).then((response) => {
            response.blob().then((image) => {
              const tempName = uuidv4()
              resizeImage(image, (imageData) => {
                saveImageToStorageFromURL(imageData, tempName).then((internalUrl) => {
                  this.props.actions.addImage({ name: tempName, path: internalUrl })
                  this.setState({ tabId: '1', justAddedImage: true })
                })
              })
            })
          })
        } else {
          readImageFromURL(url, (strData) => {
            this.props.actions.addImage({ data: strData, name: url, path: url })
            setTimeout(() => {
              this.setState({ tabId: '1', justAddedImage: true, loading: false })
            }, 500)
          })
        }
      }
    }

    renameFile = () => {
      let newName = this.fileNameRef.value
      this.props.actions.renameImage(this.state.selectedId, newName)
      this.setState({ editing: false })
    }

    deleteImage = () => {
      if (this.state.deleting) {
        this.props.actions.deleteImage(this.state.selectedId)
        this.setState({ deleting: false, selectedId: null })
      }
    }

    close = () => {
      this.setState({ open: false })
      if (this.props.onClose) this.props.onClose()
      if (this.props.modalOnly) this.props.close()
    }

    chooseImage = () => {
      const { images } = this.props
      const { selectedId } = this.state
      const idString = `${selectedId}`
      this.props.chooseImage(idString, images[idString].data || images[idString].path)
      this.close()
    }

    chooseNoImage = () => {
      this.props.chooseImage(-1)
      if (this.state.open) this.close()
      this.setState({ selectedId: null })
    }

    uploadNewFile = (event) => {
      if (event.target.files && event.target.files[0]) {
        const file = event.target.files[0]
        if (saveImageToStorageFromURL && this.props.isCloudFile) {
          resizeImage(file, (imageData) => {
            saveImageToStorageFromURL(imageData, file.name).then((internalUrl) => {
              this.props.actions.addImage({ name: file.name, path: internalUrl })
              this.setState({ tabId: '1', justAddedImage: true })
            })
          })
        } else {
          readImage(file, (data) => {
            this.props.actions.addImage({ data, name: file.name, path: file.path })
            this.setState({ tabId: '1', justAddedImage: true })
          })
        }
      }
    }

    renderDelete() {
      if (!this.state.deleting) return null

      const text = i18n(
        'Do you want to remove this image? It will NOT be deleted from your computer'
      )
      return (
        <DeleteConfirmModal
          customText={text}
          onDelete={this.deleteImage}
          onCancel={() => this.setState({ deleting: false })}
        />
      )
    }

    renderUpload() {
      return (
        <Row>
          <Col xs={12}>
            <div
              className={cx('image-picker__dropzone', { dropping: this.state.inDropZone })}
              onDrop={this.handleDrop}
              onDragOver={this.handleDragOver}
            >
              <h2>{i18n('Drop a File Here')}</h2>
              <p>{i18n('or')}</p>
              <ControlLabel htmlFor="fileUpload">
                <div className="btn image-picker__upload-button">
                  <Glyphicon glyph="upload" /> {i18n('Select a File')}
                </div>
              </ControlLabel>
              <FormControl id="fileUpload" type="file" onChange={this.uploadNewFile} />
            </div>
          </Col>
        </Row>
      )
    }

    renderURL() {
      return (
        <Row>
          <Col xs={12}>
            <div className="image-picker__url-wrapper">
              <FormGroup bsSize="large">
                <ControlLabel>
                  <h6>{i18n('Enter the URL of the link:')}</h6>
                </ControlLabel>
                <FormControl
                  onClick={(event) => {
                    event.target.focus()
                  }}
                  placeholder={i18n('URL')}
                  type="text"
                  onChange={this.getFromURL}
                />
              </FormGroup>
              {this.state.loading ? <Spinner /> : null}
            </div>
          </Col>
        </Row>
      )
    }

    renderGallery() {
      return (
        <Row>
          <Col xs={9}>
            <div className="image-picker__images-container">{this.renderImages()}</div>
          </Col>
          <Col xs={3}>{this.renderSidebar()}</Col>
        </Row>
      )
    }

    renderTab() {
      switch (this.state.tabId) {
        case '1':
          return this.renderGallery()
        case '2':
          return this.renderUpload()
        case '3':
          return this.renderURL()
      }
    }

    render() {
      const { darkMode, selectedId, iconOnly, deleteButton } = this.props
      if (this.state.open) {
        return (
          <PlottrModal isOpen={true} onRequestClose={this.close}>
            <div className={cx('image-picker__wrapper', { darkmode: darkMode })}>
              <div className="image-picker__header">
                <div className="pull-right">
                  <Button
                    bsStyle="success"
                    onClick={this.chooseImage}
                    disabled={!this.state.selectedId}
                  >
                    {i18n('Choose')}
                  </Button>
                  <Button onClick={this.close} style={{ marginLeft: '12px' }}>
                    {i18n('Cancel')}
                  </Button>
                </div>
                <Nav
                  bsStyle="tabs"
                  activeKey={this.state.tabId}
                  onSelect={(k) => this.setState({ tabId: k })}
                >
                  <NavItem eventKey="1">
                    <span className="image-picker__title">{i18n('Image Gallery')}</span>
                  </NavItem>
                  <NavItem eventKey="2">
                    <span className="image-picker__title">{i18n('Upload Files')}</span>
                  </NavItem>
                  <NavItem eventKey="3">
                    <span className="image-picker__title">{i18n('Insert from URL')}</span>
                  </NavItem>
                </Nav>
              </div>
              <div className="image-picker__body">
                <Grid fluid>{this.renderTab()}</Grid>
              </div>
            </div>
          </PlottrModal>
        )
      } else {
        let text = iconOnly ? null : ` ${i18n('Choose an image')}`
        let button = (
          <Button title={i18n('Choose an image')} onClick={() => this.setState({ open: true })}>
            <Glyphicon glyph="picture" />
            {text}
          </Button>
        )
        if (selectedId && selectedId != -1 && deleteButton) {
          let deleteText = iconOnly ? null : ` ${i18n('Remove')}`
          return (
            <ButtonGroup>
              {button}
              <Button bsStyle="warning" title={i18n('Remove image')} onClick={this.chooseNoImage}>
                <Glyphicon glyph="ban-circle" />
                {deleteText}
              </Button>
            </ButtonGroup>
          )
        } else {
          return button
        }
      }
    }

    renderName(value) {
      if (this.state.editing) {
        return (
          <FormGroup>
            <FormControl
              type="text"
              defaultValue={value}
              inputRef={(ref) => {
                this.fileNameRef = ref
              }}
            />
            <Button onClick={this.renameFile}>{i18n('Rename')}</Button>
          </FormGroup>
        )
      } else {
        return <p>{value}</p>
      }
    }

    renderToolbar() {
      if (this.state.editing) return null

      return (
        <ButtonToolbar className="card-dialog__button-bar">
          <Button onClick={() => this.setState({ editing: true })}>{i18n('Rename')}</Button>
          <Button bsStyle="danger" onClick={() => this.setState({ deleting: true })}>
            {i18n('Delete')}
          </Button>
        </ButtonToolbar>
      )
    }

    renderImages() {
      const { sortedIds, selectedId } = this.state
      return sortedIds.map((id) => {
        const isSelected = selectedId == id
        const klasses = cx('image-picker__image-wrapper', { selected: isSelected })
        return (
          <div
            key={id}
            className={klasses}
            onClick={() => this.setState({ selectedId: isSelected ? null : id })}
          >
            <Image imageId={id} shape="square" size="large" />
          </div>
        )
      })
    }

    renderSidebar() {
      const { images } = this.props
      const { selectedId } = this.state
      const image = images[`${selectedId}`]
      let body = null
      if (image) {
        body = (
          <div>
            <h6>{i18n('Image Details')}</h6>
            <Image imageId={selectedId} responsive />
            <div className="image-picker__sidebar-tools">
              {this.renderDelete()}
              {this.renderName(image.name)}
              {this.renderToolbar()}
            </div>
          </div>
        )
      }

      return <div className="image-picker__sidebar">{body}</div>
    }
  }

  ImagePicker.propTypes = {
    chooseImage: PropTypes.func.isRequired,
    selectedId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    darkMode: PropTypes.bool,
    iconOnly: PropTypes.bool,
    modalOnly: PropTypes.bool,
    deleteButton: PropTypes.bool,
    close: PropTypes.func,
    onClose: PropTypes.func,
    images: PropTypes.object,
    actions: PropTypes.object,
    isCloudFile: PropTypes.bool,
  }

  const {
    redux,
    pltr: {
      actions: { image },
      selectors,
    },
  } = connector
  checkDependencies({ redux, image })

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(
      (state) => {
        return {
          images: selectors.imagesSelector(state.present),
          darkMode: selectors.isDarkModeSelector(state.present),
          isCloudFile: selectors.isCloudFileSelector(state.present),
        }
      },
      (dispatch) => {
        return {
          actions: bindActionCreators(image, dispatch),
        }
      }
    )(ImagePicker)
  }

  throw new Error('Cant connect ImagePicker')
}

export default ImagePickerConnector
