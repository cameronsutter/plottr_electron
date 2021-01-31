import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import i18n from 'format-message'

export default class CharacterTemplateDetails extends Component {
  render() {
    const attrs = this.props.template.attributes.map((attr) => {
      return (
        <tr key={attr.name}>
          <td>{attr.name}</td>
          <td>{attr.type}</td>
        </tr>
      )
    })

    return (
      <div className="panel-body">
        <h5 className="text-center">{i18n('Attributes')}</h5>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>{i18n('Name')}</th>
              <th>{i18n('Type')}</th>
            </tr>
          </thead>
          <tbody>{attrs}</tbody>
        </table>
      </div>
    )
  }

  static propTypes = {
    template: PropTypes.object.isRequired,
  }
}
