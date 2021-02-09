import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Cell } from 'react-sticky-table'
import i18n from 'format-message'
import { FormControl, FormGroup, ControlLabel, Glyphicon } from 'react-bootstrap'
import cx from 'classnames'
import TemplatePicker from '../../../common/components/templates/TemplatePicker'
import { lineColors, actions, selectors } from 'pltr/v2'

const CardActions = actions.card

const { isSmallSelector, isMediumSelector } = selectors
const { lightBackground } = lineColors

class BlankCard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      creating: false,
      templateHover: false,
      defaultHover: false,
      showTemplatePicker: false,
      templates: [],
      inDropZone: false,
      dropDepth: 0,
    }

    this.titleInputRef = React.createRef()
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

    const { chapterId, lineId } = this.props

    this.props.actions.reorderCardsWithinLine(chapterId, lineId, [droppedData.cardId])
  }

  saveCreate = () => {
    const newCard = this.buildCard(this.titleInputRef.current.value)
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
    this.setState({ creating: true })
  }

  buildCard(title) {
    const { chapterId, lineId } = this.props
    return {
      title,
      beatId: chapterId,
      chapterId,
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
    var newTitle = this.titleInputRef.current.value
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
    const { color, verticalInsertion, isSmall } = this.props
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
    const addWithTemplateStyle = this.state.templateHover
      ? {
          background: lightBackground(color),
        }
      : {}
    const addWithDefaultStyle = this.state.defaultHover
      ? {
          background: lightBackground(color),
        }
      : {}
    const bodyClass = verticalInsertion ? 'vertical-blank-card__body' : 'blank-card__body'
    return (
      <div className={cx(bodyClass, { hover: this.state.inDropZone })} style={blankCardStyle}>
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
        showTemplateSaveButton={false}
      />
    )
  }

  renderCreateNew() {
    const { color } = this.props
    const cardStyle = { borderColor: color }
    return (
      <div className="card__body" style={cardStyle}>
        <FormGroup>
          <ControlLabel>{i18n('Scene Title')}</ControlLabel>
          <FormControl
            type="text"
            autoFocus
            inputRef={this.titleInputRef}
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

    if (this.props.isSmall) return body

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
    if (this.state.inDropZone != nextState.inDropZone) return true
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
  currentTimeline: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  orientation: PropTypes.string,
  positionWithinLine: PropTypes.number,
  onDone: PropTypes.func,
  isSmall: PropTypes.bool,
  isMedium: PropTypes.bool,
  actions: PropTypes.object,
}

function mapStateToProps(state) {
  return {
    currentTimeline: state.present.ui.currentTimeline,
    orientation: state.present.ui.orientation,
    isSmall: isSmallSelector(state.present),
    isMedium: isMediumSelector(state.present),
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(CardActions, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(BlankCard)
