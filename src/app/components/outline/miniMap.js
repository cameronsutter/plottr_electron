import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { findDOMNode } from 'react-dom'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { keyBy } from 'lodash'
import { Nav, NavItem } from 'react-bootstrap'
import cx from 'classnames'
import MiniBeat from './MiniBeat'
import { actions, selectors } from 'pltr/v2'

const CardActions = actions.card

const {
  beatsByBookSelector,
  sortedBeatsByBookSelector,
  positionOffsetSelector,
  sortedLinesByBookSelector,
  sortedHierarchyLevels,
} = selectors

const targetPosition = 115

class MiniMap extends Component {
  constructor(props) {
    super(props)
    this.state = { mouseOver: false, firstRender: true }
    this.firstBeatKey = props.beats.length ? props.beats[0].id : 0 // this works since they are sorted
  }

  componentDidMount() {
    setTimeout(() => this.setState({ firstRender: false }), 300)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.ui.currentTimeline != this.props.ui.currentTimeline) {
      this.setState({ firstRender: true })
      setTimeout(() => this.setState({ firstRender: false }), 500)
    }
  }

  selectNav = (key) => {
    const elem = document.querySelector(`#beat-${key}`)
    elem.scrollIntoView()
    if (key != this.firstBeatKey) {
      const container = document.querySelector('.outline__container')
      const yPosition = elem.getBoundingClientRect().y
      container.scrollBy(0, yPosition - targetPosition)
    }
    this.props.handleActive(key)
  }

  renderBeats() {
    const {
      lines,
      beats,
      beatsTree,
      activeFilter,
      cardMapping,
      positionOffset,
      actions,
      ui,
      hierarchyLevels,
    } = this.props
    const linesById = keyBy(lines, 'id')
    return beats.map((beat, idx) => {
      if (this.state.firstRender && idx > 20) return null
      const beatCards = cardMapping[beat.id]
      if (activeFilter && !beatCards.length) return null

      return (
        <NavItem
          ref={(e) => (this[`beat-${beat.id}-ref`] = e)}
          key={`minimap-beat-${beat.id}`}
          eventKey={beat.id}
        >
          <MiniBeat
            bookId={ui.currentTimeline}
            beat={beat}
            beats={beatsTree}
            hierarchyLevels={hierarchyLevels}
            idx={idx + positionOffset}
            cards={beatCards}
            linesById={linesById}
            sortedLines={lines}
            positionOffset={positionOffset}
            reorderCardsWithinLine={actions.reorderCardsWithinLine}
            reorderCardsInBeat={actions.reorderCardsInBeat}
          />
        </NavItem>
      )
    })
  }

  render() {
    return (
      <Nav
        className={cx('outline__minimap', { darkmode: this.props.ui.darkMode })}
        activeKey={this.props.active}
        onSelect={this.selectNav}
        onMouseEnter={() => this.setState({ mouseOver: true })}
        onMouseLeave={() => this.setState({ mouseOver: false })}
      >
        {this.renderBeats()}
      </Nav>
    )
  }

  componentDidUpdate() {
    if (!this.state.mouseOver) {
      const beat = this.props.beats.find((beat) => beat.id === this.props.active)
      let title = ''
      if (beat) title = `beat-${beat.id}-ref`
      /* eslint-disable-next-line react/no-find-dom-node */
      var domNode = findDOMNode(this[title])
      if (domNode) {
        domNode.scrollIntoView()
      }
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextState.mouseOver != this.state.mouseOver) return false
    return true
  }
}

MiniMap.propTypes = {
  active: PropTypes.number.isRequired,
  cardMapping: PropTypes.object.isRequired,
  activeFilter: PropTypes.bool.isRequired,
  beatsTree: PropTypes.object.isRequired,
  beats: PropTypes.array.isRequired,
  hierarchyLevels: PropTypes.array.isRequired,
  lines: PropTypes.array.isRequired,
  ui: PropTypes.object.isRequired,
  positionOffset: PropTypes.number.isRequired,
  actions: PropTypes.object,
  handleActive: PropTypes.func,
}

function mapStateToProps(state) {
  return {
    beats: sortedBeatsByBookSelector(state.present),
    beatsTree: beatsByBookSelector(state.present),
    hierarchyLevels: sortedHierarchyLevels(state.present),
    lines: sortedLinesByBookSelector(state.present),
    ui: state.present.ui,
    positionOffset: positionOffsetSelector(state.present),
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(CardActions, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MiniMap)
