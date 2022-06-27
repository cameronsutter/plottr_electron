import React, { useState, useEffect, useCallback } from 'react'
import PropTypes from 'react-proptypes'
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

import ButtonGroup from '../ButtonGroup'
import ButtonToolbar from '../ButtonToolbar'
import UnconnectedFloater from '../PlottrFloater'
import IndentParagraphButton from './IndentParagraphButton'
import DedentParagraphButton from './DedentParagraphButton'
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
  const Floater = UnconnectedFloater(connector)

  const {
    platform: { os, log, isDevelopment },
  } = connector
  checkDependencies({ os, log, isDevelopment })

  const boldIcon = <FaBold />
  const italicIcon = <FaItalic />
  const underlineIcon = <FaUnderline />
  const strikeThroughIcon = <FaStrikethrough />

  const ToolBar = ({ editor, darkMode }) => {
    const [showColorPicker, toggleColorPicker] = useState(false)
    const [fonts, setFonts] = useState(null)
    const [recentFonts, setRecentFonts] = useState(null)

    const changeColor = useCallback(
      (color) => {
        addColorMark(editor, color)
        toggleColorPicker(false)
      },
      [toggleColorPicker]
    )

    useEffect(() => {
      if (!fonts) setFonts(getFonts(os()))
      if (!recentFonts) setRecentFonts(getRecent())
    }, [])

    const closeColorPicker = useCallback(() => {
      toggleColorPicker(false)
    }, [toggleColorPicker])

    const miniColorPickerOverlay = () => {
      return <MiniColorPicker chooseColor={changeColor} close={closeColorPicker} />
    }

    return (
      <div className={cx('slate-editor__toolbar-wrapper', { darkmode: darkMode })}>
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
            <MarkButton mark="bold" icon={boldIcon} editor={editor} logger={log} />
            <MarkButton mark="italic" icon={italicIcon} editor={editor} logger={log} />
            <MarkButton mark="underline" icon={underlineIcon} editor={editor} logger={log} />
            <MarkButton mark="strike" icon={strikeThroughIcon} editor={editor} logger={log} />
            <Floater
              component={miniColorPickerOverlay}
              open={showColorPicker}
              placement="bottom"
              hideArrow
              rootClose
              onClose={closeColorPicker}
            >
              <ColorButton
                toggle={() => toggleColorPicker(!showColorPicker)}
                editor={editor}
                logger={log}
              />
            </Floater>
            <BlockButton format="heading-one" icon={t('Title')} editor={editor} logger={log} />
            <BlockButton format="heading-two" icon={t('Subtitle')} editor={editor} logger={log} />
            <BlockButton format="block-quote" icon={<FaQuoteLeft />} editor={editor} logger={log} />
            <BlockButton format="numbered-list" icon={<FaListOl />} editor={editor} logger={log} />
            <BlockButton format="bulleted-list" icon={<FaListUl />} editor={editor} logger={log} />
            {isDevelopment ? (
              <>
                <IndentParagraphButton editor={editor} logger={log} />
                <DedentParagraphButton editor={editor} logger={log} />
              </>
            ) : null}
            <LinkButton editor={editor} logger={log} />
            <ImagesButton editor={editor} />
          </ButtonGroup>
        </ButtonToolbar>
      </div>
    )
  }

  ToolBar.propTypes = {
    editor: PropTypes.object.isRequired,
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
