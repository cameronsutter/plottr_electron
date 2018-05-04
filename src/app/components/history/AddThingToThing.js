import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash'
import i18n from 'format-message'

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

    // type = character | place | tag
    // toType = card | note
    // attach [type] to [toType]
    // remove [type] from [toType]

    let description = ''
    if (attach == 'attach') {
      // attach
      if (toThingType == 'card') {
        // card
        switch (thingType) {
          case 'character':
            words = i18n('attach character {characterName} to card {cardName}', {characterName: thing.name, cardName: toThing.title})
            break
          case 'place':
            words = i18n('attach place {placeName} to card {cardName}', {placeName: thing.name, cardName: toThing.title})
            break
          case 'tag':
            words = i18n('attach tag {tagName} to card {cardName}', {tagName: thing.title, cardName: toThing.title})
            break
        }
      } else {
        // note
        switch (thingType) {
          case 'character':
            words = i18n('attach character {characterName} to note {noteName}', {characterName: thing.name, noteName: toThing.title})
            break
          case 'place':
            words = i18n('attach place {placeName} to note {noteName}', {placeName: thing.name, noteName: toThing.title})
            break
          case 'tag':
            words = i18n('attach tag {tagName} to note {noteName}', {tagName: thing.title, noteName: toThing.title})
            break
        }
      }
    } else {
      // remove
      if (toThingType == 'card') {
        // card
        switch (thingType) {
          case 'character':
            words = i18n('remove character {characterName} from card {cardName}', {characterName: thing.name, cardName: toThing.title})
            break
          case 'place':
            words = i18n('remove place {placeName} from card {cardName}', {placeName: thing.name, cardName: toThing.title})
            break
          case 'tag':
            words = i18n('remove tag {tagName} from card {cardName}', {tagName: thing.title, cardName: toThing.title})
            break
        }
      } else {
        // note
        switch (thingType) {
          case 'character':
            words = i18n('remove character {characterName} from note {noteName}', {characterName: thing.name, noteName: toThing.title})
            break
          case 'place':
            words = i18n('remove place {placeName} from note {noteName}', {placeName: thing.name, noteName: toThing.title})
            break
          case 'tag':
            words = i18n('remove tag {tagName} from note {noteName}', {tagName: thing.title, noteName: toThing.title})
            break
        }
      }
    }

    let beforeCountStr = ''
    let afterCountStr = ''
    switch (thingType) {
      case 'character':
        beforeCountStr = i18n(`{
          count, plural,
          one {1 character attached}
          other {# characters attached}
        }`, { count: howMany })
        afterCountStr = i18n(`{
          count, plural,
          one {1 character attached}
          other {# characters attached}
        }`, { count: afterHowMany })
        break
      case 'place':
        beforeCountStr = i18n(`{
          count, plural,
          one {1 place attached}
          other {# places attached}
        }`, { count: howMany })
        afterCountStr = i18n(`{
          count, plural,
          one {1 place attached}
          other {# places attached}
        }`, { count: afterHowMany })
        break
      case 'tag':
        beforeCountStr = i18n(`{
          count, plural,
          one {1 tag attached}
          other {# tags attached}
        }`, { count: howMany })
        afterCountStr = i18n(`{
          count, plural,
          one {1 tag attached}
          other {# tags attached}
        }`, { count: afterHowMany })
        break
    }

    return (
      <div>
        <span>{description}</span>
        <p>{i18n('Before')}: <span className='history-component__item__before'>{beforeCountStr}</span></p>
        <p>{i18n('After')}: <span className='history-component__item__after'>{afterCountStr}</span></p>
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
