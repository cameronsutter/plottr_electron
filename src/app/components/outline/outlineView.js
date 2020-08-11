import path from 'path'
import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { ipcRenderer, remote } from 'electron'
import { Glyphicon, Nav, Navbar, NavItem, Button, OverlayTrigger, Popover, Alert } from 'react-bootstrap'
import ChapterView from 'components/outline/ChapterView'
import MiniMap from 'components/outline/miniMap'
import i18n from 'format-message'
import cx from 'classnames'
import { sortedChaptersByBookSelector } from '../../selectors/chapters'
import { sortedLinesByBookSelector } from '../../selectors/lines'
import { isSeriesSelector } from '../../selectors/ui'
import { MPQ } from 'middlewares/helpers'
import { cardMapSelector } from '../../selectors/cards'
import ErrorBoundary from '../../containers/ErrorBoundary'
import { cardMapping } from '../../helpers/cards'

const win = remote.getCurrentWindow()
const dialog = remote.dialog

class OutlineView extends Component {
  constructor (props) {
    super(props)
    this.state = {active: 0, currentLine: null, firstRender: true}
  }

  componentDidMount () {
    setTimeout(() => this.setState({firstRender: false}), 500)
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.ui.currentTimeline != this.props.ui.currentTimeline) {
      this.setState({firstRender: true})
      setTimeout(() => this.setState({firstRender: false}), 500)
    }
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

  // ///////////////
  //  exporting   //
  // //////////////

  doExport = () => {
    let label = i18n('Where would you like to save the export?')
    const defaultPath = path.basename(this.props.file.fileName).replace('.pltr', '')
    const filters = [{name: 'Word', extensions: ['docx']}]
    const fileName = dialog.showSaveDialogSync({title: label, filters, defaultPath})
    if (fileName) {
      const options = { fileName, bookId: this.props.ui.currentTimeline }
      MPQ.push('Export')
      ipcRenderer.send('export', options, win.id)
    }
  }

  // ///////////////
  //  rendering   //
  // //////////////

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
              <Button bsSize='small'><Glyphicon glyph='filter' />{i18n('Filter by Plotline')}</Button>
            </OverlayTrigger>
            {filterDeclaration}
          </NavItem>
        </Nav>
        <Nav pullRight>
          <NavItem>
            <span className='subnav__container__label'>{i18n('Export')}: </span>
            <Button bsSize='small' onClick={this.doExport}><Glyphicon glyph='export' /></Button>
          </NavItem>
        </Nav>
      </Navbar>
    )
  }

  renderChapters (cardMapping) {
    return this.props.chapters.map((ch, idx) => {
      if (this.state.firstRender && idx > 2) return null
      return <ErrorBoundary key={ch.id}>
        <ChapterView chapter={ch} cards={cardMapping[ch.id]} waypoint={this.setActive} activeFilter={!!this.state.currentLine} />
      </ErrorBoundary>
    })
  }

  renderBody () {
    const { chapters, lines, card2Dmap } = this.props
    const cardMap = cardMapping(chapters, lines, card2Dmap, this.state.currentLine)
    return <div className='outline__container'>
      <div className='outline__minimap__placeholder'>Fish are friends, not food</div>
      <ErrorBoundary>
        <MiniMap active={this.state.active} cardMapping={cardMap} activeFilter={!!this.state.currentLine} />
      </ErrorBoundary>
      <div className='outline__scenes-container'>
        {this.renderChapters(cardMap)}
      </div>
    </div>
  }

  render () {
    return <div className='container-with-sub-nav'>
      { this.renderSubNav() }
      { this.renderBody() }
    </div>
  }
}

OutlineView.propTypes = {
  chapters: PropTypes.array.isRequired,
  lines: PropTypes.array.isRequired,
  card2Dmap: PropTypes.object.isRequired,
  file: PropTypes.object.isRequired,
  ui: PropTypes.object.isRequired,
  isSeries: PropTypes.bool,
}

function mapStateToProps (state) {
  return {
    chapters: sortedChaptersByBookSelector(state.present),
    lines: sortedLinesByBookSelector(state.present),
    card2Dmap: cardMapSelector(state.present),
    file: state.present.file,
    ui: state.present.ui,
    isSeries: isSeriesSelector(state.present),
  }
}

function mapDispatchToProps (dispatch) {
  return {}
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OutlineView)
