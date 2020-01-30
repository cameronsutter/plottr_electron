import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Row, Cell } from 'react-sticky-table'
import { Glyphicon } from 'react-bootstrap'
import * as SceneActions from 'actions/scenes'
import * as LineActions from 'actions/lines'
import SceneTitleCell from 'components/timeline/SceneTitleCell'
import LineTitleCell from 'components/timeline/LineTitleCell'
import SceneInsertCell from 'components/timeline/SceneInsertCell'
import { reorderList, insertScene } from 'helpers/lists'
import orientedClassName from 'helpers/orientedClassName'


class TopRow extends Component {

  handleReorderScenes = (originalPosition, droppedPosition) => {
    const scenes = reorderList(originalPosition, droppedPosition, this.props.scenes)
    this.props.sceneActions.reorderScenes(scenes)
  }

  handleReorderLines = (originalPosition, droppedPosition) => {
    const lines = reorderList(originalPosition, droppedPosition, this.props.lines)
    this.props.lineActions.reorderLines(lines)
  }

  handleInsertNewScene = (nextPosition, lineId) => {
    // IDEA: lineId could be used to create a new card at the same time

    const scenes = insertScene(nextPosition, this.props.scenes)
    this.props.sceneActions.reorderScenes(scenes)
  }

  renderLastInsertSceneCell () {
    const { orientation } = this.props.ui
    return <SceneInsertCell key='last-insert' isInSceneList={true} handleInsert={() => this.props.sceneActions.addScene()} isLast={true} orientation={orientation}/>
  }

  renderScenes () {
    const { orientation } = this.props.ui
    const scenes = _.sortBy(this.props.scenes, 'position')
    const renderedScenes = scenes.flatMap(sc => {
      const cells = []
      cells.push(<SceneInsertCell key={`sceneId-${sc.id}-insert`} isInSceneList={true} scenePosition={sc.position} handleInsert={this.handleInsertNewScene} orientation={orientation}/>)
      cells.push(<SceneTitleCell key={`sceneId-${sc.id}`} scene={sc} handleReorder={this.handleReorderScenes} />)
      return cells
    })
    return [<Cell key='placeholder'/>].concat(renderedScenes).concat([this.renderLastInsertSceneCell()])
  }

  renderLines () {
    const lines = _.sortBy(this.props.lines, 'position')
    const renderedLines = lines.map(line => <LineTitleCell key={`line-${line.id}`} line={line} handleReorder={this.handleReorderLines}/>)
    return [<Cell key='placeholder'/>].concat(renderedLines).concat(
      <Row key='insert-line'>
        <Cell>
          <div
            className={orientedClassName('line-list__append-line', this.props.ui.orientation)}
            onClick={() => this.props.lineActions.addLine()}
          >
            <div className={orientedClassName('line-list__append-line-wrapper', this.props.ui.orientation)}>
              <Glyphicon glyph='plus' />
            </div>
          </div>
        </Cell>
      </Row>
    )
  }

  render () {
    let body = null
    if (this.props.ui.orientation === 'horizontal') body = this.renderScenes()
    else body = this.renderLines()
    return <Row>{body}</Row>
  }
}

TopRow.propTypes = {
  ui: PropTypes.object.isRequired,
  scenes: PropTypes.array,
  lines: PropTypes.array,
}

function mapStateToProps (state) {
  let obj = {
    ui: state.ui
  }
  if (state.ui.orientation === 'horizontal') obj.scenes = state.scenes
  else obj.lines = state.lines

  return obj
}

function mapDispatchToProps (dispatch) {
  return {
    sceneActions: bindActionCreators(SceneActions, dispatch),
    lineActions: bindActionCreators(LineActions, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TopRow)
