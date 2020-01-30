import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { Cell } from 'react-sticky-table'
import { Glyphicon } from 'react-bootstrap'
import CardSVGline from 'components/timeline/CardSVGline'
import orientedClassName from 'helpers/orientedClassName'

export default class SceneInsertCell extends Component {
  render () {
    const { scenePosition, lineId, isInSceneList, handleInsert, needsSVGline, color, orientation, isLast } = this.props
    let wrapperKlass = orientedClassName('insert-scene-wrapper', orientation)
    let sceneKlass = 'scene-list__insert'
    if (needsSVGline) wrapperKlass += ' insert-scene-spacer'
    if (isLast) {
      wrapperKlass += ' append-scene'
      sceneKlass += ' append-scene'
    }
    return <Cell>
      <div
        className={orientedClassName(isInSceneList ? sceneKlass : 'line-list__insert-scene', orientation)}
        onClick={() => handleInsert(scenePosition, lineId)}
      >
        {needsSVGline ? <CardSVGline color={color} spacer={true} orientation={orientation}/> : null}
        <div className={wrapperKlass}>
          <Glyphicon glyph='plus' />
        </div>
      </div>
    </Cell>
  }

  static propTypes = {
    handleInsert: PropTypes.func.isRequired,
    isInSceneList: PropTypes.bool.isRequired,
    scenePosition: PropTypes.number,
    lineId: PropTypes.number,
    needsSVGline: PropTypes.bool,
    orientation: PropTypes.string,
    color: PropTypes.string,
    isLast: PropTypes.bool,
  }
}
