import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Grid, Row, Col, Nav, NavItem } from 'react-bootstrap'
import ReactJson from 'react-json-view'
import Inspector from 'react-json-inspector'
import 'style-loader!css-loader!sass-loader!../../../../node_modules/react-json-inspector/json-inspector.css'

class Analyzer extends Component {
  state = {view: 'search'}

  handleClick = ({key, value, path}) => {
    if (!path.includes('.') && path != '') {
    }

    // maybe also if it's not a top level key, present that path in the right column
  }

  renderTree () {
    const { pltr } = this.props
    if (this.state.view == 'search') {
      return <div style={{padding: '10px'}}><Inspector data={ pltr } onClick={this.handleClick}/></div>
    } else {
      return <div style={{padding: '10px'}}><ReactJson src={ pltr } /></div>
    }
  }

  render () {
    const { pltr } = this.props
    return <div>
      <h1>{pltr.file.version}{' '}<small>{pltr.file.fileName}</small></h1>

      <Grid fluid>
        <Row>
          <Col sm={12} md={6}>
            <Nav bsStyle='tabs' activeKey={this.state.view} onSelect={key => this.setState({view: key})}>
              <NavItem eventKey='search'>
                Search
              </NavItem>
              <NavItem eventKey='edit'>
                Edit
              </NavItem>
            </Nav>
            { this.renderTree() }
          </Col>
          <Col sm={12} md={6}>

          </Col>
        </Row>
      </Grid>
      <div></div>
    </div>
  }
}

function mapStateToProps (state) {
  return {
    pltr: state.present,
  }
}

function mapDispatchToProps (dispatch) {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(Analyzer)
