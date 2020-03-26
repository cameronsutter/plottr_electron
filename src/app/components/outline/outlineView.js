import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import _ from 'lodash'
import { Glyphicon, Nav, Navbar, NavItem, Button, OverlayTrigger, Popover, Alert } from 'react-bootstrap'
import ChapterView from 'components/outline/ChapterView'
import MiniMap from 'components/outline/miniMap'
import i18n from 'format-message'
import cx from 'classnames'
import { chaptersByBookSelector } from '../../selectors/chapters'
import { linesByBookSelector } from '../../selectors/lines'

class OutlineView extends Component {
  constructor (props) {
    super(props)
    this.state = {active: 0, currentLine: null}
  }

  isSeries = () => {
    return this.props.ui.currentTimeline == 'series'
  }

  cardMapping () {
    const lines = _.sortBy(this.props.lines, 'position')
    return this.props.chapters.reduce((acc, ch) => {
      acc[ch.id] = this.sortedChapterCards(lines, ch.id)
      return acc
    }, {})
  }

  lineIsHidden (line) {
    if (!this.state.currentLine) return false
    return line.id != this.state.currentLine
  }

  sortedChapterCards (sortedLines, chapterId) {
    return sortedLines.reduce((acc, l) => {
      if (this.lineIsHidden(l)) return acc

      const cards = this.findCards(chapterId, l.id)
      return acc.concat(cards)
    }, [])
  }

  findCards = (chapterId, lineId) => {
    return this.props.cards.filter(c => {
      if (this.isSeries()) {
        return c.beatId == chapterId && c.seriesLineId == lineId
      } else {
        return c.chapterId === chapterId && c.lineId == lineId
      }
    })
  }

  setActive = (id) => {
    this.setState({active: id})
  }

  filterItem = (id) => {
    if (this.state.currentLine === id) {
      this.setState({currentLine: null})
    } else {
      this.setState({currentLine: id})
    }
  }

  removeFilter = () => {
    this.setState({currentLine: null})
  }

  renderFilterList () {
    var items = this.props.lines.map((i) => {
      return this.renderFilterItem(i)
    })
    return (
      <ul className='filter-list__list'>
        {items}
      </ul>
    )
  }

  renderFilterItem (item) {
    var placeholder = <span className='filter-list__placeholder'></span>
    if (this.state.currentLine === item.id) {
      placeholder = <Glyphicon glyph='eye-open' />
    }
    return (<li key={item.id} onMouseDown={() => this.filterItem(item.id)}>
        {placeholder}{" "}{item.title}
      </li>
    )
  }

  renderSubNav () {
    let popover = <Popover id='filter'>
      <div className='filter-list'>
        {this.renderFilterList()}
      </div>
    </Popover>
    let filterDeclaration = <Alert onClick={this.removeFilter} bsStyle="warning"><Glyphicon glyph='remove-sign' />{"  "}{i18n('Outline is filtered')}</Alert>
    if (this.state.currentLine == null) {
      filterDeclaration = <span></span>
    }
    return (
      <Navbar className={cx('subnav__container', {darkmode: this.props.ui.darkMode})}>
        <Nav bsStyle='pills' >
          <NavItem>
            <OverlayTrigger containerPadding={20} trigger='click' rootClose placement='bottom' overlay={popover}>
              <Button bsSize='small'><Glyphicon glyph='filter' />{i18n('Filter by story line')}</Button>
            </OverlayTrigger>
            {filterDeclaration}
          </NavItem>
        </Nav>
      </Navbar>
    )
  }

  renderChapters (cardMapping) {
    const chapters = _.sortBy(this.props.chapters, 'position')
    return chapters.map(ch =>
      <ChapterView key={ch.id} chapter={ch} cards={cardMapping[ch.id]} waypoint={this.setActive} />
    )
  }

  render () {
    var cardMapping = this.cardMapping()
    return (
      <div className='container-with-sub-nav'>
        {this.renderSubNav()}
        <div className='outline__container'>
          <div className='outline__minimap__placeholder'>Fish are friends, not food</div>
          <MiniMap active={this.state.active} cardMapping={cardMapping} />
          <div className='outline__scenes-container'>
            {this.renderChapters(cardMapping)}
          </div>
        </div>
      </div>
    )
  }
}

OutlineView.propTypes = {
  chapters: PropTypes.array.isRequired,
  lines: PropTypes.array.isRequired,
  cards: PropTypes.array.isRequired,
  ui: PropTypes.object.isRequired,
}

function mapStateToProps (state) {
  return {
    chapters: chaptersByBookSelector(state),
    lines: linesByBookSelector(state),
    cards: state.cards,
    ui: state.ui,
  }
}

function mapDispatchToProps (dispatch) {
  return {}
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OutlineView)
