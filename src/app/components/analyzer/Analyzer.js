import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { groupBy, pickBy, keys } from 'lodash' // get/set will possibly be used to edit values
import { Grid, Row, Col } from 'react-bootstrap'
import ReactJson from 'react-json-view'
import Inspector from 'react-json-inspector'
import 'react-json-inspector/json-inspector.css'
import DevFileDrop from './DevFileDrop'
// import { saveFile } from '../../../common/utils/files'
import { newIds, helpers, selectors } from 'pltr/v2'

const {
  books: { isSeries },
} = helpers
const nextBeatId = helpers.beats.nextId

const { nextId, objectId } = newIds

class Analyzer extends Component {
  state = { tab: 'search', path: null, tree: null }

  handleClick = ({ key, value, path }) => {
    if (path != '') {
      this.setState({ path: path, tree: value })
    }
  }

  searchCardsByLine = (e) => {
    this.searchCards([['lineId', e.target.value]])
  }

  searchCardsByBeat = (e) => {
    this.searchCards([['beatId', e.target.value]])
  }

  // array of ['key', value]
  searchCards = (options) => {
    const { pltr } = this.props
    const cards = pltr.cards

    const visibleCards = cards.filter((c) => options.some((op) => c[op[0]] == op[1]))
    this.setState({ tree: visibleCards, path: 'cards' })
  }

  searchLines = (e) => {
    const { pltr } = this.props
    const lines = pltr.lines

    const visibleLines = lines.filter((l) => l.id == e.target.value)
    this.setState({ tree: visibleLines, path: 'lines' })
  }

  searchBeats = (e) => {
    const { pltr } = this.props
    const beats = pltr.beats

    const visibleBeats = beats.filter((c) => c.id == e.target.value)
    this.setState({ tree: visibleBeats, path: 'beats' })
  }

  searchCardsById = (e) => {
    const { pltr } = this.props
    const cards = pltr.cards

    const visibleCards = cards.filter((c) => c.id == e.target.value)
    this.setState({ tree: visibleCards, path: 'cards' })
  }

  searchAbandoned = () => {
    const { pltr } = this.props
    const cards = pltr.cards

    const lineIds = pltr.lines.map((l) => l.id)
    const beats = selectors.sortedBeatsByBookSelector(pltr)
    const beatIds = beats.map((beat) => beat.id)

    const visibleCards = cards.filter((c) => {
      return !lineIds.includes(c.lineId) && !beatIds.includes(c.beatId)
    })
    this.setState({ tree: visibleCards, path: 'cards' })
  }

  searchDuplicateBeats = () => {
    const { pltr } = this.props
    const beats = selectors.sortedBeatsByBookSelector(pltr)
    const beatIds = beats.map((beat) => beat.id)
    const duplicateIds = keys(pickBy(groupBy(beatIds), (x) => x.length > 1)).map(Number)
    let visible = []
    if (duplicateIds) {
      visible = groupBy(
        pltr.beats.filter((beat) => duplicateIds.includes(beat.id)),
        'id'
      )
    }
    this.setState({ tree: visible, path: 'beats' })
  }

  searchDuplicateLines = () => {
    const { pltr } = this.props
    const lineIds = pltr.lines.map((l) => l.id)
    const duplicateIds = keys(pickBy(groupBy(lineIds), (x) => x.length > 1)).map(Number)
    let visible = []
    if (duplicateIds) {
      visible = groupBy(
        pltr.lines.filter((l) => duplicateIds.includes(l.id)),
        'id'
      )
    }
    this.setState({ tree: visible, path: 'lines' })
  }

  searchDuplicateCards = () => {
    const { pltr } = this.props
    const cardIds = pltr.cards.map((c) => c.id)
    const duplicateIds = keys(pickBy(groupBy(cardIds), (x) => x.length > 1)).map(Number)
    let visible = []
    if (duplicateIds) {
      visible = groupBy(
        pltr.cards.filter((c) => duplicateIds.includes(c.id)),
        'id'
      )
    }
    this.setState({ tree: visible, path: 'cards' })
  }

  searchBeatsByPosition = (e) => {
    const { pltr } = this.props
    const beats = pltr.beats

    const visibleBeats = beats.filter((c) => c.position == e.target.value)
    this.setState({ tree: visibleBeats, path: 'beats' })
  }

  moveBookToIdOne = () => {
    const input = this.idToMove
    const idToMove = input.value
    if (idToMove) {
      if (isSeries(idToMove)) {
        // beats -> chapters (bookId 1)
        // seriesLines -> lines (bookId 1)
      } else {
        const { pltr } = this.props
        const re = new RegExp(`bookId":s?${idToMove},`, 'g')
        const resultJson = JSON.parse(JSON.stringify(pltr).replace(re, 'bookId":1,'))
        resultJson.books['1'] = resultJson.books[`${idToMove}`]
        delete resultJson.books[`${idToMove}`]
        resultJson.books['1'].id = 1
        // change allIds
        // think about currentTimeline
        console.log(
          resultJson.books,
          resultJson.beats.filter((beat) => beat.bookId == '1'),
          resultJson.lines.filter((line) => line.bookId == '1')
        )
        // saveFile('/Users/sparrowhawk/output.pltr', resultJson)
      }
    }
  }

