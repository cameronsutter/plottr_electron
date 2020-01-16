import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { Cell } from 'react-sticky-table'
import { Glyphicon } from 'react-bootstrap'
import CardSVGline from 'components/timeline/cardSVGline'

export default class SceneInsertCell extends Component {
  render () {
    const { scenePosition, lineId, isInSceneList, handleInsert, needsSpacer, color, orientation, isLast } = this.props
    let wrapperKlass = 'insert-scene-wrapper'
    if (needsSpacer) wrapperKlass += ' insert-scene-spacer'
    if (isLast) wrapperKlass += ' append-scene'

    return <Cell>
      <div
        className={isInSceneList ? 'scene-list__insert' : 'line-list__insert-scene'}
        onClick={() => handleInsert(scenePosition, lineId)}
      >
        {needsSpacer ? <CardSVGline color={color} spacer={true} orientation={orientation}/> : null}
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
    needsSpacer: PropTypes.bool,
    orientation: PropTypes.string,
    color: PropTypes.string,
    isLast: PropTypes.bool,
  }
}
