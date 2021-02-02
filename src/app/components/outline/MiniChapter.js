import React, { useState, useEffect } from 'react'
import PropTypes from 'react-proptypes'
import cx from 'classnames'
import { chapterTitle } from '../../helpers/chapters'
import { sortCardsInChapter } from '../../helpers/cards'

function MiniChapter(props) {
  const { chapter, idx, cards, linesById, sortedLines, isSeries, positionOffset } = props
  const [sortedCards, setSortedCards] = useState([])
  // https://www.smashingmagazine.com/2020/02/html-drag-drop-api-react/
  const [inDropZone, setInZone] = useState(false)
  const [dropDepth, setDropDepth] = useState(0)

  useEffect(() => {
    setSortedCards(sortCardsInChapter(chapter.autoOutlineSort, cards, sortedLines, isSeries))
  }, [chapter, cards])

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
    let newOrder = []

    const currentIds = sortedCards.map((c) => c.id)
    // dropped in from a different chapter
    if (!currentIds.includes(id)) {
      let cardIdsInLine = sortedCards
        .filter((c) => (isSeries ? c.seriesLineId == lineId : c.lineId == lineId))
        .map((c) => c.id)
      cardIdsInLine.push(id)
      if (chapter.autoOutlineSort) {
        props.reorderCardsWithinLine(chapter.id, lineId, isSeries, cardIdsInLine)
      } else {
        currentIds.push(id)
        props.reorderCardsInChapter(chapter.id, lineId, isSeries, currentIds, cardIdsInLine, id)
      }
    }
  }

  const findCard = (card) => {
    let id = card.lineId
    if (isSeries) {
      id = card.seriesLineId
    }
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
      className={cx('outline__minimap__chapter-title', { dropping: inDropZone })}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <span>
        <span className="accented-text">{`${idx + 1}.  `}</span>
        <span>{chapterTitle(chapter, positionOffset, isSeries)}</span>
      </span>
      <div className="outline__minimap__dots">{renderCardDots()}</div>
    </div>
  )
}

MiniChapter.propTypes = {
  chapter: PropTypes.object.isRequired,
  idx: PropTypes.number.isRequired,
  cards: PropTypes.array.isRequired,
  sortedLines: PropTypes.array.isRequired,
  linesById: PropTypes.object.isRequired,
  isSeries: PropTypes.bool.isRequired,
  positionOffset: PropTypes.number.isRequired,
  reorderCardsWithinLine: PropTypes.func.isRequired,
  reorderCardsInChapter: PropTypes.func.isRequired,
}

export default MiniChapter
