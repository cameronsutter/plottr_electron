import React from 'react'

export const FormGroupContext = React.createContext({
  $bs_formGroup: {
    controlId: null,
    validationState: null,
  },
})

export const ModalContext = React.createContext({
  $bs_modal: {
    onHide: () => {},
  },
})

export const NavbarContext = React.createContext({
  $bs_navbar: {
    bsClass: null,
    expanded: null,
    onToggle: () => {},
    onSelect: () => {},
  },
})

export const TabContainerContext = React.createContext({
  $bs_tabContainer: {
    activeKey: null,
    onSelect: () => {},
    getTabId: () => {},
    getPaneId: () => {},
  },
})

export const TabContentContext = React.createContext({
  $bs_tabContent: {
    bsClass: null,
    animation: null,
    activeKey: null,
    mountOnEnter: null,
    unmountOnExit: null,
    onPaneEnter: () => {},
    onPaneExited: () => {},
    exiting: false,
  },
})

