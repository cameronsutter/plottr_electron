import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Modal from 'react-modal'
import _ from 'lodash'
import MarkDown from 'pagedown'
import * as CardActions from '../actions/cards'
import { ButtonToolbar, Button, DropdownButton } from 'react-bootstrap'

Modal.setAppElement('#timelineview-root')
const md = MarkDown.getSanitizingConverter()

const customStyles = {content: {top: '70px'}}

class CardDialog extends Component {
  constructor (props) {
    super(props)
    this.state = {editing: false}
  }

  closeDialog () {
    this.props.closeDialog()
  }

  handleCreate () {

  }

  deleteCard () {

  }

  render () {
    var ids = {
      beat: _.uniqueId('select-beat-'),
      line: _.uniqueId('select-line-')
    }

    return (<Modal isOpen={true} onRequestClose={this.closeDialog.bind(this)} style={customStyles}>
      <div className='card-dialog'>
        <div className='card-dialog__title'>
          {this.props.card.title}
        </div>
        <div className='card-dialog__position-details'>
          <div className='card-dialog__line'>
            <label className='card-dialog__line-label' htmlFor={ids.line}>Line:
            </label>
          </div>
          <div className='card-dialog__beat'>
            <label className='card-dialog__beat-label' htmlFor={ids.beat}>Beat:
            </label>
          </div>
        </div>
        <div className='card-dialog__description'>
          <div
            className='card-description-editor__display'
            dangerouslySetInnerHTML={{__html: md.makeHtml(this.props.card.description)}} >
          </div>
        </div>
        {this.renderButtonBar()}
      </div>
    </Modal>)
  }

  renderButtonBar () {
    if (this.props.isNewCard) {
      return (
        <ButtonToolbar className='card-dialog__button-bar-create'>
          <Button className='card-dialog__create' bsStyle='success'
            onClick={this.handleCreate.bind(this)}>
            Create
          </Button>
          <Button className='card-dialog__cancel' bsStyle='danger'
            onClick={this.closeDialog.bind(this)}>
            Cancel
          </Button>
        </ButtonToolbar>
      )
    } else {
      return (
        <div className='card-dialog__button-bar-edit'>
          <Button className='card-dialog__close'
            bsStyle='primary'
            onClick={this.closeDialog.bind(this)}>
            Close
          </Button>
          <Button className='card-dialog__delete' bsStyle='danger'
            onClick={this.deleteCard.bind(this)} >
            Delete
          </Button>
        </div>
      )
    }
  }
}
              // <DropdownButton id={ids.line} className='card-dialog__select-line' title={this.getCurrentLine().title}>
              //   {this.renderLineItems()}
              // </DropdownButton>

              // <DropdownButton id={ids.beat} className='card-dialog__select-beat' title={this.getCurrentBeat().title}>
              //   {this.renderBeatItems()}
              // </DropdownButton>


CardDialog.propTypes = {
  card: PropTypes.object,
  sceneId: PropTypes.number.isRequired,
  lineId: PropTypes.number.isRequired,
  isNewCard: PropTypes.bool.isRequired,
  closeDialog: PropTypes.func
}

