import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash'

class AddThingToThing extends Component {
  findThing (id, things) {
    return _.find(things, {id: id})
  }

  render () {
    const item = this.props.item
    let thingType = 'character'
    if (item.action.type.indexOf('PLACE') !== -1) thingType = 'place'
    if (item.action.type.indexOf('TAG') !== -1) thingType = 'tag'
    let toThingType = item.action.type.indexOf('CARD') !== -1 ? 'card' : 'note'
    let toThing = this.findThing(item.action.id, item.before[`${toThingType}s`])
    let howMany = toThing[`${thingType}s`].length
    let afterThing = this.findThing(item.action.id, item.after[`${toThingType}s`])
    let afterHowMany = afterThing[`${thingType}s`].length
    let thing = this.findThing(item.action[`${thingType}Id`], item.before[`${thingType}s`])
    let attach = 'attach'
    let to = 'to'
    if (item.action.type.indexOf('ATTACH') === -1) {
      attach = 'remove'
      to = 'from'
    }
    return (
      <div>
        <span>{attach} <strong>{thing.name || thing.title}</strong> ({thingType}) {to} <strong>{toThing.name || toThing.title}</strong> ({toThingType})</span>
        <p>Before: <span className='history-component__item__before'>{`${howMany} ${thingType}s attached`}</span></p>
        <p>After: <span className='history-component__item__after'>{`${afterHowMany} ${thingType}s attached`}</span></p>
      </div>
    )
  }
}

AddThingToThing.propTypes = {
  item: PropTypes.object.isRequired
}

function mapStateToProps (state) {
  return {
  }
}

function mapDispatchToProps (dispatch) {
  return {
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddThingToThing)
