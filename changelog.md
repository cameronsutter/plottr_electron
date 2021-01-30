# 2018-06-04

- exporter fix
  closes [#238](https://github.com/cameronsutter/plottr_electron/issues/238)
- finish translations
  closes [#234](https://github.com/cameronsutter/plottr_electron/issues/234)

# 2018-05-18

- window for expired free trial

# 2018-05-17

- almost done with translations
  refs [#234](https://github.com/cameronsutter/plottr_electron/issues/234)
- reset line/scene positions
  closes [#233](https://github.com/cameronsutter/plottr_electron/issues/233)
- sort characters and places
  closes [#231](https://github.com/cameronsutter/plottr_electron/issues/231)
  also persists filtering and sorting of characters & places

# 2018-05-15

- update format-message version
  refs [#234](https://github.com/cameronsutter/plottr_electron/issues/234)
- insert all french translations I have
  refs [#234](https://github.com/cameronsutter/plottr_electron/issues/234)

# 2018-05-10

- vertical timeline bug
  refs [#233](https://github.com/cameronsutter/plottr_electron/issues/233)
- finish organizing for translations
  refs [#234](https://github.com/cameronsutter/plottr_electron/issues/234)

# 2018-05-09

- remove menu item to show dev tools

# 2018-05-08

- only on 5 computers
  Plottr can only be used on 5 computers now
- features and problems through freshdesk
  Reporting problems & feature requests will now go through freshdesk.
  There is also FAQ and forums

# 2018-05-03

- translation improvements
- 30 day trial version!
- start the free trial on a empty file
- getting french ready

# 2018-04-26

- remove new file defaults
  closes [#212](https://github.com/cameronsutter/plottr_electron/issues/212)
- buy button in main navigation
  The Buy Full Version button was put in the main navigation. As well as
  removing the ‘autosaving’ alert and changing the ugly orange box around
  the story name to blue and more subtle
- preparation for translations

# 2018-04-13

- character and place filter
  closes [#177](https://github.com/cameronsutter/plottr_electron/issues/177)

# 2018-04-11

- fix empty tags after creation
  closes [#210](https://github.com/cameronsutter/plottr_electron/issues/210)

# 2018-04-10

- only open pltr files in open dialogs
  closes [#224](https://github.com/cameronsutter/plottr_electron/issues/224)
- fix custom attribute add buttons
  closes [#213](https://github.com/cameronsutter/plottr_electron/issues/213)
- fix open_file mixpanel event

# 2018-03-01

- update changelog

# 2018-02-25

- change free trial discount wording
- dark mode finale
  color picker, card dialog, custom attributes

# 2018-02-19

- dark mode part 2
  everything in dark mode except:
  - card dialog
  - color picker
  - custom attributes
- story name improvements
  LTUE priority
- card creation (look and interaction)
  LTUE priority
- save and close button in card dialog
  LTUE priority
- fix description dialog on card drag
  LTUE priority
- make custom attributes dialog easier to use
  LTUE discovery

# 2018-02-13

- fixed major issue
  dark mode was being sent to the renderer process too early and it was
  causing data loss in the file

# 2018-02-08

- fix env file writing
- fix dotenv config syntax error

# 2018-02-05

- hopefully fixed env vars
- another stab at fixing env vars
- fix env vars writing
  the .env isn’t being created at build
- another shot at appveyor builds
- change appveyor
  using appveyor UI for now to achieve matrix build
- appveyor config tweak
- fix env variables

# 2018-02-01

- dark mode part 1
  dark mode core
  timeline dark mode
- fix menu and font
  font size increase made navigation not look good. And the Plottr menu
  was missing things

# 2018-01-15

- larger, darker fonts
  refs [#163](https://github.com/cameronsutter/plottr_electron/issues/163)
  refs [#174](https://github.com/cameronsutter/plottr_electron/issues/174)
  refs [#202](https://github.com/cameronsutter/plottr_electron/issues/202)

# 2017-12-12

- remove buy button from full version
- small bug fix

# 2017-12-10

- Buy full version from trial
  Allows you to buy the full version right from the free trial

# 2017-12-04

- save on blur
  refs [#182](https://github.com/cameronsutter/plottr_electron/issues/182)
  everything saves when you navigate away from it
- attachments in the doc export
  closes [#183](https://github.com/cameronsutter/plottr_electron/issues/183)

# 2017-11-27

- fix windows opening
  closes [#189](https://github.com/cameronsutter/plottr_electron/issues/189)
  - windows should open files when double-clicked
  - mac/windows should save new files when first created
- more tests
  refs [#189](https://github.com/cameronsutter/plottr_electron/issues/189)
- a test
  refs [#189](https://github.com/cameronsutter/plottr_electron/issues/189)
  testing a fix for a windows bug where files won’t open

# 2017-10-31

- workflow improvements
  closes [#170](https://github.com/cameronsutter/plottr_electron/issues/170)
  also saves a card/line/scene on blur in some cases
- small bug fixes
  closes [#166](https://github.com/cameronsutter/plottr_electron/issues/166)
  fix misspelling of environment for rollbar
  fix open/new dialog disappearing on windows

# 2017-10-12

- stupid fix
- fixes
  - save error report to Documents instead of home
  - fix trial mode display in Navigation
- more bug fixes
- bug fixes
  - handle no notes/characters/places (deleting them all)
  - home path for windows
- ummmm ... forgot to save to package json
  somehow forgot to add electron-log to the package.json file

# 2017-10-11

- error reporting
  Better error reporting
  - generate a detailed error report file to email to me
  - log all errors to file as well as send to Rollbar
- fix scrolling
  fast scrolling shouldn’t break so easily
- small fixes
  - don’t migrate if there is no migration
  - fix navigation in trial mode
  - update tour/examples to current version

# 2017-10-10

- show not saving in trial mode
  display that trial mode is not saving the file
- track open files
  closes [#162](https://github.com/cameronsutter/plottr_electron/issues/162)
- file fixer
  closes [#160](https://github.com/cameronsutter/plottr_electron/issues/160)

# 2017-10-09

- small bug fixes
- verify view improvements
- disable_all_events error
  init tracker in each window

# 2017-10-08

- sort characters & places
  closes [#156](https://github.com/cameronsutter/plottr_electron/issues/156)
  closes [#157](https://github.com/cameronsutter/plottr_electron/issues/157)
  sort characters, places, & tags alphabetically
- fix open/create windows problem
  stop windows from quitting after it asked to open or create
- small improvements to error reporting

# 2017-10-05

- send errors as production environment
  - set rollbar error environment to production when not in dev
  - add some extra info to rollbar errors
- don't allow autosave in trial
  stop the free trial from auto-saving
- fix last minute critical bugs
  - adding a scene
  - deleting notes/cards with attached places/characters
  - doc exporter
  - confirmation before deletion of characters/notes/places/tags

# 2017-10-04

- remove code
  remove the comments and extra errors that i was using to diagnose the
  windows verification workflow
- fix verification workflow on windows
  This is just an attempt, but I think the problem was happening because
  the verification window would close before any other window would open.
  On Windows when the last window is closed, the app quits.
  So now it’s tracking whether it’s in the verification workflow or not.
  If it is, the app doesn’t quit when all windows are closed.
- diagnose verification on windows
- fixed the json issue hopefully

# 2017-10-03

- ok this time will send errors
- okay this time actually send errors
- actually send errors
  sending errors the right way so i can see what’s happening in windows
  on verification
- diagnose on windows
- diagnose verification workflow
  try to figure out what is happening on windows
- fix verification workflow
  i forgot something in the last commit
- try to fix verification workflow
  verification works, but on windows Plottr doesn’t open after the
  verification.

# 2017-10-02

- fix license verification
  license verification wasn’t working

# 2017-10-01

- build to turn back on license verification
  closes [#22](https://github.com/cameronsutter/plottr_electron/issues/22)
- Revert "Revert "Turn on license verification""
  This reverts commit d5f393ffe7c75381e4cd221ef6bb92bc810c99d3.

# 2017-09-26

- remove fsevents as a dependency
  refs [#22](https://github.com/cameronsutter/plottr_electron/issues/22)
  removed fsevents as a dependency. In development, make sure it’s
  installed, but don’t add it to list of dependencies (I know that’s
  weird, but it makes wepback take so much less CPU)
- performance improvements 3
  closes [#150](https://github.com/cameronsutter/plottr_electron/issues/150)
  stop history (undo) from loading the localStorage at every prop change
  MAIN PROBLEM: stop the infinite loop between the saver and the action
  that told the store it had been saved
- performance improvements 2
  refs [#150](https://github.com/cameronsutter/plottr_electron/issues/150)
  component should update
- performance improvements
  refs [#150](https://github.com/cameronsutter/plottr_electron/issues/150)
  stop binding callbacks in the render functions everywhere

# 2017-09-24

- secret discount for the free trial

# 2017-09-21

- bug fixes
  A few small bug fixes:
  1.0 migrator (add a note, not just an empty array)
  allow removing values while editing characters/places
- menu improvements
  add separators, add opening the tour, add ellipses (…) where it makes
  sense
- fix tour file
  update the tour file to the right version, and make improvements
  because of new features

# 2017-09-19

- installer builds mark 20
  refs [#22](https://github.com/cameronsutter/plottr_electron/issues/22)
  trial mode should work
  (no license verification)
- installer builds mark 19
  refs [#22](https://github.com/cameronsutter/plottr_electron/issues/22)
  (trial version test, no license verification)
- installer build fixes (no real build)
  refs [#22](https://github.com/cameronsutter/plottr_electron/issues/22)
  (no license verification, put back default ignores, turn on asar, trial
  mode doesn’t work)
- installer builds mark 18
  refs [#22](https://github.com/cameronsutter/plottr_electron/issues/22)
  (file extension change to .pltr, trial mode on about window, icon fix
  on mac, no asar to test default ignores)

# 2017-09-18

- installer builds mark 17
  refs [#22](https://github.com/cameronsutter/plottr_electron/issues/22)
  about window is fixed
  attempting fix for mac icons
- installer builds mark 16
  refs [#22](https://github.com/cameronsutter/plottr_electron/issues/22)
  (no license verification, but attempting windows trial build)
- installer builds mark 15
  refs [#22](https://github.com/cameronsutter/plottr_electron/issues/22)
  (no windows trial build. Must do that separately)

# 2017-09-08

- installer builds mark 14
  refs [#22](https://github.com/cameronsutter/plottr_electron/issues/22)
- installer builds mark 13
  refs [#22](https://github.com/cameronsutter/plottr_electron/issues/22)
- installer builds mark 12
  refs [#22](https://github.com/cameronsutter/plottr_electron/issues/22)
- installer builds mark 11
  refs [#22](https://github.com/cameronsutter/plottr_electron/issues/22)
- installer builds mark 10
  refs [#22](https://github.com/cameronsutter/plottr_electron/issues/22)
- installer build mark 9
  refs [#22](https://github.com/cameronsutter/plottr_electron/issues/22)

# 2017-09-07

- builds mark 8
  refs [#22](https://github.com/cameronsutter/plottr_electron/issues/22)
- builds mark 7
  refs [#22](https://github.com/cameronsutter/plottr_electron/issues/22)
- get the builds right
  refs [#22](https://github.com/cameronsutter/plottr_electron/issues/22)
- Revert "Turn on license verification"
  This reverts commit 32b75208916a101e70963c292a210b155f91dbfb.
- improve builds yet again
  refs [#22](https://github.com/cameronsutter/plottr_electron/issues/22)
- improve builds again
  refs [#22](https://github.com/cameronsutter/plottr_electron/issues/22)
- improved builds
  refs [#22](https://github.com/cameronsutter/plottr_electron/issues/22)
- small fixes to get installers working
  refs [#22](https://github.com/cameronsutter/plottr_electron/issues/22)

# 2017-09-06

- new icons!
  refs [#22](https://github.com/cameronsutter/plottr_electron/issues/22)
  Remaining work: About window & Trial mode

# 2017-08-31

- link tags in card descriptions
  closes [#57](https://github.com/cameronsutter/plottr_electron/issues/57)

# 2017-08-30

- fix export cancel bug
  when you hit cancel after clicking export, it threw an exception

# 2017-08-28

- fix when it says 'everything saved'
  sometimes it didn’t say everything was saved, but only because the diff
  of what had changed was actually nothing. Now it shows that everything
  was saved if there was nothing to save
- display the number of scenes
  closes [#62](https://github.com/cameronsutter/plottr_electron/issues/62)
  shows the number of scenes in the minimap of the outline, on hover over
  the scenes in the timeline, and while editing a scene name

# 2017-08-17

- color picker improvements
  closes [#143](https://github.com/cameronsutter/plottr_electron/issues/143)
