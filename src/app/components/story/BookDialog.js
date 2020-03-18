import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Modal, Form, FormGroup, Col, Row, ControlLabel, FormControl, ButtonToolbar, Button } from 'react-bootstrap'
import i18n from 'format-message'
import * as BookActions from 'actions/books'

class BookDialog extends Component {
  componentWillUnmount () {
    if (!this.props.modal) this.saveEdit()
  }

  saveEdit = () => {
    const { book, modal } = this.props

    let name = ReactDOM.findDOMNode(this.refs.name).value
    let premise = ReactDOM.findDOMNode(this.refs.premise).value
    let genre = ReactDOM.findDOMNode(this.refs.genre).value
    let theme = ReactDOM.findDOMNode(this.refs.theme).value
    this.props.actions.editBook(book.id, {name, premise, genre, theme})
    if (this.props.cancel) this.props.cancel()
  }

  renderToolBar () {
    return <ButtonToolbar>
      <Button bsStyle='success' onClick={this.saveEdit}>{i18n('Save')}</Button>
      {this.props.modal ? <Button onClick={this.props.cancel}>{i18n('Cancel')}</Button> : null}
    </ButtonToolbar>
  }

  renderBody () {
    const { book, modal } = this.props
    return <Form horizontal>
      {modal ? <FormGroup>
        <Col componentClass={ControlLabel} sm={modal ? 3 : 1}>
          {i18n('Book #')}
        </Col>
        <Col sm={modal ? 8 : 5}>
          <span className='lead'>{this.props.bookNumber}</span>
        </Col>
      </FormGroup> : null}
      <FormGroup>
        <Col componentClass={ControlLabel} sm={modal ? 3 : 1}>
          {i18n('Name')}
        </Col>
        <Col sm={modal ? 8 : 5}>
          <FormControl type='text' ref='name' defaultValue={book.name} />
        </Col>
      </FormGroup>
      <FormGroup>
        <Col componentClass={ControlLabel} sm={modal ? 3 : 1}>
          {i18n('Premise')}
        </Col>
        <Col sm={modal ? 8 : 5}>
          <FormControl type='text' ref='premise' defaultValue={book.premise} />
        </Col>
      </FormGroup>
      <FormGroup>
        <Col componentClass={ControlLabel} sm={modal ? 3 : 1}>
          {i18n('Genre')}
        </Col>
        <Col sm={modal ? 8 : 5}>
          <FormControl type='text' ref='genre' defaultValue={book.genre} />
        </Col>
      </FormGroup>
      <FormGroup>
        <Col componentClass={ControlLabel} sm={modal ? 3 : 1}>
          {i18n('Theme')}
        </Col>
        <Col sm={modal ? 8 : 5}>
          <FormControl type='text' ref='theme' defaultValue={book.theme} />
        </Col>
      </FormGroup>
    </Form>
  }

  renderModal () {
    return <Modal show={true} onHide={this.props.cancel}>
      <Modal.Body>
        { this.renderBody() }
      </Modal.Body>
      <Modal.Footer>
        { this.renderToolBar() }
      </Modal.Footer>
    </Modal>
  }

  render () {
    if (this.props.modal) {
      return this.renderModal()
    } else {
      return <div className='edit-book__container'>
        { this.renderBody() }
        <Row>
          <Col sm={6}>
            { this.renderToolBar() }
          </Col>
        </Row>
      </div>
    }
  }

  static propTypes = {
    bookId: PropTypes.number.isRequired,
    cancel: PropTypes.func,
    modal: PropTypes.bool.isRequired,
    ui: PropTypes.object.isRequired,
    book: PropTypes.object,
    bookNumber: PropTypes.number,
    actions: PropTypes.object.isRequired,
  }
}

function mapStateToProps (state, ownProps) {
  return {
    ui: state.ui,
    book: state.books[ownProps.bookId],
    bookNumber: state.books.allIds.indexOf(ownProps.bookId) + 1,
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(BookActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BookDialog)