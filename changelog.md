2016-03-10
==========

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
