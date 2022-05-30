import React, { Component } from 'react'
import PropTypes from 'react-proptypes'

import { t as i18n } from 'plottr_locales'

import Glyphicon from '../Glyphicon'
import UnconnectedRichText from '../rce/RichText'
import UnconnectedImage from '../images/Image'

import { checkDependencies } from '../checkDependencies'

const NoteDetailsConnector = (connector) => {
  const RichText = UnconnectedRichText(connector)
  const Image = UnconnectedImage(connector)

  class NoteDetails extends Component {
    render() {
      const { note, customAttributes, categories } = this.props
      const customAttrNotes = customAttributes.map((attr, idx) => {
        const { name, type } = attr
        let desc
        if (type == 'paragraph') {
          desc = (
            <dd>
              <RichText description={note[name]} />
            </dd>
          )
        } else {
          desc = <dd>{note[name]}</dd>
        }
        return (
          <dl key={idx} className="dl-horizontal">
            <dt>{name}</dt>
            {desc}
          </dl>
        )
      })
      const templateNotes = note.templates.flatMap((t) => {
        return t.attributes.map((attr) => {
          let val
          if (attr.type == 'paragraph') {
            val = (
              <dd>
                <RichText description={attr.value} />
              </dd>
            )
          } else {
            val = <dd>{attr.value}</dd>
          }
          return (
            <dl key={attr.name} className="dl-horizontal">
              <dt>{attr.name}</dt>
              {val}
            </dl>
          )
        })
      })

      const category = categories.find((cat) => cat.id == note.categoryId)

      return (
        <div className="note-list__note-wrapper">
          <div className="note-list__note" onClick={this.props.startEditing}>
            <h4 className="secondary-text">{note.title || i18n('New Note')}</h4>
            <div className="note-list__note-notes">
              <div>
                <dl className="dl-horizontal">
                  <dt>{i18n('Category')}</dt>
                  <dd>{(category && category.name) || i18n('Uncategorized')}</dd>
                </dl>
                {customAttrNotes}
                <dl className="dl-horizontal">
                  <Image responsive imageId={note.imageId} />
                  <dt>{i18n('Notes')}</dt>
                  <dd>
                    <RichText description={note.content} />
                  </dd>
                </dl>
                {templateNotes}
              </div>
              <div className="note-list__right-side">
                <Glyphicon glyph="pencil" />
              </div>
            </div>
          </div>
        </div>
      )
    }

    static propTypes = {
      noteId: PropTypes.number.isRequired,
      note: PropTypes.object.isRequired,
      categories: PropTypes.array.isRequired,
      actions: PropTypes.object.isRequired,
      customAttributes: PropTypes.array.isRequired,
      startEditing: PropTypes.func.isRequired,
    }
  }

  const {
    redux,
    pltr: { selectors },
  } = connector
  const noteActions = connector.pltr.actions.note
  checkDependencies({ redux, selectors, noteActions })

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(
      (state, ownProps) => {
        return {
          note: selectors.singleNoteSelector(state.present, ownProps.noteId),
          categories: state.present.categories.notes,
          customAttributes: state.present.customAttributes.notes,
        }
      },
      (dispatch) => {
        return {
          actions: bindActionCreators(noteActions, dispatch),
        }
      }
    )(NoteDetails)
  }

  throw new Error('Cannot connect NoteDetails')
}

export default NoteDetailsConnector
