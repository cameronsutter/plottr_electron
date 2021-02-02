import React, { Component } from 'react'
import { findDOMNode } from 'react-dom'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Cell } from 'react-sticky-table'
import i18n from 'format-message'
import { FormControl, FormGroup, ControlLabel, Glyphicon } from 'react-bootstrap'
import cx from 'classnames'
import TemplatePicker from '../../../common/components/templates/TemplatePicker'
import { actions, selectors } from 'pltr/v2'

const CardActions = actions.card

const { isSeriesSelector } = selectors

class BlankCard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      creating: false,
      dropping: false,
      templateHover: false,
      defaultHover: false,
      showTemplatePicker: false,
      templates: [],
    }
  }

  handleDragEnter = (e) => {
    this.setState({ dropping: true })
  }

  handleDragOver = (e) => {
    this.setState({ dropping: true })
    e.preventDefault()
  }

  handleDragLeave = (e) => {
    this.setState({ dropping: false })
  }

  handleDrop = (e) => {
    e.stopPropagation()
    this.setState({ dropping: false })

    const json = e.dataTransfer.getData('text/json')
    const droppedData = JSON.parse(json)
    if (!droppedData.cardId) return

    const { chapterId, lineId, isSeries } = this.props

    this.props.actions.reorderCardsWithinLine(chapterId, lineId, isSeries, [droppedData.cardId])
  }

  saveCreate = () => {
    const newCard = this.buildCard(findDOMNode(this.refs.titleInput).value)
    this.props.actions.addCard(
      Object.assign(newCard, this.state.templates ? { templates: this.state.templates } : {})
    )
    this.setState({
      creating: false,
      templates: [],
    })
    if (this.props.onDone) this.props.onDone()
  }

  handleFinishCreate = (event) => {
    if (event.which === 13) {
      //enter
      this.saveCreate()
    }
  }

  startCreating = () => {
    this.setState({ creating: true })
  }

  buildCard(title) {
    const { chapterId, lineId } = this.props
    if (this.props.isSeries) {
      return {
        title,
        beatId: chapterId,
        seriesLineId: lineId,
        positionWithinLine: this.props.positionWithinLine || 0,
      }
    } else {
      return { title, chapterId, lineId, positionWithinLine: this.props.positionWithinLine || 0 }
    }
  }

  handleCancelCreate = (event) => {
    if (event.which === 27) {
      //esc
      this.setState({ creating: false })
    }
  }

  handleBlur = () => {
    var newTitle = findDOMNode(this.refs.titleInput).value
    if (newTitle === '') {
      this.setState({ creating: false })
      return false
    } else {
      this.saveCreate()
      this.setState({ creating: false })
    }
  }

  onAddWithTemplateHover = () => {
    this.setState({
      templateHover: true,
    })
  }

  onAddWithTemplateLeave = () => {
    this.setState({
      templateHover: false,
    })
  }

  onAddWithDefaultHover = () => {
    this.setState({
      defaultHover: true,
    })
  }

  onAddWithDefaultLeave = () => {
    this.setState({
      defaultHover: false,
    })
  }

  showTemplatePicker = () => {
    this.setState({
      showTemplatePicker: true,
    })
  }

  handleChooseTemplate = (template) => {
    const newTemplates = this.state.templates.find(({ id }) => id === template.id)
      ? this.state.templates
      : [template, ...this.state.templates]

    this.setState({
      templates: newTemplates,
      showTemplatePicker: false,
      creating: true,
    })
  }

  closeTemplatePicker = () => {
    this.setState({ showTemplatePicker: false })
  }

  renderBlank() {
    const blankCardStyle = {
      borderColor: this.props.color,
      color: this.props.color,
    }
    const addWithTemplateStyle = this.state.templateHover
      ? {
          background: this.props.backgroundColor,
        }
      : {}
    const addWithDefaultStyle = this.state.defaultHover
      ? {
          background: this.props.backgroundColor,
        }
      : {}
    const bodyClass = this.props.verticalInsertion
      ? 'vertical-blank-card__body'
      : 'blank-card__body'
    return (
      <div className={cx(bodyClass, { hover: this.state.dropping })} style={blankCardStyle}>
        <div
          className="template"
          onClick={this.showTemplatePicker}
          onMouseEnter={this.onAddWithTemplateHover}
          onMouseLeave={this.onAddWithTemplateLeave}
          style={addWithTemplateStyle}
        >
          {i18n('Use Template')}
        </div>
        <div
          className="non-template"
          onClick={this.startCreating}
          onMouseEnter={this.onAddWithDefaultHover}
          onMouseLeave={this.onAddWithDefaultLeave}
          style={addWithDefaultStyle}
        >
          <Glyphicon glyph="plus" />
        </div>
      </div>
    )
  }

  renderTemplatePicker() {
    if (!this.state.showTemplatePicker) return null

    return (
      <TemplatePicker
        type={['scenes']}
        modal={true}
        isOpen={this.state.showTemplatePicker}
        close={this.closeTemplatePicker}
        onChooseTemplate={this.handleChooseTemplate}
      />
    )
  }

  renderCreateNew() {
    const cardStyle = {
      borderColor: this.props.color,
    }
    const bodyClass = this.props.verticalInsertion ? 'vertical-card__body' : 'card__body'
    return (
      <div className={bodyClass} style={cardStyle}>
        <FormGroup>
          <ControlLabel>{i18n('Scene Title')}</ControlLabel>
          <FormControl
            type="text"
            autoFocus
            ref="titleInput"
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

    let body = null
    if (this.state.creating) {
      body = this.renderCreateNew()
    } else {
      body = this.renderBlank()
    }

    const vertical = this.props.orientation === 'vertical'
    return (
      <>
        {this.props.verticalInsertion ? (
          body
        ) : (
          <Cell>
            <div
              className={cx('card__cell', { vertical })}
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
        {this.renderTemplatePicker()}
      </>
    )
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.dropping != nextState.dropping) return true
    if (this.state.creating != nextState.creating) return true
    if (this.props.color != nextProps.color) return true
    if (this.state.templateHover !== nextState.templateHover) return true
    if (this.state.defaultHover !== nextState.defaultHover) return true
    if (this.state.showTemplatePicker !== nextState.showTemplatePicker) return true
    return false
  }
}

BlankCard.propTypes = {
  chapterId: PropTypes.number,
  lineId: PropTypes.number,
  verticalInsertion: PropTypes.bool,
  color: PropTypes.string.isRequired,
  backgroundColor: PropTypes.string.isRequired,
  currentTimeline: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  orientation: PropTypes.string,
  isSeries: PropTypes.bool,
  positionWithinLine: PropTypes.number,
  onDone: PropTypes.func,
}

function mapStateToProps(state) {
  return {
    currentTimeline: state.present.ui.currentTimeline,
    orientation: state.present.ui.orientation,
    isSeries: isSeriesSelector(state.present),
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(CardActions, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(BlankCard)
