import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Glyphicon } from 'react-bootstrap'
import _ from 'lodash'
import * as LineActions from 'actions/lines'
import LineView from 'components/timeline/lineView'

class LineListView extends Component {

  handleCreateNewLine () {
    this.props.actions.addLine()
  }

  handleReorder (originalLinePosition, droppedLinePosition) {
    var linesArray = []
    this.props.lines.forEach((l) => {
      var newLine = _.clone(l)
      if (l.position >= originalLinePosition && l.position !== droppedLinePosition) {
        newLine.position += 1
      } else if (l.position === droppedLinePosition) {
        newLine.position = originalLinePosition
      }
      linesArray.push(newLine)
    })
    // potentially we'd want to reset all the positions so there aren't any gaps
    this.props.actions.reorderLines(linesArray)
  }

  render () {
    var lineViews = this.renderLines()
    return (<div className='line-list'>
      {lineViews}
      <div className='line-list__new' onClick={this.handleCreateNewLine.bind(this)} >
        <Glyphicon glyph='plus' />
      </div>
    </div>)
  }

  renderLines () {
    const lines = _.sortBy(this.props.lines, 'position')
    return lines.map((line) => {
      return (
        <LineView key={'lineId-' + line.id} line={line}
          sceneMap={this.props.sceneMap}
          handleReorder={this.handleReorder.bind(this)}
          filteredItems={this.props.filteredItems}
          />
      )
    })
  }
}

LineListView.propTypes = {
  lines: PropTypes.array.isRequired,
  sceneMap: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  filteredItems: PropTypes.object.isRequired
}

function mapStateToProps (state) {
  return {
    lines: state.lines
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(LineActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LineListView)
