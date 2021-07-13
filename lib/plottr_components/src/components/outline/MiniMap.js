import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { findDOMNode } from 'react-dom'
import { keyBy } from 'lodash'
import { Nav, NavItem } from 'react-bootstrap'
import cx from 'classnames'
import MiniBeatConnector from './MiniBeat'
import { selectors } from 'pltr/v2'
import { emptyCard } from 'pltr/v2/helpers/cards'

const targetPosition = 115

const MiniMapConnector = (connector) => {
  const MiniBeat = MiniBeatConnector(connector)

  class MiniMap extends Component {
    constructor(props) {
      super(props)
      this.state = { mouseOver: false, firstRender: true }
      this.firstBeatKey = props.beats.length ? props.beats[0].id : 0 // this works since they are sorted
    }

    componentDidMount() {
      setTimeout(() => this.setState({ firstRender: false }), 300)
    }

    // Fixme: according to the React docs this will only work until 17
    // and in their experience is the cause of many errors.
    // (https://reactjs.org/docs/react-component.html#unsafe_componentwillreceiveprops)
    UNSAFE_componentWillReceiveProps(nextProps) {
      if (nextProps.ui.currentTimeline != this.props.ui.currentTimeline) {
        this.setState({ firstRender: true })
        setTimeout(() => this.setState({ firstRender: false }), 500)
      }
    }

    selectNav = (key) => {
      const elem = document.querySelector(`#beat-${key}`)
      if (elem) {
        elem.scrollIntoView()
        if (key != this.firstBeatKey) {
          const container = document.querySelector('.outline__container')
          const yPosition = elem.getBoundingClientRect().y
          if (container) container.scrollBy(0, yPosition - targetPosition)
        }
      }
      this.props.handleActive(key)
    }

    renderBeats() {
      const {
        lines,
        beats,
        activeFilter,
        allCards,
        cardMapping,
        positionOffset,
        actions,
        beatActions,
        ui,
      } = this.props
      if (!beats.length) return null
      const linesById = keyBy(lines, 'id')
      let beatsWithCards = allCards.map((card) => card.beatId)
      return beats.map((beat, idx) => {
        if (this.state.firstRender && idx > 20) return null
        let hasCards = beatsWithCards.includes(beat.id)
        const beatCards = hasCards ? cardMapping[beat.id] : [emptyCard(idx, beat, lines[0])]
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
              idx={idx + positionOffset}
              cards={beatCards}
              linesById={linesById}
              sortedLines={lines}
              positionOffset={positionOffset}
              reorderCardsWithinLine={actions.reorderCardsWithinLine}
              reorderCardsInBeat={actions.reorderCardsInBeat}
              reorderBeats={beatActions.reorderBeats}
              handleActive={this.props.handleActive}
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
          domNode.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
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
    allCards: PropTypes.array,
    activeFilter: PropTypes.bool.isRequired,
    beats: PropTypes.array.isRequired,
    lines: PropTypes.array.isRequired,
    ui: PropTypes.object.isRequired,
    positionOffset: PropTypes.number.isRequired,
    actions: PropTypes.object.isRequired,
    beatActions: PropTypes.object.isRequired,
    handleActive: PropTypes.func,
  }

  const {
    redux,
    pltr: { actions },
  } = connector
  const CardActions = actions.card
  const BeatActions = actions.beat
  const {
    sortedBeatsByBookSelector,
    positionOffsetSelector,
    sortedLinesByBookSelector,
    allCardsSelector,
  } = selectors

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(
      (state) => {
        return {
          beats: sortedBeatsByBookSelector(state.present),
          lines: sortedLinesByBookSelector(state.present),
          allCards: allCardsSelector(state.present),
          ui: state.present.ui,
          positionOffset: positionOffsetSelector(state.present),
        }
      },
      (dispatch) => {
        return {
          actions: bindActionCreators(CardActions, dispatch),
          beatActions: bindActionCreators(BeatActions, dispatch),
        }
      }
    )(MiniMap)
  }

  throw new Error('Could not connect MiniMap')
}

export default MiniMapConnector
