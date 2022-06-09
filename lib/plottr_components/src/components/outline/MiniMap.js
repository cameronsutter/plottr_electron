import React, { useEffect, useState, useRef } from 'react'
import PropTypes from 'react-proptypes'
import cx from 'classnames'

import { selectors } from 'pltr/v2'
import { emptyCard } from 'pltr/v2/helpers/cards'

import NavItem from '../NavItem'
import Nav from '../Nav'
import MiniBeatConnector from './MiniBeat'
import { checkDependencies } from '../checkDependencies'

const targetPosition = 115

const MiniMapConnector = (connector) => {
  const MiniBeat = MiniBeatConnector(connector)

  const MiniMap = ({
    beats,
    currentTimeline,
    darkMode,
    handleActive,
    lines,
    activeFilter,
    allCards,
    cardMapping,
    positionOffset,
    actions,
    beatActions,
    active,
    linesById,
  }) => {
    const [mouseOver, setMouseOver] = useState(false)
    const [firstRender, setFirstRender] = useState(true)

    const itemRefs = useRef(new Map())

    const beatTitleKey = (beatId) => `beat-${beatId}-ref`

    const setRef = (beatId, ref) => {
      itemRefs.current.set(beatTitleKey(beatId), ref)
    }

    const getRef = (beatId) => {
      return itemRefs.current.get(beatTitleKey(beatId))
    }

    const firstBeatKey = beats.length ? beats[0].id : 0 // this works since they are sorted

    useEffect(() => {
      setTimeout(() => setFirstRender(false), 300)
    }, [])

    useEffect(() => {
      setFirstRender(true)
      const timeout = setTimeout(() => {
        setFirstRender(false)
      }, 500)
      return () => {
        clearTimeout(timeout)
      }
    }, [currentTimeline])

    // This replaces a `componentDidUpdate` so I've added almost all
    // the depnedencies there are to it.
    useEffect(() => {
      if (!mouseOver) {
        const beat = beats.find((beat) => beat.id === active)
        var domNode = beat && getRef(beat.id)
        if (domNode && domNode.scrollIntoView) {
          domNode.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        }
      }
    }, [
      beats,
      lines,
      activeFilter,
      allCards,
      cardMapping,
      positionOffset,
      active,
      mouseOver,
      firstRender,
    ])

    const selectNav = (key) => {
      const elem = document.querySelector(`#beat-${key}`)
      if (elem) {
        elem.scrollIntoView()
        if (key != firstBeatKey) {
          const container = document.querySelector('.outline__container')
          const yPosition = elem.getBoundingClientRect().y
          if (container) container.scrollBy(0, yPosition - targetPosition)
        }
      }
      handleActive(key)
    }

    const renderBeats = () => {
      if (!beats.length) return null
      let beatsWithCards = allCards.map((card) => card.beatId)
      return beats.map((beat, idx) => {
        if (firstRender && idx > 20) return null
        let hasCards = beatsWithCards.includes(beat.id)
        const beatCards = hasCards ? cardMapping[beat.id] : [emptyCard(idx, beat, lines[0])]
        if (activeFilter && !beatCards.length) return null

        const handleDragStart = (e) => {
          e.dataTransfer.effectAllowed = 'move'
          e.dataTransfer.setData('text/json', JSON.stringify({ beat }))
        }

        return (
          <NavItem
            ref={(e) => setRef(beat.id, e)}
            key={`minimap-beat-${beat.id}`}
            eventKey={beat.id}
            onDragStart={handleDragStart}
          >
            <MiniBeat
              bookId={currentTimeline}
              beat={beat}
              idx={idx + positionOffset}
              cards={beatCards}
              linesById={linesById}
              sortedLines={lines}
              positionOffset={positionOffset}
              reorderCardsWithinLine={actions.reorderCardsWithinLine}
              reorderCardsInBeat={actions.reorderCardsInBeat}
              reorderBeats={beatActions.reorderBeats}
              handleActive={handleActive}
            />
          </NavItem>
        )
      })
    }

    return (
      <Nav
        className={cx('outline__minimap', { darkmode: darkMode })}
        activeKey={active}
        onSelect={selectNav}
        onMouseEnter={() => setMouseOver(true)}
        onMouseLeave={() => setMouseOver(false)}
      >
        {renderBeats()}
      </Nav>
    )
  }

  MiniMap.propTypes = {
    active: PropTypes.number.isRequired,
    cardMapping: PropTypes.object.isRequired,
    allCards: PropTypes.array,
    activeFilter: PropTypes.bool.isRequired,
    beats: PropTypes.array.isRequired,
    lines: PropTypes.array.isRequired,
    currentTimeline: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    darkMode: PropTypes.bool,
    positionOffset: PropTypes.number.isRequired,
    actions: PropTypes.object.isRequired,
    beatActions: PropTypes.object.isRequired,
    handleActive: PropTypes.func,
    linesById: PropTypes.object.isRequired,
  }

  const {
    redux,
    pltr: { actions },
  } = connector
  const CardActions = actions.card
  const BeatActions = actions.beat
  checkDependencies({
    redux,
    actions,
    CardActions,
    BeatActions,
  })

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(
      (state) => {
        return {
          beats: selectors.visibleSortedBeatsByBookIgnoringCollapsedSelector(state.present),
          lines: selectors.sortedLinesByBookSelector(state.present),
          allCards: selectors.allCardsSelector(state.present),
          currentTimeline: selectors.currentTimelineSelector(state.present),
          darkMode: selectors.isDarkModeSelector(state.present),
          positionOffset: selectors.positionOffsetSelector(state.present),
          linesById: selectors.linesById(state.present),
        }
      },
      (dispatch) => {
        return {
          actions: bindActionCreators(CardActions, dispatch),
          beatActions: bindActionCreators(BeatActions, dispatch),
        }
      }
    )(React.memo(MiniMap))
  }

  throw new Error('Could not connect MiniMap')
}

export default MiniMapConnector