function mapStateToProps (state) {
  return {}
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(CardActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CardDialog)

// var React = require('react');
// var Router = require('react-router');
// var Modal = require('react-modal/dist/react-modal');
// var _ = require('lodash');
//
// var RBS = require('react-bootstrap');
// var Button = RBS.Button;
// var ButtonToolbar = RBS.ButtonToolbar;
// var DropdownButton = RBS.DropdownButton;
// var MenuItem = RBS.MenuItem;
//
// var CardDialog = React.createClass({
//
//   newCard: {
//     title: 'New Card',
//     description: 'Click to edit'
//   },
//
//   setEditedCardState: function(nextCardState) {
//     var nextCard = _.clone(this.state.editedCard);
//     _.assign(nextCard, nextCardState);
//     this.setState({
//       editedCard: nextCard,
//     }, function() {
//       if (this.state.editedCard.id)
//         this.saveEditedCard();
//     });
//
//   },
//
//   closeModal: function() {
//     this.props.closeEditor();
//   },
//
//   handleCreate: function() {
//     this.saveEditedCard().done(this.closeModal);
//   },
//
//   closeEditor: function() {
//     this.setState({activeEditor: null});
//   },
//
//   saveEditedCard: function() {
//     return WholeBoardStore.saveCard(this.state.editedCard);
//   },
//
//   getCurrentBeat: function() {
//     return _.find(this.state.beats, function(beat) {
//       return beat.id === this.props.beatId;
//     }.bind(this));
//   },
//
//   getCurrentLine: function() {
//     return _.find(this.state.lines, function(line) {
//       return line.id === this.props.lineId;
//     }.bind(this));
//   },
//
//   deleteCard: function() {
//     if (!this.state.editedCard.id) return;
//     WholeBoardStore.deleteCard(this.state.editedCard);
//     this.closeModal();
//   },
//
//   renderButtonBar: function() {
//     if (this.state.isNewCard) {
//       return (
//         <ButtonToolbar className='card-dialog__button-bar-create'>
//           <Button className='card-dialog__create' bsStyle='success'
//             onClick={this.handleCreate}>
//             Create
//           </Button>
//           <Button className='card-dialog__cancel' bsStyle='danger'
//             onClick={this.closeModal}>
//             Cancel
//           </Button>
//         </ButtonToolbar>
//       );
//     } else {
//       return (
//         <div className='card-dialog__button-bar-edit'>
//           <Button className='card-dialog__close'
//             bsStyle='primary'
//             onClick={this.closeModal}>
//             Close
//           </Button>
//           <Button className='card-dialog__delete' bsStyle='danger'
//             onClick={this.deleteCard} >
//             Delete
//           </Button>
//         </div>
//       );
//     }
//   },
//
//   renderBeatItems: function() {
//     return this.state.beats.reduce(function(elts, beat) {
//       elts.push(
//         <MenuItem
//           key={beat.id}
//           onSelect={this.setEditedCardState.bind(this, {beat_id: beat.id})}
//           >
//           {beat.title}
//         </MenuItem>
//       );
//       return elts;
//     }.bind(this), []);
//   },
//
//   renderLineItems: function() {
//     return this.state.lines.reduce(function(elts, line) {
//       elts.push(
//         <MenuItem
//           key={line.id}
//           onSelect={this.setEditedCardState.bind(this, {line_id: line.id})}
//           >
//           {line.title}
//         </MenuItem>
//       );
//       return elts;
//     }.bind(this), []);
//   },
//
//   render: function() {
//     var ids = {
//       beat: _.uniqueId('select-beat-'),
//       line: _.uniqueId('select-line-'),
//     };
//
//     return (
//       <Modal isOpen={true} onRequestClose={this.closeModal}>
//         <div className='card-dialog'>
//           <div className='card-dialog__title'>
//             <CardTitleEditor card={this.state.editedCard || this.newCard}
//               isOpen={this.isTitleOpen()}
//               onRequestOpen={this.openTitle}
//               onRequestClose={this.closeEditor}
//               onRequestSave={this.saveTitle} />
//           </div>
//           <div className='card-dialog__position-details'>
//             <div className='card-dialog__line'>
//               <label className='card-dialog__line-label' htmlFor={ids.line}>Line:
//                 <DropdownButton id={ids.line} className='card-dialog__select-line' title={this.getCurrentLine().title}>
//                   {this.renderLineItems()}
//                 </DropdownButton>
//               </label>
//             </div>
//             <div className='card-dialog__beat'>
//               <label className='card-dialog__beat-label' htmlFor={ids.beat}>Beat:
//                 <DropdownButton id={ids.beat} className='card-dialog__select-beat' title={this.getCurrentBeat().title}>
//                   {this.renderBeatItems()}
//                 </DropdownButton>
//               </label>
//             </div>
//           </div>
//           <div className='card-dialog__description'>
//             <CardDescriptionEditor card={this.state.editedCard || this.newCard}
//               isOpen={this.isDescriptionOpen()}
//               onRequestOpen={this.openDescription}
//               onRequestClose={this.closeEditor}
//               onRequestSave={this.saveDescription} />
//           </div>
//           {this.renderButtonBar()}
//         </div>
//       </Modal>
//     );
//   },
// });
