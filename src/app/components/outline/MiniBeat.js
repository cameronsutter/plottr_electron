import React, { useState, useEffect } from 'react'
import PropTypes from 'react-proptypes'
import cx from 'classnames'
import { helpers } from 'pltr/v2'

const {
  card: { sortCardsInBeat },
  beats: { beatTitle },
} = helpers

function MiniBeat(props) {
  const {
    bookId,
    beat,
    beats,
    hierarchyLevels,
    idx,
    cards,
    linesById,
    sortedLines,
    positionOffset,
    hierarchyEnabled,
    isSeries,
  } = props
  const [sortedCards, setSortedCards] = useState([])
  // https://www.smashingmagazine.com/2020/02/html-drag-drop-api-react/
  const [inDropZone, setInZone] = useState(false)
  const [dropDepth, setDropDepth] = useState(0)

  useEffect(() => {
    setSortedCards(sortCardsInBeat(beat.autoOutlineSort, cards, sortedLines))
  }, [beat, cards])

  const handleDragEnter = (e) => {
    setDropDepth(dropDepth + 1)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setInZone(true)
  }

  const handleDragLeave = (e) => {
    let newDepth = dropDepth
    --newDepth
    setDropDepth(newDepth)
    if (newDepth > 0) return
    setInZone(false)
  }

  const handleDrop = (e) => {
    e.stopPropagation()
    e.preventDefault()
    setDropDepth(0)
    setInZone(false)

    const json = e.dataTransfer.getData('text/json')
    const droppedData = JSON.parse(json)
    if (!droppedData.cardId) return

    acceptCard(droppedData.cardId, droppedData.lineId)
  }

  const acceptCard = (id, lineId) => {
    const currentIds = sortedCards.map((c) => c.id)
    // dropped in from a different beat
    if (!currentIds.includes(id)) {
      let cardIdsInLine = sortedCards.filter((c) => c.lineId == lineId).map((c) => c.id)
      cardIdsInLine.push(id)
      if (beat.autoOutlineSort) {
        props.reorderCardsWithinLine(beat.id, lineId, cardIdsInLine)
      } else {
        currentIds.push(id)
        props.reorderCardsInBeat(beat.id, lineId, currentIds, cardIdsInLine, id, bookId)
      }
    }
  }

  const findCard = (card) => {
    const id = card.lineId
    return linesById[id]
  }

  const renderCardDots = () => {
    return sortedCards.map((c) => {
      let line = findCard(c)
      if (!line) return null

      let style = { backgroundColor: line.color }
      return (
        <div
          key={`dot-${line.id}-${c.id}`}
          title={line.title}
          style={style}
          className="outline__minimap__card-dot"
        ></div>
      )
    })
  }

  return (
    <div
      className={cx('outline__minimap__beat-title', { dropping: inDropZone })}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <span>
        <span className="accented-text">{`${idx + 1}.  `}</span>
        <span>
          {beatTitle(beats, beat, hierarchyLevels, positionOffset, hierarchyEnabled, isSeries)}
        </span>
      </span>
      <div className="outline__minimap__dots">{renderCardDots()}</div>
    </div>
  )
}

MiniBeat.propTypes = {
  bookId: PropTypes.string.isRequired,
  beat: PropTypes.object.isRequired,
  beats: PropTypes.object.isRequired,
  hierarchyLevels: PropTypes.array.isRequired,
  idx: PropTypes.number.isRequired,
  cards: PropTypes.array.isRequired,
  sortedLines: PropTypes.array.isRequired,
  linesById: PropTypes.object.isRequired,
  positionOffset: PropTypes.number.isRequired,
  reorderCardsWithinLine: PropTypes.func.isRequired,
  reorderCardsInBeat: PropTypes.func.isRequired,
  hierarchyEnabled: PropTypes.bool,
  isSeries: PropTypes.bool,
}

export default MiniBeat
