import React from 'react'
import t from 'format-message'
import { IoMdContact, IoMdHome, IoMdAddCircle, IoMdSettings, IoIosHelpBuoy } from 'react-icons/io'
import { HiOutlineDuplicate } from 'react-icons/hi'
import { GiBackwardTime } from 'react-icons/gi'

export const tabs = [
  {name: t('Account'), view: 'account', icon: <IoMdContact/>},
  {name: t('Home'), view: 'home', icon: <IoMdHome/>},
  {name: t('New'), view: 'new', icon: <IoMdAddCircle/>},
  {name: t('Templates'), view: 'templates', icon: <HiOutlineDuplicate/>},
  {name: t('Backups'), view: 'backups', icon: <GiBackwardTime/>},
  {name: t('Settings'), view: 'settings', icon: <IoMdSettings/>},
  {name: t('Help'), view: 'help', icon: <IoIosHelpBuoy/>},
]