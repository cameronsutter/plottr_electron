2017-04-10
==========

  * Merge pull request [#106](https://github.com/cameronsutter/plottr_electron/issues/106) from cameronsutter/dev
    Fix zoom popover effect scale

2017-04-09
==========

  * Fix zoom popover effect scale
    fixes: [#70](https://github.com/cameronsutter/plottr_electron/issues/70)

2017-03-29
==========

  * show what cards a place is attached to
  * custom attributes for places
  * redesign the place tab
  * show what cards a character is attached to
    closes [#68](https://github.com/cameronsutter/plottr_electron/issues/68)
  * better ellipses on cards
    closes [#92](https://github.com/cameronsutter/plottr_electron/issues/92)
    the small cards on the timeline stop the text at the appropriate time
    and show an ellipsis instead of running out of the box

2017-03-16
==========

  * increase font size in card description editor
    closes [#76](https://github.com/cameronsutter/plottr_electron/issues/76)

2017-03-15
==========

  * fix recent files bugs
    Fix these 2 behaviors that weren’t working:
    1) when a file no longer exists but is in the recent files key, handle
    not trying to open that gracefully and ask the user to open or create a
    file.
    2) when a window is closed and there are other windows open, remove
    that window from the recent files key and put in one of the other
    windows
  * ability to take screenshots
  * filter outline by storyline
    closes [#97](https://github.com/cameronsutter/plottr_electron/issues/97)

2017-03-14
==========

  * editable outline view
    closes [#98](https://github.com/cameronsutter/plottr_electron/issues/98)
  * put outline minimap on left side
    closes [#103](https://github.com/cameronsutter/plottr_electron/issues/103)
  * improve label padding on card dialog
    closes [#37](https://github.com/cameronsutter/plottr_electron/issues/37)

2017-03-13
==========

  * fixed card dialog editing bug
    tags no longer disappear when a card is in editing mode
  * card dialog makeover
    closes [#99](https://github.com/cameronsutter/plottr_electron/issues/99)

2017-03-05
==========

  * better initial state for new files
    closes [#59](https://github.com/cameronsutter/plottr_electron/issues/59)
  * track timeline orientation
    when an event is registered, track what timeline orientation they are in
  * improvements to the color picker
    colors don’t say a name anymore except on the title (hover over), they
    are just a square of that color
  * fix scrolling
    no longer scrolls in the background when using the arrow keys to edit
    text
  * better windows & mac handling
    closes [#65](https://github.com/cameronsutter/plottr_electron/issues/65)
    Can now create and open files in windows/mac without cross-platform
    problems.
    Improved handling of workflow when migrating files
  * only primary buttons have colors
    closes [#95](https://github.com/cameronsutter/plottr_electron/issues/95)
  * more branding
    improvement to css text classes

2017-03-01
==========

  * display custom character attributes
    refs [#41](https://github.com/cameronsutter/plottr_electron/issues/41)
    Redesign the character page. Display and edit custom character
    attributes
  * reworking UI
    first step in reworking the UI — colors
  * custom character attributes
    refs [#41](https://github.com/cameronsutter/plottr_electron/issues/41)
    add custom attributes

2017-02-23
==========

  * press esc to cancel editing
    refs [#78](https://github.com/cameronsutter/plottr_electron/issues/78)
    characters, places, tags, story lines, scenes
  * click to edit scenes, lines, cards
    closes [#94](https://github.com/cameronsutter/plottr_electron/issues/94)
  * card dialog editing
    closes [#78](https://github.com/cameronsutter/plottr_electron/issues/78)
    refs [#94](https://github.com/cameronsutter/plottr_electron/issues/94)
  * vertical timeline scrolling
    refs [#96](https://github.com/cameronsutter/plottr_electron/issues/96)
    fixes scrolling when in vertical orientation
  * vertical timeline
    closes [#96](https://github.com/cameronsutter/plottr_electron/issues/96)
    adds a button on the timeline to flip the orientation from horizontal
    to vertical

2017-02-21
==========

  * better workflows for characters/places/tags
    closes [#38](https://github.com/cameronsutter/plottr_electron/issues/38)
    characters/places/tags now can be edited as soon as adding a new one
    and the user can hit Enter after editing the title/name to finish
    editing
  * better workflow for adding lines
    refs [#38](https://github.com/cameronsutter/plottr_electron/issues/38)
    adding lines goes right into editing the title
  * better workflow for adding scenes
    refs [#38](https://github.com/cameronsutter/plottr_electron/issues/38)
    adding scenes is much more smooth now
  * better workflow for adding a card
    refs [#38](https://github.com/cameronsutter/plottr_electron/issues/38)
    adding a card is much smoother and requires less clicks
  * fix migration issue

2017-02-20
==========

  * autosave every change
    closes [#74](https://github.com/cameronsutter/plottr_electron/issues/74)
    no longer autosaves on a 5 minute interval. Instead it saves after
    every change
  * production build handling

2016-10-03
==========

  * update changelog

2016-10-02
==========

  * bump minor version number
  * [mac] associate .plottr with Plottr
    refs [#28](https://github.com/cameronsutter/plottr_electron/issues/28)
    on macOS, the .plottr files will have a cool Plottr icon and you can
    open Plottr by double clicking them

2016-09-29
==========

  * trial version
    closes [#42](https://github.com/cameronsutter/plottr_electron/issues/42)
    enables a trial version build

2016-09-27
==========

  * open tour file on first use
    refs [#42](https://github.com/cameronsutter/plottr_electron/issues/42)

2016-09-25
==========

  * migration for 0.8
    start a migrator file for 0.8 which adds notes to places/characters
  * open markdown help in a real browser
    fixes [#67](https://github.com/cameronsutter/plottr_electron/issues/67)
  * improve role descriptions
    improve the description of our roles in the Creators section of the
    about window
  * fix bug reporting
    fixes [#85](https://github.com/cameronsutter/plottr_electron/issues/85)
    removes the insecure call to github and instead reports bugs in a more
    secure way
  * decrease build size
    refs [#64](https://github.com/cameronsutter/plottr_electron/issues/64)
    by making a common bundle and minifying the js files for production,
    the builds should be smaller :)
  * Merge pull request [#89](https://github.com/cameronsutter/plottr_electron/issues/89) from cameronsutter/dev
    Dev: Issue 69 fix

2016-09-20
==========

  * Add Notes field to Character and Settings
    Fixes Issue [#69](https://github.com/cameronsutter/plottr_electron/issues/69)
    Additionally:
    * Changes "character description" label to say "Short Description"
    * Changes "place description" label to say "Short Description"
    * Changes "character name" label to say "Name"
    * Changes "character description" label to say "Short Description"
    * Fixes spelling error for Jon Willesen's name on About page
    * Adds dev to Steve Shepherd's credits
  * Changes:
    * Updated
  * report a bug
    closes [#26](https://github.com/cameronsutter/plottr_electron/issues/26)
    Now you can report a bug or request a feature

2016-09-18
==========

  * improve startup time
  * optimize build

2016-09-16
==========

  * verify licenses
    closes [#27](https://github.com/cameronsutter/plottr_electron/issues/27)
    I had to reorganize the whole project to get this to work, mainly to
    get webpack to play nicely but it’s better as a result

2016-09-12
==========

  * track usage
    closes [#39](https://github.com/cameronsutter/plottr_electron/issues/39)
    tracks simple actions (when online) so that we can measure engagement
    with Plottr. No
    story data is tracked/captured/transferred

2016-08-31
==========

  * cleanup from multiple windows
    fixes [#71](https://github.com/cameronsutter/plottr_electron/issues/71)
    after a migration it will say that there are unsaved changes.
  * multiple windows
    closes [#15](https://github.com/cameronsutter/plottr_electron/issues/15)
    More than one window open at a time

2016-08-29
==========

  * remove unnecessary glyphicon fonts

2016-08-28
==========

  * bug fix: new files
    fixes [#66](https://github.com/cameronsutter/plottr_electron/issues/66)

2016-08-23
==========

  * fix a few bugs
    node-sass needed to be updated, opening files wasn’t working, and the
    about window wasn’t showing.
    bumped build number
  * fix build … again
    also started a js build script that isn’t currently working, but it
    will be useful in the future

2016-08-22
==========

  * update changelog
  * bump version number to 0.7.0

2016-08-16
==========

  * fix build size
    get the build back down to a good size. It was up past 200MB and now
    it’s back around 60MB

2016-08-15
==========

  * copy/paste right-click menu
    closes [#9](https://github.com/cameronsutter/plottr_electron/issues/9)

2016-08-08
==========

  * better color picker for storylines
    closes [#36](https://github.com/cameronsutter/plottr_electron/issues/36)
    changing colors for storylines is no longer a pain. It’s fun and
    there’s so many choices
  * click to zoom in
    closes [#29](https://github.com/cameronsutter/plottr_electron/issues/29)
    when zoomed out, click on a card to zoom into that location
  * bug: storyline color editing
    changing the color of storylines was impossible because of this bug
  * finish undo/redo
    closes [#8](https://github.com/cameronsutter/plottr_electron/issues/8)
    every action has a helpful details view in the undo menu

2016-08-07
==========

  * ignore change_current_view actions
    change_current_view actions now don’t prompt the user that there are
    unsaved changes
  * autosave
    closes [#19](https://github.com/cameronsutter/plottr_electron/issues/19)
  * fix build

2016-08-04
==========

  * bump version number to 0.6.5
  * undo/redo
    refs [#8](https://github.com/cameronsutter/plottr_electron/issues/8)
    the last piece that is still missing is showing details of changes for
    most actions such as editing scene names, changing the position of
    cards, etc.
  * upgrade redux

2016-08-02
==========

  * groundwork for undo/redo
    refs [#8](https://github.com/cameronsutter/plottr_electron/issues/8)
    middleware to track changes, basic UI to see changes, no functionality
    … it’s almost in a broken state. Had to break to update redux

2016-07-31
==========

  * fix subnav styles
  * change icon
    icon may change again, but a new icon/logo to try out
  * move the filter button
    functionality remains the same, but now it’s on the subnav bar instead
    of in the timeline

2016-07-28
==========

  * faster scrolling
    closes [#43](https://github.com/cameronsutter/plottr_electron/issues/43)
    scroll buttons in the subnav menu and keyboard shortcuts to scroll
    around faster
  * simple zoom in and out
    refs [#29](https://github.com/cameronsutter/plottr_electron/issues/29)
    lets you zoom in and out, fit the whole plot in the view, and reset
    back to normal zoom
  * upgrade to Electron 1.3
    closes [#55](https://github.com/cameronsutter/plottr_electron/issues/55)
    Fixed incompatibilities with older versions … hopefully I got
    everything.
    Added Devtron & React to Chrome devTools

2016-07-27
==========

  * sub navigation menu
    non-functional menu buttons
  * fixed build script
    I had accidentally commented out some important parts of the build
    script

2016-05-30
==========

  * some rebranding
    changing the font of the word Plottr in the about menu
  * improved build
    the zipped OS X version of Plottr was always much bigger with the new
    build script than before. To fix this, I  made the script compress it
    to a .dmg instead of a .zip which is slightly more annoying but much
    smaller

2016-05-29
==========

  * bug: didn't ask to save
    fixes [#40](https://github.com/cameronsutter/plottr_electron/issues/40)
    and a lot more error possibilities

2016-05-25
==========

  * bug: displaying cards
    fixed how it does children ids for great justice … and an addition to
    the migration … and bumped build version number
  * show labels in card description
    Now if you type a character/place/tag within two curly braces (e.g.
    {{coolDude}}) in the card description, it will render with a label of
    that color

2016-05-24
==========

  * better build script
    all but the uploading is done automatically with one command

2016-05-18
==========

  * color line labels
    closes [#45](https://github.com/cameronsutter/plottr_electron/issues/45)
    also adds a cool little colored square to the outline minimap for each
    line with a card in that scene
  * remove unneeded extra example file
    oops, didn’t mean to commit this
  * bug: dragging and dropping the first card
    fixes [#34](https://github.com/cameronsutter/plottr_electron/issues/34)
    The first card in a new file wouldn’t drag anywhere, but after a good
    whipping it’s behaving well again
  * clean up chapters
    once and for all clean up remnants of chapters. Also did a little bit
    of cleanup around new ids for most objects
  * bug: change lines/scenes in card dialog
    fixes [#47](https://github.com/cameronsutter/plottr_electron/issues/47)
  * show color for character/place labels in card dialog
    closes [#53](https://github.com/cameronsutter/plottr_electron/issues/53)
  * bug: about menu - version undefined
    fixes [#56](https://github.com/cameronsutter/plottr_electron/issues/56)

2016-05-17
==========

  * bug: choosing "none" tag/character/place in card edit
    fixes [#54](https://github.com/cameronsutter/plottr_electron/issues/54)
    this also fixes choosing tags/characters/places when creating a card.
  * bug: outline minimap overlapping cards
    closes [#52](https://github.com/cameronsutter/plottr_electron/issues/52)
    outline minimap no longer overlaps cards when you resize the window
