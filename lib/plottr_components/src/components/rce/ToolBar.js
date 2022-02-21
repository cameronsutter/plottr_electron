import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'react-proptypes'
import { ButtonGroup, Overlay, ButtonToolbar } from 'react-bootstrap'
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaQuoteLeft,
  FaListOl,
  FaListUl,
  FaStrikethrough,
} from 'react-icons/fa'
import cx from 'classnames'

import { t } from 'plottr_locales'
import { addColorMark } from './ColorButton'
import UnconnectedImagesButton from './ImagesButton'
import { MarkButton } from './MarkButton'
import BlockButton from './BlockButton'
import { LinkButton } from './LinkButton'
import { ColorButton } from './ColorButton'
import { FontsButton } from './FontsButton'
import UnconnectedMiniColorPicker from '../MiniColorPicker'
import { FontSizeChooser } from './FontSizeChooser'
import { addRecent, getFonts, getRecent } from './fonts'

import { checkDependencies } from '../checkDependencies'

const UnconnectedToolBar = (connector) => {
  const ImagesButton = UnconnectedImagesButton(connector)
  const MiniColorPicker = UnconnectedMiniColorPicker(connector)

  const {
    platform: { os, log },
  } = connector
  checkDependencies({ os, log })

  const ToolBar = ({ editor, darkMode, selection }) => {
    const [showColorPicker, toggleColorPicker] = useState(false)
    const [fonts, setFonts] = useState(null)
    const [recentFonts, setRecentFonts] = useState(null)

    const changeColor = (color) => {
      addColorMark(editor, color)
      toggleColorPicker(false)
    }

    useEffect(() => {
      if (!fonts) setFonts(getFonts(os()))
      if (!recentFonts) setRecentFonts(getRecent())
    }, [])

    const toolbarRef = useRef(null)

    return (
      <div className={cx('slate-editor__toolbar-wrapper', { darkmode: darkMode })} ref={toolbarRef}>
        <ButtonToolbar>
          <ButtonGroup>
            <FontsButton
              fonts={fonts || []}
              recentFonts={recentFonts || []}
              addRecent={addRecent}
              editor={editor}
              logger={log}
            />
            <FontSizeChooser editor={editor} />
            <MarkButton
              selection={selection}
              mark="bold"
              icon={<FaBold />}
              editor={editor}
              logger={log}
            />
            <MarkButton
              selection={selection}
              mark="italic"
              icon={<FaItalic />}
              editor={editor}
              logger={log}
            />
            <MarkButton
              selection={selection}
              mark="underline"
              icon={<FaUnderline />}
              editor={editor}
              logger={log}
            />
            <MarkButton
              selection={selection}
              mark="strike"
              icon={<FaStrikethrough />}
              editor={editor}
              logger={log}
            />
            <ColorButton
              toggle={() => toggleColorPicker(!showColorPicker)}
              editor={editor}
              logger={log}
            />
            <BlockButton format="heading-one" icon={t('Title')} editor={editor} logger={log} />
            <BlockButton format="heading-two" icon={t('Subtitle')} editor={editor} logger={log} />
            <BlockButton format="block-quote" icon={<FaQuoteLeft />} editor={editor} logger={log} />
            <BlockButton format="numbered-list" icon={<FaListOl />} editor={editor} logger={log} />
            <BlockButton format="bulleted-list" icon={<FaListUl />} editor={editor} logger={log} />
            <LinkButton editor={editor} logger={log} />
            <ImagesButton editor={editor} />
          </ButtonGroup>
          <Overlay show={showColorPicker} placement="bottom" container={() => toolbarRef.current}>
            <MiniColorPicker
              chooseColor={changeColor}
              el={toolbarRef}
              close={() => toggleColorPicker(false)}
            />
          </Overlay>
        </ButtonToolbar>
      </div>
    )
  }

  ToolBar.propTypes = {
    editor: PropTypes.object.isRequired,
    selection: PropTypes.object,
    darkMode: PropTypes.bool,
  }

  const {
    redux,
    pltr: { selectors },
  } = connector

  if (redux) {
    const { connect } = redux

    return React.memo(
      connect((state) => ({
        darkMode: selectors.isDarkModeSelector(state.present),
      }))(ToolBar)
    )
  }

  throw new Error('Could not connect ToolBar')
}

export default UnconnectedToolBar
