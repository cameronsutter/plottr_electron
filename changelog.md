2016-08-22
==========

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

2016-05-15
==========

  * file migration bug
    closes [#48](https://github.com/cameronsutter/plottr_electron/issues/48)
    closes [#50](https://github.com/cameronsutter/plottr_electron/issues/50)
    fix file migrations by finding the right directory that the app is
    installed in
    and build the app into an .asar file to make the build better
    (especially for windows)
  * separate dev & prod more
    use a different key during development to save the recent file in
    localStorage so that those two environments are more separate
  * prune dev dependencies in build
    closes [#49](https://github.com/cameronsutter/plottr_electron/issues/49)

2016-05-13
==========

  * stop building in parallel … for now
    parallel builds were screwing things up
  * bug fix: display file name
    If there was no file name (which shouldn’t happen, but sometimes did
    because of other errors (see last bug)) it would throw an error every
    time you did anything
  * bug fix: windows — can't open files
    It wouldn’t let you open files, it would only prompt you to open a
    folder. This fixes that for windows
  * improved build process
    before i was building to this directory but each time that caused the
    build to get bigger and bigger … that’s bad. Now i’m building to an
    external directory (hardcoded which is bad) which makes the builds much
    much smaller … which is good

2016-05-11
==========

  * fix bug when all windows are closed
    closes [#16](https://github.com/cameronsutter/plottr_electron/issues/16)
    right now this shouldn’t happen, but sometimes things get in a weird
    state with no windows open and if so, you can’t open any files. This
    solves that and also helps us get to being able to support multiple
    open windows
  * remove cards from outline minimap
    closes [#44](https://github.com/cameronsutter/plottr_electron/issues/44)
    the mini outline in the outline view was too cluttered with every card
    there, so now it only shows scenes in favor of a cleaner, hopefully
    more useful mini outline
  * improved about menu
    closes [#25](https://github.com/cameronsutter/plottr_electron/issues/25)
    An envious about menu with credit for the creators

2016-05-10
==========

  * filter by tags/characters/places
    closes [#12](https://github.com/cameronsutter/plottr_electron/issues/12)
    filters cards on the timeline by tags/characters/places. Does not
    filter lines/scenes

2016-05-08
==========

  * pretty print files
    save files with pretty formatted JSON instead of all on one line

2016-05-05
==========

  * update changelog
  * bug fix: files without a version don't update
    if a file didn’t have a version saved in it, they wouldn’t be able to
    update, but I fixed that no prob
  * Bump version to 0.6.0
    closes [#17](https://github.com/cameronsutter/plottr_electron/issues/17)
    updated example file to version 0.6.0
    also adds convenient build script
  * bug: file migrating
    it wasn’t saving the files after updating
    and then it was saving the json directly instead of stringifying it
    first
  * remove userOptions
    removes userOptions everywhere in preparation for doing this
    differently.
    The plan is to save this to a user’s user data storage instead of to
    the plottr file

2016-05-04
==========

  * character colors
    closes [#3](https://github.com/cameronsutter/plottr_electron/issues/3)
    also cleans up a little that was left over from chapters still and some
    places things
  * remove remnants of chapters
  * colors for places
    refs [#3](https://github.com/cameronsutter/plottr_electron/issues/3)
    also removes places/characters from the timeline cards on hover
  * bugfix: open files that are the right version
    refs [#20](https://github.com/cameronsutter/plottr_electron/issues/20)
    Oops … during the migration commit, I caused files of the right version
    to never be opened. This fixes that
  * File migrations frd
    fixes [#20](https://github.com/cameronsutter/plottr_electron/issues/20)
    File migrator and the first migration to v0.6. Subsequent migrations
    will need to follow the pattern of this migration.

2016-04-28
==========

  * minimal on outline view
    closes [#33](https://github.com/cameronsutter/plottr_electron/issues/33)
    shows a mini outline on the right side of the outline view

2016-04-26
==========

  * tag colors
    refs [#3](https://github.com/cameronsutter/plottr_electron/issues/3)
    color choosing and displaying for tags. Improved tag page that shows
    the selected color. Updated example file to have several tags with
    color.

2016-04-20
==========

  * show card tags on hover
    fixes [#11](https://github.com/cameronsutter/plottr_electron/issues/11)
    when the mouse hovers over a card, it shows its tags. You can scroll to
    see the overflow which is kind of janky but I don’t have a better
    solution right now

2016-03-24
==========

  * foundation changes for characters/places/tags
    characters/places/tags are on their own separate navigation item now.
    Functionality is the same and the design on each needs to be improved

2016-03-10
==========

  * changelogs
    fixes [#31](https://github.com/cameronsutter/plottr_electron/issues/31)
    To make a changelog run “npm run changelog”
  * display current file name
    fixes [#30](https://github.com/cameronsutter/plottr_electron/issues/30)

2016-02-11
==========

  * google fonts locally & css improvements
    fixes [#21](https://github.com/cameronsutter/plottr_electron/issues/21)
    the css was loading like 8 times on the page, so i reworked that and
    now it only loads once.
    Moved icons to their own folder
    Downloaded google fonts and now it’s pulling them locally so when you
    don’t have an internet connection Plottr doesn’t take forever to load
  * OS X menu improvements
    fixes [#23](https://github.com/cameronsutter/plottr_electron/issues/23)
    I punted on moving the menu creation to another file because of the
    click functions. I also didn’t separate windows and mac things, so
    windows users may have some non-working menu items.
  * newest file version
  * app category
    fixes [#18](https://github.com/cameronsutter/plottr_electron/issues/18)
  * simple example file

2016-02-09
==========

  * view tags on cards in outline view
    closes [#2](https://github.com/cameronsutter/plottr_electron/issues/2)
  * simple about window (mac)
    refs [#25](https://github.com/cameronsutter/plottr_electron/issues/25)
    adds a simple about window using the built-in mac menu item. Still
    needs more to close this issue
  * windows build :)
    quick and dirty windows build

2016-02-07
==========

  * added electron-json-storage
    refs [#19](https://github.com/cameronsutter/plottr_electron/issues/19)
    this will be used to for user options
  * save with version
    refs [#20](https://github.com/cameronsutter/plottr_electron/issues/20)
    every time the file is saved, it will have the app version on it
  * simple file migration framework
    refs [#20](https://github.com/cameronsutter/plottr_electron/issues/20)
    needs testing before it’s ready

2016-02-04
==========

  * bump version number
  * link to markdown syntax
    help text at the bottom of the description editor to tell you that you
    can format with markdown syntax with a link to the syntax
    closes [#10](https://github.com/cameronsutter/plottr_electron/issues/10)
  * prompt to save
    if you have unsaved changes when you close the window, it will prompt
    you to save.
    closes [#6](https://github.com/cameronsutter/plottr_electron/issues/6)
  * penguin icon :)
    closes [#14](https://github.com/cameronsutter/plottr_electron/issues/14)

2016-01-31
==========

  * delete cards when line or scene is deleted

2016-01-20
==========

  * fixes opening new cards
    fixes [#13](https://github.com/cameronsutter/plottr_electron/issues/13)

2016-01-19
==========

  * change placeholder in all inputs
    fixes [#5](https://github.com/cameronsutter/plottr_electron/issues/5) in more places
  * handle new cards in label editor mode
    fixes [#13](https://github.com/cameronsutter/plottr_electron/issues/13)
  * show dev tools for debugging
    fixes [#7](https://github.com/cameronsutter/plottr_electron/issues/7)

2016-01-18
==========

  * card dialog title text editing
    fixes [#5](https://github.com/cameronsutter/plottr_electron/issues/5)
    when editing a card in the dialog, instead of making the current title
    just a placeholder, it now puts the title in the input box for easy
    editing
  * copy and paste
    fixes [#4](https://github.com/cameronsutter/plottr_electron/issues/4)

2016-01-05
==========

  * fixed bug with editing descriptions

2015-12-22
==========

  * fixed file flow
  * fixed weird tag behavior
  * add,remove tags from cards
  * view tags, characters, places on card
  * edit tags
  * edit places
  * edit characters
  * insert scenes

2015-12-21
==========

  * editing a character
  * cleaned up some css files
  * add new tags
  * add new places