  renderDetails() {
    if (!this.state.tree) return null

    return (
      <div className="analyzer__details">
        <ReactJson src={this.state.tree} name={this.state.path} iconStyle="circle" />
      </div>
    )
  }

  renderTree() {
    const { pltr } = this.props
    return (
      <div className="analyzer__tree">
        <Inspector data={pltr} onClick={this.handleClick} searchOptions={{ debounceTime: 300 }} />
      </div>
    )
  }

  renderTab() {
    const { pltr } = this.props
    if (this.state.tab == 'search') {
      return (
        <Grid fluid>
          <Row>
            <Col sm={12} md={5}>
              {this.renderTree()}
            </Col>
            <Col sm={12} md={7}>
              <h3>{this.state.path}</h3>
              {this.renderDetails()}
            </Col>
          </Row>
        </Grid>
      )
    }

    if (this.state.tab == 'cards') {
      const id = nextId(pltr.cards)
      return (
        <Grid fluid>
          <Row>
            <Col sm={12} md={5}>
              <div>
                <input onChange={this.searchCardsById} placeholder="Card Id" />
                <input onChange={this.searchCardsByLine} placeholder="Line Id" />
                <input onChange={this.searchCardsByBeat} placeholder="Beat Id" />
                <span className="analyzer__sub-option">nextId: {id}</span>
                <span className="analyzer__sub-option">
                  <a href="#" onClick={this.searchAbandoned}>
                    Abandoned
                  </a>
                </span>
                <span className="analyzer__sub-option">
                  <a href="#" onClick={this.searchDuplicateCards}>
                    Duplicates
                  </a>
                </span>
              </div>
              {this.renderDetails()}
            </Col>
          </Row>
        </Grid>
      )
    }

    if (this.state.tab == 'lines') {
      const id = nextId(pltr.lines)
      return (
        <Grid fluid>
          <Row>
            <Col sm={12} md={5}>
              <div>
                <input onChange={this.searchLines} placeholder="Line Id" />
                <span className="analyzer__sub-option">nextId: {id}</span>
                <span className="analyzer__sub-option">
                  <a href="#" onClick={this.searchDuplicateLines}>
                    Duplicates
                  </a>
                </span>
              </div>
              {this.renderDetails()}
            </Col>
          </Row>
        </Grid>
      )
    }

    if (this.state.tab == 'beats') {
      const id = nextBeatId(pltr.beats)
      return (
        <Grid fluid>
          <Row>
            <Col sm={12} md={5}>
              <div>
                <input onChange={this.searchBeatsByPosition} placeholder="Beat Position" />
                <input onChange={this.searchBeats} placeholder="Beat Id" />
                <span className="analyzer__sub-option">nextId: {id}</span>
                <span className="analyzer__sub-option">
                  <a href="#" onClick={this.searchDuplicateBeats}>
                    Duplicates
                  </a>
                </span>
              </div>
              {this.renderDetails()}
            </Col>
          </Row>
        </Grid>
      )
    }

    if (this.state.tab == 'books') {
      const id = objectId(pltr.books)
      return (
        <Grid fluid>
          <Row>
            <Col sm={12} md={5}>
              <div>
                <input ref={(r) => (this.idToMove = r)} placeholder="Id To Move" />
                <span className="analyzer__sub-option">nextId: {id}</span>
                <span className="analyzer__sub-option">
                  <a href="#" onClick={this.moveBookToIdOne}>
                    Move to Book 1
                  </a>
                </span>
              </div>
              {this.renderDetails()}
            </Col>
          </Row>
        </Grid>
      )
    }
  }

  render() {
    const { pltr } = this.props
    return (
      <div className="analyzer__container">
        <h3>
          {pltr.file.version} <small>{pltr.file.fileName}</small>
          <DevFileDrop />
        </h3>
        <div className="analyzer__tabs">
          <span
            className="analyzer__tab"
            onClick={() => this.setState({ tab: 'search', tree: null, path: null })}
          >
            Search
          </span>
          <span
            className="analyzer__tab"
            onClick={() => this.setState({ tab: 'cards', tree: null, path: null })}
          >
            Cards
          </span>
          <span
            className="analyzer__tab"
            onClick={() => this.setState({ tab: 'lines', tree: null, path: null })}
          >
            Lines
          </span>
          <span
            className="analyzer__tab"
            onClick={() => this.setState({ tab: 'beats', tree: null, path: null })}
          >
            Beats
          </span>
          <span
            className="analyzer__tab"
            onClick={() => this.setState({ tab: 'books', tree: null, path: null })}
          >
            Books
          </span>
        </div>
        {this.renderTab()}
        <div></div>
      </div>
    )
  }

  static propTypes = {
    pltr: PropTypes.object,
  }
}

function mapStateToProps(state) {
  return {
    pltr: state.present,
  }
}

function mapDispatchToProps(dispatch) {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(Analyzer)
