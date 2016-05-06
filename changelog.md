2016-05-05
==========

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
  * add characters
  * display notes
  * fixed hover-over options for story lines disappearing

2015-12-20
==========

  * basic outline view
  * beginnings of outline
  * reorganized stuff
    also fixed story line drag n drop bug
  * delete card
  * delete scenes
  * delete story line
  * line drag n drop

2015-12-10
==========

  * moved scene hover options up 1 pixel
  * editing line title and color
    also glyphicon plus for new lines and new scenes. Changed cursor to
    indicate drag’n’drop
  * increased the default size of the window
  * changed default line to say 'Story Line'
  * fixed story name editing
  * remove slides from navigation
  * better hover options

2015-12-09
==========

  * changed some function names
  * scene drag n drop
  * drag and drop cards

2015-11-26
==========

  * changed cursor on hover over scenes
  * create a new card
  * edit cards in dialog

2015-11-25
==========

  * change line/scene from card dialog
    also improved look of card dialog

2015-11-23
==========

  * card dialog title
  * mark down rendering of card description
  * better storyName editing
  * edit scene title
  * fix hover buttons over scenes
  * new menu item: reload
  * hover buttons that do nothing and don't disappear
  * open a file
    did some clean up of the interactions with localStorage

2015-11-22
==========

  * start a new file
  * cleaned up classes
  * add new line
  * fixed saving bug
    It was always behind by one change
  * unsaved changes label on the top right
  * organized initial states
  * add a new scene
    also: render scenes in order of position
  * ignore dist directory for distribution

2015-11-19
==========

  * build!
  * bootstrap'd button
  * close card dialog
  * open a card
  * really did gitignore for bundle js file
  * gitignore the bundle js file
  * edit story name

2015-11-18
==========

  * restart
    Removed all old code which was branched into a new branch called
    old-app. Inserted new app completely done from electron/react/redux

2015-10-15
==========

  * work on getting webpack more stable
  * board is loading!
