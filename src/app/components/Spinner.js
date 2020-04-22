import React from 'react'
import i18n from 'format-message'
import { FaSpinner } from 'react-icons/fa'

export const Spinner = (props) => {
  return <FaSpinner className='fa-spinner' style={props.style || {}}/>
}

export const FunSpinner = (props) => {
  let style = {
    fontSize: props.size || '2.5em',
  }
  return <div className='fun-spinner'>
    <Spinner style={style}/>
    <div>{i18n("Once You Plot, the Fun Don't Stop")}</div>
  </div>
}