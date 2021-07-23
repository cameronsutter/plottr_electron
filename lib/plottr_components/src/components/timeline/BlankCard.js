import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { Cell } from 'react-sticky-table'
import { t as i18n } from 'plottr_locales'
import { FormControl, FormGroup, ControlLabel, Glyphicon } from 'react-bootstrap'
import cx from 'classnames'
import { lineColors } from 'pltr/v2'
import { orientedClassName } from 'pltr/v2/helpers/orientedClassName'

const { lightBackground } = lineColors

const BlankCardConnector = (connector) => {
  class BlankCard extends Component {
    constructor(props) {
      super(props)
      this.state = {
        creating: false,
        templateHover: false,
        hovering: false,
        showTemplatePicker: false,
        templates: [],
        inDropZone: false,
        dropDepth: 0,
      }

      this.titleInputRef = null
    }

    handleDragEnter = (e) => {
      this.setState({ dropDepth: this.state.dropDepth + 1 })
    }

    handleDragOver = (e) => {
      e.preventDefault()
      this.setState({ inDropZone: true })
    }

    handleDragLeave = (e) => {
      let dropDepth = this.state.dropDepth
      --dropDepth
      this.setState({ dropDepth: dropDepth })
      if (dropDepth > 0) return
      this.setState({ inDropZone: false })
    }

    handleDrop = (e) => {
      e.stopPropagation()
      this.setState({ inDropZone: false, dropDepth: 0 })

      const json = e.dataTransfer.getData('text/json')
      const droppedData = JSON.parse(json)
      if (!droppedData.cardId) return

      const { beatId, lineId } = this.props

      this.props.actions.reorderCardsWithinLine(beatId, lineId, [droppedData.cardId])
    }

    saveCreate = () => {
      const newCard = this.buildCard(this.titleInputRef.value)
      this.props.actions.addCard(
        Object.assign(newCard, this.state.templates ? { templates: this.state.templates } : {})
      )
      this.setState({
        creating: false,
        templates: [],
      })
      if (this.props.onDone) this.props.onDone()
    }

    createFromSmall = () => {
      const newCard = this.buildCard('')
      this.props.actions.addCard(newCard)
    }

    handleFinishCreate = (event) => {
      if (event.which === 13) {
        //enter
        this.saveCreate()
      }
    }

    startCreating = () => {
      if (this.props.readOnly) return
      this.setState({ creating: true })
    }

    buildCard(title) {
      const { beatId, lineId } = this.props
      return {
        title,
        beatId,
        lineId,
        positionWithinLine: this.props.positionWithinLine || 0,
      }
    }

    handleCancelCreate = (event) => {
      if (event.which === 27) {
        //esc
        this.setState({ creating: false })
      }
    }

    handleBlur = () => {
      var newTitle = this.titleInputRef.value
      if (newTitle === '') {
        this.setState({ creating: false })
        return false
      } else {
        this.saveCreate()
        this.setState({ creating: false })
      }
    }

    onHover = () => {
      this.setState({
        hovering: true,
      })
    }

    onLeave = () => {
      this.setState({
        hovering: false,
      })
    }

    renderBlank() {
      const { color, verticalInsertion, orientation, isSmall, isMedium, readOnly } = this.props
      if (isSmall) {
        const smallStyle = { borderColor: color }
        return (
          <td
            onDragEnter={this.handleDragEnter}
            onDragOver={this.handleDragOver}
            onDragLeave={this.handleDragLeave}
            onDrop={this.handleDrop}
          >
            <div
              className={cx('blank-circle', { hover: this.state.inDropZone })}
              style={smallStyle}
              onClick={this.createFromSmall}
            />
          </td>
        )
      }

      const blankCardStyle = {
        borderColor: color,
        color: color,
      }
      const hoveringStyles = this.state.hovering
        ? {
            background: lightBackground(color),
          }
        : {}
      const bodyKlass = cx(orientedClassName('blank-card__body', orientation), {
        disabled: readOnly,
        'vertical-blank-card__body': verticalInsertion,
      })
      return (
        <div
          className={cx(bodyKlass, { hover: this.state.inDropZone, 'medium-timeline': isMedium })}
          style={blankCardStyle}
        >
          <div
            className="non-template"
            onClick={this.startCreating}
            onMouseEnter={this.onHover}
            onMouseLeave={this.onLeave}
            style={hoveringStyles}
          >
            <Glyphicon glyph="plus" />
          </div>
        </div>
      )
    }

    renderCreateNew() {
      const { color, isMedium } = this.props
      const cardStyle = { borderColor: color }
      const bodyKlass = cx('card__body', { 'medium-timeline': isMedium })
      return (
        <div className={bodyKlass} style={cardStyle}>
          <FormGroup>
            <ControlLabel>{i18n('Scene Title')}</ControlLabel>
            <FormControl
              type="text"
              autoFocus
              inputRef={(ref) => {
                this.titleInputRef = ref
              }}
              bsSize="small"
              onBlur={this.handleBlur}
              onKeyDown={this.handleCancelCreate}
              onKeyPress={this.handleFinishCreate}
            />
          </FormGroup>
        </div>
      )
    }

    render() {
      window.SCROLLWITHKEYS = !this.state.creating
      const { orientation, verticalInsertion, isSmall, isMedium } = this.props

      let body = null
      if (this.state.creating) {
        body = this.renderCreateNew()
      } else {
        body = this.renderBlank()
      }

      if (isSmall) return body

      const vertical = orientation === 'vertical'
      return (
        <>
          {verticalInsertion ? (
            body
          ) : (
            <Cell>
              <div
                className={cx('card__cell', { vertical, 'medium-timeline': isMedium })}
                onDragEnter={this.handleDragEnter}
                onDragOver={this.handleDragOver}
                onDragLeave={this.handleDragLeave}
                onDrop={this.handleDrop}
              >
                {/* This div is necessary to match the structure of scene cell cards
                   and thus get the styles to apply in the same way (flexbox) */}
                <div>{body}</div>
              </div>
            </Cell>
          )}
        </>
      )
    }

    shouldComponentUpdate(nextProps, nextState) {
      if (this.state.inDropZone != nextState.inDropZone) return true
      if (this.state.creating != nextState.creating) return true
      if (this.props.color != nextProps.color) return true
      if (this.state.hovering !== nextState.hovering) return true
      if (this.state.showTemplatePicker !== nextState.showTemplatePicker) return true
      return false
    }
  }

  BlankCard.propTypes = {
    beatId: PropTypes.number,
    lineId: PropTypes.number,
    verticalInsertion: PropTypes.bool,
    color: PropTypes.string.isRequired,
    currentTimeline: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    orientation: PropTypes.string,
    positionWithinLine: PropTypes.number,
    onDone: PropTypes.func,
    isSmall: PropTypes.bool,
    isMedium: PropTypes.bool,
    actions: PropTypes.object,
    readOnly: PropTypes.bool,
  }

  const {
    redux,
    pltr: { actions, selectors },
  } = connector
  const CardActions = actions.card
  const { isSmallSelector, isMediumSelector, canWriteSelector } = selectors

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(
      (state) => {
        return {
          currentTimeline: state.present.ui.currentTimeline,
          orientation: state.present.ui.orientation,
          isSmall: isSmallSelector(state.present),
          isMedium: isMediumSelector(state.present),
          readOnly: !canWriteSelector(state.present),
        }
      },
      (dispatch) => {
        return {
          actions: bindActionCreators(CardActions, dispatch),
        }
      }
    )(BlankCard)
  }

  throw new Error('Could not connect BlankCard')
}

export default BlankCardConnector
